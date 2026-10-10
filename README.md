# PcXStats

Projeto de aprendizado para acompanhar estatísticas de um PC Windows em um aplicativo Android.

## Etapa atual

- Agente Python com leitura real de CPU, memória RAM e espaço ocupado no disco.
- API FastAPI com `/health` e `/stats`; a consulta de métricas exige chave de acesso.
- Tela mobile com campos de IPv4 e chave, consulta autenticada à API e cartões de CPU, RAM e disco.

**A integração com a API está implementada no código; o teste completo no celular ainda precisa ser registrado.** Métricas de GPU e geração do APK serão construídas nas próximas etapas.

## Tecnologias

Python, psutil, FastAPI, Uvicorn, TypeScript, React Native e Expo SDK 57.

## Estrutura

```text
agente/     # coleta e API do PC Windows
mobile/     # aplicativo Expo com dados simulados
docs/       # registros de verificacao
```

## Executar o agente

No PowerShell, na raiz do repositório, com Python 3.10 ou superior instalado:

```powershell
py -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r agente/requirements.lock.txt
$env:PCSTATS_TOKEN = & .\.venv\Scripts\python.exe -c "import secrets; print(secrets.token_hex(32))"
Write-Output $env:PCSTATS_TOKEN
.\.venv\Scripts\python.exe -m uvicorn main:app --app-dir agente --host 127.0.0.1 --port 8000
```

Abra [a documentação da API](http://127.0.0.1:8000/docs) no navegador do PC. `/health` é público. Em **Authorize**, informe a chave exibida no terminal para testar `/stats`.

A chave é um segredo local: não a coloque no código ou em imagens públicas. Ela é configurada no terminal em que o agente será iniciado. Este comando escuta somente no próprio PC; o acesso pelo celular será configurado na etapa de integração pela rede local.

## Executar o aplicativo em desenvolvimento

Com Node.js 22.13 ou superior compatível com o Expo SDK 57 e npm instalados, abra outro terminal na raiz do repositório:

```powershell
cd mobile
npm.cmd ci
npx.cmd expo start
```

Abra o projeto no Expo Go compatível com o SDK. Para consultar métricas reais, execute o agente com acesso pela rede local, informe o IPv4 do PC e a chave no aplicativo. Siga [o passo a passo para conectar o celular](docs/conectar-celular.md).

## Verificações de código

Dentro de `mobile`:

```powershell
npm.cmd run typecheck
npm.cmd run lint
npx.cmd expo-doctor
```

Consulte [o registro de verificação](docs/validacao-mobile.md) para resultados, limites e pendências. Os comandos de análise não substituem os testes de tela no celular.

## Próximas etapas

- Validar a comunicação real entre celular e PC e os estados de erro/recuperação.
- Acrescentar leitura de GPU pelos contadores do Windows quando disponíveis.
- Testar o aplicativo em Android e gerar um APK demonstrável.

## Aprendizado

Projeto desenvolvido durante um curso guiado, com apoio de IA, para praticar Python, APIs, desenvolvimento mobile, redes locais e Git/GitHub.
