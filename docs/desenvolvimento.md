# Desenvolvimento e build Android

## Ambiente

O desenvolvimento foi realizado no Windows com Python 3.13.14, Node.js 24.21.0 e npm 11.19.0. O aplicativo usa Expo SDK 57 e React Native 0.86.3.

O SDK 57 exige Node.js compatível, com mínimo indicado de 22.13.x na [referência do Expo](https://docs.expo.dev/versions/v57.0.0/). Para reproduzir o ambiente, prefira a versão validada e preserve os arquivos de lock.

Instale o agente seguindo [conectar-celular.md](conectar-celular.md). Não é necessário usar a `.venv` para os comandos Node; ela isola apenas os pacotes Python.

## Executar em desenvolvimento

Em um PowerShell na raiz do repositório:

```powershell
cd mobile
npm.cmd ci
npx.cmd expo start --go --lan
```

No Android, use Expo Go compatível com SDK 57 para abrir o QR Code. Mantenha o agente Python ligado no outro terminal. O QR Code do Expo abre o projeto; ele não configura o IP nem a chave da API.

O modo LAN do Metro normalmente usa a porta 8081. Se o Windows solicitar acesso do Node.js, permita-o na rede privada confiável. Uma regra adicional, se necessária e ainda inexistente, pode ser criada em PowerShell administrador:

```powershell
New-NetFirewallRule -Name "PcXControl-Metro-LAN" -DisplayName "PcX Control - Metro local" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 8081 -Profile Private -RemoteAddress LocalSubnet
```

Essa porta é usada no desenvolvimento; o APK `preview` não depende do Metro. Se a porta estiver ocupada, confira se há outro Metro executando antes de mudar a porta.

## Verificar o código

Dentro de `mobile`:

```powershell
npm.cmd run typecheck
npm.cmd run lint
```

Para um diagnóstico adicional de dependências e configuração:

```powershell
npx.cmd expo-doctor
```

Para instalar um pacote Expo, use `npx.cmd expo install NOME_DO_PACOTE`, substituindo o marcador pelo nome real. Confira a documentação da versão 57 antes de mudar APIs ou configurações nativas.

## Configuração do Android

Valores atuais em `app.json`:

| Campo | Valor |
| --- | --- |
| `expo.name` | `PcX Control` |
| `expo.slug` | `pcx-control` |
| `expo.version` | `0.1.0` |
| `expo.android.package` | `com.owaleee.pcxcontrol` |
| Plugin | `expo-build-properties` |
| Opção Android do plugin | `usesCleartextTraffic: true` |

A permissão de tráfego HTTP é necessária para o endereço local usado nesta versão. Ela é aplicada na geração do projeto nativo; alterar apenas o JavaScript não modifica o manifesto de um APK já instalado. Referência: [expo-build-properties](https://docs.expo.dev/versions/v57.0.0/sdk/build-properties/).

Preserve os assets e `extra.eas.projectId` da configuração. O identificador Android deve permanecer estável para atualizar a mesma instalação.

## Preparar o EAS

É necessário ter uma conta Expo e o Git acessível no terminal:

```powershell
git --version
```

Se o Git funcionar apenas no GitHub Desktop, configure seu caminho no terminal ou instale/configure o Git para Windows antes de continuar. Um ajuste de `Path` feito com `$env:Path` vale somente naquele terminal.

Dentro de `mobile`:

```powershell
npx.cmd eas-cli@latest login
npx.cmd eas-cli@latest build:configure
```

Na primeira configuração, selecione Android e confirme a criação/vinculação do projeto correto. O repositório atual está vinculado a `@owaleez/pcx-control`; criar builds desse projeto requer acesso à conta/projeto. Quem criar uma cópia independente deve configurá-la com seu próprio projeto EAS, sem reutilizar o vínculo alheio inadvertidamente.

Não envie o token do agente como variável de build. Ele é gerado no PC e informado pelo usuário na tela do aplicativo.

## Gerar APK

O perfil `preview` em `eas.json` contém:

```json
{
  "distribution": "internal",
  "android": {
    "buildType": "apk"
  }
}
```

Esse trecho representa o conteúdo de `build.preview`, não o arquivo completo. Preserve os demais campos do `eas.json`.

Depois de revisar e registrar as alterações no Git:

```powershell
npx.cmd eas-cli@latest build --platform android --profile preview
```

O comando envia os arquivos da build ao serviço Expo. Na primeira build de um aplicativo novo, o EAS pode gerar e gerenciar o keystore Android. Essa chave de assinatura é diferente do token usado em `/stats`; preserve o acesso à conta e às credenciais para futuras atualizações.

O projeto usa `cli.appVersionSource: remote`. Por isso, o EAS gerencia o `versionCode`; a primeira build inicializou o valor remoto em 1. O aviso de que `android.versionCode` local é ignorado não impediu a compilação.

Depois de concluir, abra o link no celular e instale o APK. Na pergunta sobre instalar em emulador, responda `n` se for usar o aparelho físico. Referências: [primeira build](https://docs.expo.dev/build/setup/) e [APK instalável](https://docs.expo.dev/build-reference/apk/).

## Verificar a instalação independente

1. Feche Expo Go e pare Metro.
2. Mantenha o agente Python ligado no PC.
3. Abra o PcX Control instalado pelo APK.
4. Informe IPv4 e chave e confirme as métricas.
5. Registre os cenários de falha e recuperação em [testes.md](testes.md).

O APK inclui o JavaScript do app. Uma alteração posterior no código não entra automaticamente nesse arquivo já instalado; gere e teste uma nova build para distribuí-la por esse fluxo.

## Arquivos fora do Git

Preserve no versionamento os arquivos de código, configuração e locks. Não inclua `.venv`, `node_modules`, `.expo`, segredos, keystores ou arquivos de credenciais. Distribua o APK como anexo de release, não como arquivo comum de código no repositório.
