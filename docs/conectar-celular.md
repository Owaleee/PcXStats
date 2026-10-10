# Conectar o Android ao PcXStats

O código da integração passou nas verificações de TypeScript e ESLint. A API foi testada localmente; este roteiro serve para validar a conexão real no celular.

## 1. Preparar a rede

PC e celular devem estar na mesma rede local. O PC pode usar cabo Ethernet e o celular Wi-Fi do mesmo roteador. Evite a rede de convidados, que pode isolar os dispositivos.

Na verificação de 10/10/2026, o IPv4 do PC era `192.168.1.70` e o perfil Ethernet estava como Público. O IP pode mudar; confirme com `ipconfig` quando necessário.

**Somente se esta for sua rede doméstica confiável**, abra PowerShell como administrador e prepare o perfil privado e a regra local de desenvolvimento:

```powershell
Set-NetConnectionProfile -InterfaceAlias "Ethernet" -NetworkCategory Private
```

```powershell
New-NetFirewallRule -Name "PcXStats-Dev-LAN" -DisplayName "PcXStats - desenvolvimento local" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 8000,8081 -Profile Private -RemoteAddress LocalSubnet
```

Essa preparação é feita uma vez; não recrie a regra a cada execução. Ela permite API e Metro somente no perfil privado e para a sub-rede local. Os próximos terminais podem ser normais, sem administrador.

## 2. Terminal 1 — agente Python

Abra um PowerShell no VS Code. Se outro servidor estiver ocupando esse terminal, pare-o com Ctrl+C. Execute cada comando separadamente:

```powershell
cd "C:\Users\owale\OneDrive\Documents\GitHub\PcXStats"
```

```powershell
$env:PCSTATS_TOKEN = & .\.venv\Scripts\python.exe -c "import secrets; print(secrets.token_hex(32))"
```

```powershell
Write-Output $env:PCSTATS_TOKEN
```

Copie a chave exibida para informar no aplicativo. Esse comando gera uma chave nova: uma autorização antiga deixa de corresponder ao novo agente. Não publique a chave.

```powershell
.\.venv\Scripts\python.exe -m uvicorn main:app --app-dir agente --host 0.0.0.0 --port 8000
```

Deixe este terminal aberto. `0.0.0.0` permite escutar na rede; não é o IP a digitar no celular.

## 3. Testar a API no navegador do celular

Abra [http://192.168.1.70:8000/health](http://192.168.1.70:8000/health).

O esperado é `{"status":"ok"}`. Se não abrir, resolva IP, rede, agente e firewall antes de testar o painel. Não use `localhost` ou `127.0.0.1` no celular.

## 4. Terminal 2 — Expo

Abra um segundo terminal pelo botão `+` do VS Code. O primeiro continua executando o agente. Digite:

```powershell
cd "C:\Users\owale\OneDrive\Documents\GitHub\PcXStats\mobile"
```

O caminho deve terminar em `PcXStats\mobile`, com apenas uma pasta mobile. A pasta `mobile\mobile` encontrada na revisão estava vazia e não é a raiz do aplicativo.

```powershell
npx.cmd expo start --go --lan
```

Deixe o terminal aberto. No Android, abra Expo Go compatível com o SDK 57 e escaneie o QR code do terminal. Se o comando informar que a porta 8081 está ocupada, encerre o Metro anterior antes de reiniciar na porta padrão usada pela regra acima.

## 5. Conectar no aplicativo

- IPv4 do PC: `192.168.1.70` (ou o endereço atual confirmado).
- Chave de acesso: cole somente a chave gerada no terminal 1.
- Toque em Conectar.

O esperado é status Conectado, CPU/RAM/disco reais e horário da última leitura mudando. A tela atual ainda não possui GPU.

Se aparecer chave inválida, desconecte, confira a chave do agente em execução e conecte novamente. Se aparecer falha de rede, repita o teste de `/health` no navegador do celular.

## 6. Registrar a validação

Anote modelo do aparelho, Android, data e resultado. Teste também parar o agente, observar dados antigos/erro e reiniciar com a mesma chave para verificar recuperação. Nenhum desses testes físicos deve ser marcado como aprovado apenas pela checagem de código.
