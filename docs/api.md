# API local do PcX Control

Implementação: `agente/main.py`. Porta usada pelo aplicativo: `8000`.

## Endpoints

| Método | Caminho | Autenticação | Finalidade |
| --- | --- | --- | --- |
| GET | `/health` | Não | Verificar se o agente responde |
| GET | `/stats` | Bearer token | Coletar e devolver as métricas |
| GET | `/docs` | Não | Documentação interativa do FastAPI; só existe se o agente for iniciado com `PCSTATS_DOCS=1` |

## Autenticação

A variável de ambiente `PCSTATS_TOKEN` deve ser definida antes de iniciar o servidor. O agente recusa iniciar se ela não tiver pelo menos 32 caracteres ASCII.

O cliente envia a chave no cabeçalho:

```http
Authorization: Bearer SUA_CHAVE
```

`SUA_CHAVE` é um marcador ilustrativo, não uma chave válida. A comparação é feita com `secrets.compare_digest` sobre bytes. A verificação ocorre antes de coletar as métricas.

Sem chave ou com chave incorreta, `/stats` responde **401** e inclui `WWW-Authenticate: Bearer`.

```json
{
  "detail": "Chave de acesso inválida ou ausente."
}
```

O token fixo por sessão atende ao protótipo local. Não há cadastro, contas de usuários, permissões por usuário ou renovação automática de tokens. HTTP não protege o token contra observação do tráfego na rede.

## GET /health

Resposta **200**:

```json
{
  "status": "ok"
}
```

O endpoint confirma que o agente está acessível; ele não realiza a coleta completa e não comprova que a GPU está disponível.

## GET /stats

Resposta **200**, com valores ilustrativos:

```json
{
  "cpu_percent": 12.4,
  "ram_percent": 50.0,
  "ram_used_gib": 8.0,
  "ram_total_gib": 16.0,
  "disk_percent": 60.0,
  "disk_used_gib": 300.0,
  "disk_total_gib": 500.0,
  "sampled_at": "2026-10-10T12:00:00Z",
  "gpus": [
    {
      "id": "luid_0x00000000_0x00000001_phys_0",
      "name": "NVIDIA GeForce RTX 3070",
      "usage_percent": 3.26
    }
  ],
  "gpu_error": null
}
```

O identificador do exemplo é fictício. O aplicativo usa o `id` para distinguir os itens e o `name` para mostrar o nome ao usuário.

| Campo | Tipo JSON | Significado |
| --- | --- | --- |
| `cpu_percent` | número, 0–100 | Amostra do uso total de CPU |
| `ram_percent` | número, 0–100 | Percentual informado pelo psutil |
| `ram_used_gib` | número, ≥ 0 | RAM total menos RAM disponível, em GiB |
| `ram_total_gib` | número, > 0 | RAM total, em GiB |
| `disk_percent` | número, 0–100 | Percentual de espaço ocupado na unidade do Windows |
| `disk_used_gib` | número, ≥ 0 | Espaço ocupado nessa unidade, em GiB |
| `disk_total_gib` | número, > 0 | Capacidade total dessa unidade, em GiB |
| `sampled_at` | string ISO 8601 | Horário UTC gerado ao final da coleta |
| `gpus` | lista de objetos | Adaptadores com leitura e identificação disponíveis |
| `gpu_error` | string ou null | Aviso quando não há uma leitura utilizável de GPU |

Cada item de `gpus` contém `id`, `name` e `usage_percent`, este último entre 0 e 100. GiB equivale a `1024 ** 3` bytes. A métrica de disco mede ocupação de armazenamento, não atividade de leitura/escrita.

O horário é gerado em UTC no PC e formatado no horário local do celular. CPU e GPU são amostradas em sequência; os campos não representam uma captura instantânea perfeitamente simultânea.

## Quando a GPU não está disponível

Uma falha de GPU é tratada separadamente. A resposta pode continuar sendo **200**, com CPU, RAM e disco disponíveis:

```json
{
  "cpu_percent": 12.4,
  "ram_percent": 50.0,
  "ram_used_gib": 8.0,
  "ram_total_gib": 16.0,
  "disk_percent": 60.0,
  "disk_used_gib": 300.0,
  "disk_total_gib": 500.0,
  "sampled_at": "2026-10-10T12:00:00Z",
  "gpus": [],
  "gpu_error": "Não foi possível consultar a GPU."
}
```

Se a coleta terminar sem adaptadores utilizáveis, a mensagem é `Leitura de GPU indisponível neste PC.`. Esse comportamento não significa que toda falha do agente é tratada: erros fora do bloco de GPU ainda podem resultar em erro do servidor.

## Consultar pelo PowerShell

Com o agente executando, abra outro PowerShell. Para um teste no próprio PC:

```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:8000/health"
```

Para consultar `/stats`, informe a mesma chave usada pelo agente nesse novo terminal:

```powershell
$env:PCSTATS_TOKEN = Read-Host "Cole a chave atual do agente"
```

```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:8000/stats" -Headers @{ Authorization = "Bearer $env:PCSTATS_TOKEN" }
```

A variável de ambiente não é automaticamente compartilhada entre terminais independentes. `Read-Host` evita gravar a chave como texto literal no comando, mas a entrada fica visível na tela: não compartilhe uma captura desse terminal. A resposta também pode conter o nome da sua GPU.

## Testar em /docs

1. Inicie o agente com a variável `PCSTATS_DOCS=1` definida (`$env:PCSTATS_DOCS = "1"` no PowerShell, antes do `uvicorn`). Sem ela, `/docs` fica desligado de propósito, porque não exige chave. Depois, no PC, abra `http://127.0.0.1:8000/docs`.
2. Execute `/health` e confira **200**.
3. Execute `/stats` sem autorização e confira **401**.
4. Clique em **Authorize**, cole somente a chave e confirme.
5. Execute `/stats` e confira **200** com as métricas.
6. Repita com uma chave errada e confira **401**.

## Validação no aplicativo

O cliente verifica o status HTTP e valida o JSON antes de atualizar a tela. Confere números finitos e não negativos, percentuais até 100, totais positivos, data interpretável, estrutura das GPUs e tipo de `gpu_error`.

O tipo TypeScript não substitui essa validação: os dados chegam pela rede e podem não corresponder ao formato esperado.
