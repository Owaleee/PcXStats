# Instalar e conectar o PcX Control

Este guia cobre a versão Android 0.1.0 e o agente para Windows. O APK funciona sem Expo Go; as métricas dependem do agente executado no PC.

## 1. Requisitos

- PC Windows com Python. O ambiente confirmado utiliza Python 3.13.14.
- Celular Android. O modelo e a versão usados no teste ainda precisam ser registrados em [testes.md](testes.md).
- PC e celular na mesma rede local confiável; o computador pode estar no cabo e o celular no Wi-Fi do mesmo roteador.
- Código do repositório disponível no computador.

Para usar o APK pronto, Node.js e Expo Go não são necessários. Eles são usados no [desenvolvimento](desenvolvimento.md).

## 2. Obter o código

No GitHub Desktop, use **File → Clone repository → URL**, informe `https://github.com/Owaleee/PcX_Control.git` e escolha a pasta local.

Abra um PowerShell na raiz da pasta clonada. Ela deve conter as pastas `agente` e `mobile`.

## 3. Preparar o Python uma vez

Execute cada comando separadamente, na raiz:

```powershell
py -3.13 -m venv .venv
```

```powershell
.\.venv\Scripts\python.exe -m pip install -r agente\requirements.lock.txt
```

Os comandos usam diretamente o Python da `.venv`; não é necessário ativar o ambiente. Se o launcher `py` não encontrar o Python 3.13, confira a instalação antes de continuar.

## 4. Gerar a chave e iniciar o agente

No mesmo PowerShell:

```powershell
$env:PCSTATS_TOKEN = & .\.venv\Scripts\python.exe -c "import secrets; print(secrets.token_hex(32))"
```

```powershell
Write-Output $env:PCSTATS_TOKEN
```

Copie a chave exibida. O comando gera 64 caracteres hexadecimais aleatórios. O agente exige pelo menos 32 caracteres ASCII.

```powershell
.\.venv\Scripts\python.exe -m uvicorn main:app --app-dir agente --host 0.0.0.0 --port 8000
```

Deixe o terminal aberto. A mensagem `Uvicorn running on http://0.0.0.0:8000` indica que o servidor está aguardando consultas. `0.0.0.0` é o endereço de escuta, não o endereço a informar no aplicativo.

Para parar, pressione `Ctrl + C`. Isso preserva a variável da chave nesse terminal. Fechar o terminal encerra essa configuração; na próxima sessão será preciso definir a chave novamente. Gerar uma chave nova exige atualizar o valor no app.

## 5. Descobrir o IPv4 do PC

Em outro terminal:

```powershell
ipconfig
```

Procure o IPv4 da conexão Ethernet ou Wi-Fi que está em uso. Um exemplo ilustrativo é `192.168.1.10`; use o endereço real do seu computador.

No próprio PC, abra `http://127.0.0.1:8000/health`. No navegador do celular, abra `http://IP_DO_PC:8000/health`, substituindo `IP_DO_PC` pelo endereço encontrado.

O resultado esperado é:

```json
{"status":"ok"}
```

No celular, `localhost` e `127.0.0.1` apontam para o próprio celular. Por isso, use o IPv4 do computador.

## 6. Ajustar o firewall se o celular não alcançar a API

Se `/health` funciona no PC, mas não no celular, confira primeiro o IP, o servidor e se os dispositivos estão na mesma rede. Redes de convidados podem impedir a comunicação entre aparelhos.

Em uma rede doméstica confiável, o perfil de rede do Windows pode ser configurado como **Privado** nas configurações da conexão. Não faça essa mudança em uma rede pública para usar o aplicativo.

Se ainda for necessário liberar a porta, abra um PowerShell como administrador e confira se a regra já existe:

```powershell
Get-NetFirewallRule -Name "PcXControl-API-LAN" -ErrorAction SilentlyContinue
```

Somente se não existir uma regra adequada, crie:

```powershell
New-NetFirewallRule -Name "PcXControl-API-LAN" -DisplayName "PcX Control - API local" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 8000 -Profile Private -RemoteAddress LocalSubnet
```

A regra permite a porta 8000 apenas no perfil privado e para a sub-rede local. A regra antiga `PcXStats-Dev-LAN`, criada durante o curso, também pode já permitir esse acesso; não é necessário duplicá-la.

Não desative o firewall nem configure redirecionamento de porta no roteador para esta demonstração.

## 7. Instalar o APK

1. No navegador do Android, abra a [build testada no Expo](https://expo.dev/accounts/owaleez/projects/pcx-control/builds/dee632f9-b783-4d0d-996f-04ed78fc77ba).
2. Use a opção de instalação/download para obter o APK.
3. Abra o arquivo baixado.
4. Se solicitado, permita a instalação por esse navegador e conclua a instalação.
5. Abra o aplicativo pelo ícone **PcX Control**.

Essa é uma build de demonstração distribuída diretamente. A release no GitHub será adicionada posteriormente. O fluxo de instalação por APK está descrito na [documentação do Expo](https://docs.expo.dev/build-reference/apk/).

## 8. Conectar no aplicativo

1. Em **IPv4 do PC**, digite somente o endereço, como `192.168.1.10`, sem `http://`, porta ou `/stats`.
2. Em **Chave de acesso**, cole somente a chave gerada no terminal; não inclua a palavra `Bearer`.
3. Toque em **Conectar**.
4. Confira o status e o horário da última leitura.

O app consulta a porta 8000 e adiciona o cabeçalho de autorização automaticamente. Para trocar IP ou chave, toque em **Desconectar**, altere os campos e conecte novamente.

## Diagnóstico

| Sintoma | O que conferir |
| --- | --- |
| `Defina PCSTATS_TOKEN...` ao iniciar | Defina a chave no mesmo terminal do agente |
| `/health` não abre nem no PC | Confira o processo do servidor e a porta 8000 |
| `/health` abre no PC, mas não no celular | Confira IPv4, rede, escuta `0.0.0.0` e firewall |
| Chave de acesso inválida | Use a chave do agente que está executando agora |
| Tempo limite de 5 segundos | Confira rede, disponibilidade do agente e tempo de coleta |
| GPU indisponível | Confira os contadores/drivers do Windows; as demais métricas podem continuar funcionando |
| Dados anteriores na tela | Veja o horário e o erro; a leitura anterior foi preservada |
| IP que funcionava deixou de funcionar | Execute `ipconfig` novamente; o endereço pode ter mudado |

## Uso local e chave

O token é verificado antes da coleta de métricas, mas HTTP não criptografa a comunicação. Use esta versão apenas em uma rede confiável. Não exponha o agente diretamente à internet.

Não inclua a chave em código, commits, logs compartilhados, imagens ou vídeos. A chave é informada no app e permanece apenas na memória da sessão; não é uma variável que precisa ser enviada ao EAS.
