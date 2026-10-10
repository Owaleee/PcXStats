# PcX Control

**Acompanhe seu PC pelo celular.**

Aplicativo Android que exibe uso de CPU, memória RAM, espaço ocupado no disco do Windows e utilização de GPU pela rede local. Um agente Python executado no computador coleta as métricas e as entrega por uma API com chave de acesso.

O projeto nasceu como **PcXStats** e passou a se chamar **PcX Control**, acompanhando a intenção de evoluir para um painel de atalhos e controle do computador. A versão **0.1.0** implementa o monitoramento; os recursos de controle fazem parte dos planos futuros.

## Experimentar

- [Abrir a build Android testada e baixar o APK](https://expo.dev/accounts/owaleez/projects/pcx-control/builds/dee632f9-b783-4d0d-996f-04ed78fc77ba).
- [Preparar o agente e conectar o celular](docs/conectar-celular.md).
- [Consultar os testes e as limitações da validação](docs/testes.md).

O APK foi instalado e testado em um celular Android, sem depender do Expo Go ou do servidor Metro. O computador continua precisando do agente Python aberto e acessível pela rede local. A versão não foi publicada na Play Store; a release no GitHub ainda será preparada.

## Funcionalidades

- Uso total da CPU em percentual.
- Uso de RAM em percentual e quantidade usada/total em GiB.
- Espaço ocupado e capacidade total da unidade do Windows.
- Uso de GPU e nome do adaptador identificado pelo Windows.
- Conexão manual por IPv4 e chave de acesso.
- Atualização periódica e horário da última leitura.
- Mensagens para falha de rede, chave inválida e GPU indisponível.
- Preservação da última leitura quando uma consulta falha, com indicação de valores anteriores.
- Pausa das consultas quando o aplicativo sai do primeiro plano.

As funções acima estão presentes no código. Os testes realizados no aparelho e os cenários ainda pendentes estão separados em [docs/testes.md](docs/testes.md).

## Como funciona

```text
Celular Android                         PC Windows
React Native + Expo                     Agente Python
        |                                      |
        | GET /stats + chave de acesso         |
        |------------------------------------->| FastAPI
        |                                      | psutil: CPU, RAM e disco
        |                                      | PDH + DXGI: GPU
        |<-------------------------------------|
        |         JSON com as métricas         |
        v
Cartões, barras e horário da leitura
```

O aplicativo aguarda cada consulta terminar e espera mais 3 segundos para iniciar a próxima. A coleta de CPU e GPU também leva tempo; portanto, o intervalo total entre leituras é maior que 3 segundos.

## Tecnologias

| Parte | Tecnologias |
| --- | --- |
| Aplicativo | TypeScript, React 19, React Native 0.86 e Expo SDK 57 |
| API local | Python, FastAPI, Pydantic e Uvicorn |
| Métricas do PC | psutil, pywin32/PDH e DXGI via ctypes |
| Build Android | EAS Build e expo-build-properties |
| Versionamento | Git, GitHub e GitHub Desktop |

## Instalação rápida do agente

Com Python instalado, clone o repositório pelo GitHub Desktop e abra um PowerShell na raiz da cópia local. Execute uma linha por vez:

```powershell
py -3.13 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r agente\requirements.lock.txt
$env:PCSTATS_TOKEN = & .\.venv\Scripts\python.exe -c "import secrets; print(secrets.token_hex(32))"
Write-Output $env:PCSTATS_TOKEN
.\.venv\Scripts\python.exe -m uvicorn main:app --app-dir agente --host 0.0.0.0 --port 8000
```

Copie a chave exibida para o aplicativo. Ela é um segredo local: não a publique, não a coloque no código e não a inclua em capturas de tela.

No celular, informe somente o IPv4 do PC, sem `http://` e sem a porta, e cole a chave. Use `ipconfig` no Windows para descobrir o endereço da conexão ativa.

Consulte o [guia completo](docs/conectar-celular.md) para requisitos, firewall e diagnóstico de rede. A instalação foi validada com Python 3.13.14; outras versões não foram confirmadas neste projeto.

## Desenvolvimento

Com Node.js e npm instalados, abra outro PowerShell na raiz do repositório:

```powershell
cd mobile
npm.cmd ci
npx.cmd expo start --go --lan
```

Abra o projeto no Expo Go compatível com o SDK 57. O agente Python deve continuar executando no outro terminal.

Verificações de código, executadas dentro de `mobile`:

```powershell
npm.cmd run typecheck
npm.cmd run lint
```

Consulte [desenvolvimento e geração do APK](docs/desenvolvimento.md) para detalhes do ambiente e do EAS.

## Documentação

| Documento | Conteúdo |
| --- | --- |
| [Conectar o celular](docs/conectar-celular.md) | Instalação, rede, chave, APK e diagnóstico |
| [Arquitetura](docs/arquitetura.md) | Responsabilidades, coleta, atualização e decisões |
| [API](docs/api.md) | Endpoints, autenticação, campos e exemplos |
| [Desenvolvimento](docs/desenvolvimento.md) | Ambiente, Expo Go, verificações e build |
| [Testes](docs/testes.md) | Resultados confirmados e testes pendentes |
| [Validação técnica](docs/validacao-mobile.md) | Versões, verificações e pendências conhecidas |
| [Publicação](docs/publicacao.md) | GitHub Desktop, release e apresentação |
| [Capturas de tela](docs/imagens/README.md) | Como acrescentar imagens reais |

## Limitações atuais

- Agente para Windows; não foi adaptado para Linux ou macOS.
- Um computador por conexão, com IPv4 e chave informados manualmente.
- Comunicação HTTP sem criptografia, destinada a uma rede local confiável.
- Endereço e chave não são persistidos entre encerramentos do aplicativo.
- Sem histórico, temperaturas, alertas ou execução de comandos no PC.
- Leitura de GPU depende dos contadores e drivers do Windows. A validação física foi feita com uma NVIDIA GeForce RTX 3070; AMD, Intel e múltiplas GPUs físicas ainda não foram testadas.
- Consumo de CPU, RAM, bateria e tráfego ainda não foi medido sistematicamente.
- Há pendências de revisão das dependências e de alguns testes no APK, descritas na documentação.

## Próximas melhorias

- Consolidar os testes do APK e revisar as dependências.
- Melhorar a configuração de conexão e a identidade visual.
- Criar botões para ações predefinidas, começando por controle de mídia.
- Explorar painéis personalizáveis e perfis para trabalho, jogos e transmissão.

Os planos acima ainda não estão implementados. A evolução para controle do PC também precisará considerar a autorização das ações e a proteção da comunicação.

## Aprendizados

O desenvolvimento permitiu praticar integração entre aplicativo e API, ambientes virtuais Python, autenticação por chave, validação de respostas JSON, estado no React, consultas assíncronas, redes locais e diagnóstico de falhas.

Entre os problemas trabalhados estão a identificação correta da GPU, a distinção entre adaptadores físicos e de software, a configuração do Git para o EAS e um erro de texto solto na renderização nativa.

## Autoria

Desenvolvido por [Owaleee](https://github.com/Owaleee), durante um curso guiado com apoio de IA para explicações, exemplos, revisão e documentação. As alterações e os testes no aparelho foram realizados ao longo desse processo de aprendizado.
