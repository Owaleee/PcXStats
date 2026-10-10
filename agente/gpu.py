"""Leitura de GPU por contadores PDH, com nomes e filtro de software via DXGI."""

import math
import re
import time

import win32pdh

from adaptadores_gpu import listar_adaptadores_gpu


def capturar_amostras_gpu():
    consulta = win32pdh.OpenQuery()
    try:
        contador = win32pdh.AddEnglishCounter(
            consulta,
            r"\GPU Engine(*)\Utilization Percentage",
        )
        win32pdh.CollectQueryData(consulta)
        time.sleep(1)
        win32pdh.CollectQueryData(consulta)
        valores = win32pdh.GetFormattedCounterArray(
            contador, win32pdh.PDH_FMT_DOUBLE,
        )
        return [
            {"InstanceName": nome, "CookedValue": uso}
            for nome, uso in valores.items()
        ]
    finally:
        win32pdh.CloseQuery(consulta)


def resumir_uso_gpu(amostras):
    # O nome vem do mesmo LUID; nao associamos placas pela ordem das listas.
    adaptadores = listar_adaptadores_gpu()
    placas = {}
    nomes = {}
    padrao = (
        r"^pid_\d+_luid_(0x[0-9a-f]+_0x[0-9a-f]+)"
        r"_phys_(\d+)_eng_(\d+)_engtype_.+$"
    )

    for amostra in amostras:
        partes = re.match(padrao, amostra["InstanceName"], re.IGNORECASE)
        uso = amostra["CookedValue"]
        if partes is None or not math.isfinite(uso) or uso < 0:
            continue

        luid, fisica, motor = partes.groups()
        luid = luid.lower()
        if luid not in adaptadores:
            # Adaptador de software, removido, ou sem identificacao DXGI atual.
            continue

        identificador = f"luid_{luid}_phys_{fisica}"
        if identificador not in placas:
            placas[identificador] = {}
            nomes[identificador] = adaptadores[luid]

        motores = placas[identificador]
        motores[motor] = motores.get(motor, 0) + uso

    resultado = []
    for identificador, motores in sorted(placas.items()):
        percentual = min(100.0, max(motores.values()))
        resultado.append({
            "id": identificador,
            "name": nomes[identificador],
            "usage_percent": round(percentual, 2),
        })
    return resultado


if __name__ == "__main__":
    gpus = resumir_uso_gpu(capturar_amostras_gpu())
    if not gpus:
        print("Leitura de GPU indisponivel.")
    else:
        for gpu in gpus:
            print(f"GPU: {gpu['name']}")
            print(f"Uso da GPU: {gpu['usage_percent']:.2f}%")
            print()
