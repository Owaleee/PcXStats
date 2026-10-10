"""Agente didático do PC Stats: executar no PC Windows monitorado."""

import os
import secrets
from datetime import datetime, timezone

import psutil
from fastapi import Depends, FastAPI, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, Field


TOKEN = os.environ.get("PCSTATS_TOKEN", "")
if len(TOKEN) < 32 or not TOKEN.isascii():
    raise RuntimeError("Defina PCSTATS_TOKEN com pelo menos 32 caracteres ASCII.")

DISK_ROOT = os.environ.get("SystemDrive", "C:") + "\\"
GIB = 1024 ** 3

app = FastAPI(title="PC Stats", version="0.1.0")
bearer = HTTPBearer(auto_error=False)


class Stats(BaseModel):
    cpu_percent: float = Field(ge=0, le=100)
    ram_percent: float = Field(ge=0, le=100)
    ram_used_gib: float = Field(ge=0)
    ram_total_gib: float = Field(gt=0)
    disk_percent: float = Field(ge=0, le=100)
    disk_used_gib: float = Field(ge=0)
    disk_total_gib: float = Field(gt=0)
    sampled_at: datetime


def require_token(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
) -> None:
    if credentials is None or not secrets.compare_digest(
        credentials.credentials.encode("utf-8"), TOKEN.encode("utf-8")
    ):
        raise HTTPException(
            status_code=401,
            detail="Chave de acesso inválida ou ausente.",
            headers={"WWW-Authenticate": "Bearer"},
        )


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/stats", response_model=Stats, dependencies=[Depends(require_token)])
def stats():
    # A janela de 0,2 s evita a primeira leitura sem referência de interval=None.
    # Esta rota usa def: FastAPI executa a função síncrona em uma thread.
    cpu = psutil.cpu_percent(interval=0.2)
    ram = psutil.virtual_memory()
    disk = psutil.disk_usage(DISK_ROOT)

    # Memória em uso = total - disponível. Pode diferir de outros monitores.
    return Stats(
        cpu_percent=cpu,
        ram_percent=ram.percent,
        ram_used_gib=round((ram.total - ram.available) / GIB, 2),
        ram_total_gib=round(ram.total / GIB, 2),
        disk_percent=disk.percent,
        disk_used_gib=round(disk.used / GIB, 2),
        disk_total_gib=round(disk.total / GIB, 2),
        sampled_at=datetime.now(timezone.utc),
    )
