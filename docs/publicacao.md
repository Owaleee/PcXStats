# Publicar e apresentar o PcX Control

Este roteiro prepara a documentação e a release **v0.1.0**. A build no EAS já foi concluída; a publicação de uma release no GitHub ainda está pendente.

## 1. Completar os dados da entrega

- Registre modelo do celular, Android e os resultados pendentes em [testes.md](testes.md).
- Confira as pendências em [validacao-mobile.md](validacao-mobile.md).
- Acrescente as imagens reais seguindo [imagens/README.md](imagens/README.md).
- Confira os comandos de instalação e se eles correspondem à versão do código disponibilizada.

Não marque testes como aprovados apenas porque existe tratamento no código. Se algum cenário ficar pendente, preserve essa informação.

## 2. Revisar no GitHub Desktop

1. Selecione o repositório correto, `PcXStats`.
2. Abra **Changes** e leia o diff dos documentos.
3. Confirme que a lista contém os arquivos esperados e que não há token, `.env`, ambiente virtual, dependências instaladas ou credenciais de assinatura.
4. Faça o commit:

```text
docs: documenta a primeira versao do PcX Control
```

5. Clique em **Push origin**.
6. Use **Repository → View on GitHub** e confira o README renderizado.

O nome do repositório pode continuar `PcXStats`. O nome apresentado do produto é PcX Control; os links deste pacote usam o endereço atual do repositório.

## 3. Baixar o APK testado

Abra a [build no Expo](https://expo.dev/accounts/owaleez/projects/pcx-control/builds/dee632f9-b783-4d0d-996f-04ed78fc77ba) e baixe o APK para uma pasta fora do repositório, como Downloads.

Você pode renomear o arquivo para `pcx-control-v0.1.0.apk`. Renomear o arquivo não altera o conteúdo nem a assinatura. Anexe a build efetivamente testada.

## 4. Preparar a release no GitHub

1. Abra [o repositório](https://github.com/Owaleee/PcXStats).
2. Acesse **Releases** e **Draft a new release**.
3. Em **Choose a tag**, crie `v0.1.0`, se essa tag ainda não existir.
4. Escolha o commit/branch revisado correspondente ao código da build. A branch usada no projeto é `main`.
5. Use o título **PcX Control v0.1.0**.
6. Copie o texto de [NOTAS_RELEASE_v0.1.0.md](NOTAS_RELEASE_v0.1.0.md) para a descrição, ajustando novos resultados se necessário.
7. Anexe o APK testado na área de arquivos da release.
8. Marque **This is a pre-release** para identificar esta entrega inicial de demonstração.
9. Revise o conteúdo e use **Save draft** enquanto houver ajustes, ou **Publish release** quando concluir a revisão.

Se o código do aplicativo ou agente mudou depois da build, confira a correspondência antes de escolher a tag. Mudanças apenas na documentação podem ser incluídas no commit final, mas uma mudança funcional exige nova build e novos testes.

O GitHub permite anexar arquivos binários às releases. Esse fluxo é descrito na [documentação oficial de releases](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository).

## 5. Atualizar o link do README

Depois que a release estiver publicada, copie sua URL real e acrescente um link na seção **Experimentar** do README. Preserve o link da build no Expo como referência da compilação.

Não anuncie a release como publicada antes dessa etapa. O token de acesso ao PC e o keystore não são anexos da release.

## 6. Gravar a demonstração

Roteiro sugerido para aproximadamente 1 minuto:

| Momento | Mostrar/explicar |
| --- | --- |
| Início | Nome do projeto e objetivo: acompanhar métricas do PC pelo Android |
| Painel | CPU, RAM, espaço em disco e GPU; horário atualizando |
| Integração | Explicar que há um agente Python no PC e comunicação pela rede local |
| Falha | Se o cenário foi testado, mostrar o comportamento ao desligar o agente |
| Encerramento | Repositório, APK e próxima melhoria planejada |

Oculte a chave, notificações pessoais e dados que você não queira divulgar. Use uma gravação real do aplicativo e identifique se ela foi feita no APK ou no Expo Go.

Depois de hospedar o vídeo, acrescente o link real ao README. Nenhum vídeo está incluído neste pacote.

## 7. Descrição curta para o repositório

Texto sugerido para o campo **About**:

> Aplicativo Android para acompanhar CPU, RAM, disco e GPU de um PC Windows pela rede local, com agente Python e API FastAPI.

## 8. Apresentar em entrevista

Uma explicação possível, para adaptar às suas palavras:

> Desenvolvi o PcX Control durante um curso guiado para aprender a integrar um aplicativo Android com um agente no Windows. O agente coleta métricas e entrega um JSON por uma API protegida por chave. O app trata conexão, tempo limite e dados anteriores. Gerei um APK com EAS e testei no meu celular. Uma dificuldade foi associar os contadores de GPU ao nome correto da placa e excluir o adaptador de software. Quero evoluir o projeto para ações predefinidas e painéis de controle.

Na apresentação, explique o apoio de IA de forma transparente e mostre as partes que você consegue demonstrar e explicar. Evite afirmar que outras placas ou cenários foram testados quando ainda estão pendentes.
