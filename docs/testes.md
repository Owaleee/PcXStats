# Registro de testes — PcX Control

Atualização: **10/10/2026**. Versão Android: **0.1.0**.

Este registro separa verificações de código, consultas locais à API e testes em aparelho. Uma análise estática aprovada não comprova, sozinha, funcionamento no Android.

## Ambiente conhecido

| Item | Registro |
| --- | --- |
| Computador | Windows; Windows 11 Pro 26H2 |
| GPU física testada | NVIDIA GeForce RTX 3070 |
| Python | 3.13.14 |
| Node.js | 24.21.0 |
| npm | 11.19.0 |
| Expo | SDK 57; configuração `~57.0.27` |
| React Native | 0.86.3 |
| Celular | Android físico; Poco X7 PRO |
| Versão do Android | 16 |
| Build APK | `dee632f9-b783-4d0d-996f-04ed78fc77ba` |

## API e desenvolvimento

| Cenário | Resultado conhecido | Evidência |
| --- | --- | --- |
| `/health` | 200 com agente disponível | Teste executado durante o curso |
| `/stats` sem chave | 401 | Teste de autorização durante o curso |
| `/stats` com chave errada | 401 | Teste de autorização durante o curso |
| `/stats` com chave correta | 200 com métricas | Teste de autorização durante o curso |
| Comunicação celular–PC | Funcionou pela rede local | Confirmação do autor no Expo Go |
| TypeScript | Aprovado | `npm.cmd run typecheck` executado na preparação do APK |
| ESLint | Aprovado | `npm.cmd run lint` executado na preparação do APK |

## GPU no Expo Go

Resultados registrados anteriormente em 10/10/2026:

| Cenário | Resultado observado | Situação |
| --- | --- | --- |
| Consulta real | Percentuais apareceram no celular | Passou |
| Falha simulada da coleta de GPU | Aplicativo exibiu aviso de indisponibilidade | Passou |
| Remover a falha simulada | Cartões voltaram | Passou |
| Identificação do adaptador | Nome da RTX 3070 exibido; adaptador de software excluído | Confirmado pelo autor |

Os testes de falha de GPU acima foram feitos no Expo Go. Não representam uma nova execução do mesmo cenário no APK.

## APK em aparelho físico

O autor confirmou o funcionamento após seguir o roteiro de instalação e uso sem Expo Go/Metro.

| Cenário | Resultado observado | Situação |
| --- | --- | --- |
| Compilação Android no EAS | Build concluída | Passou |
| Instalação no celular | APK instalado | Passou |
| Abrir sem Expo Go e Metro | Aplicativo abriu | Confirmado pelo autor |
| Conectar ao agente Python | Conexão funcionou | Confirmado pelo autor |
| Consultar métricas | Métricas exibidas e atualizadas | Confirmado pelo autor |
| Informar chave errada no APK | Sem resultado registrado | Pendente |
| Desligar o agente com o APK conectado | Sem resultado registrado | Pendente |
| Reiniciar o agente e observar recuperação | Sem resultado registrado | Pendente |
| Pausar e retomar o APK | Sem resultado específico registrado | Pendente |
| Uso prolongado e consumo de recursos | Sem medição sistemática | Pendente |

Página da [build testada](https://expo.dev/accounts/owaleez/projects/pcx-control/builds/dee632f9-b783-4d0d-996f-04ed78fc77ba).

## Roteiro dos testes pendentes

### Chave errada

1. Deixe o agente ligado e confirme `/health`.
2. Desconecte o APK.
3. Cole uma chave incorreta com pelo menos 32 caracteres. Esse tamanho evita que apenas a validação local impeça a consulta.
4. Conecte e observe o erro de acesso.
5. Desconecte, informe a chave correta e conecte novamente.

Esperado: a chave errada é recusada; a correta permite obter métricas. Registre o resultado observado, não apenas o esperado.

### Agente desligado e recuperação

1. Com o APK conectado, anote o horário da última leitura.
2. No terminal do agente, pressione `Ctrl + C`.
3. Aguarde uma tentativa de consulta e observe erro/status e indicação dos valores anteriores.
4. No mesmo terminal, reinicie o agente com o comando Uvicorn do guia de conexão, sem gerar outra chave.
5. Aguarde novas consultas e confira a retomada do horário e das métricas.

Esperado: a tela não apresenta os valores antigos como atuais e volta a atualizar quando a API responde.

### Pausa e retomada

1. Conecte o APK e confirme a atualização.
2. Vá para outro aplicativo por alguns segundos.
3. Volte ao PcX Control e observe a nova leitura.

Esperado: o cliente retoma as consultas ao voltar ao primeiro plano. Para comprovar a pausa das requisições, confira também os acessos no terminal do agente; a observação visual isolada não mede tráfego.

## Modelo para acrescentar novas evidências

```text
Data:
Versão/build do aplicativo:
Modelo do celular e Android:
Cenário:
Passos executados:
Resultado esperado:
Resultado observado:
Situação: passou / falhou / pendente
Captura ou log, sem segredos:
```

## Limites desta validação

AMD, Intel, múltiplas GPUs físicas, outros celulares, outros sistemas operacionais, vários clientes simultâneos e uso prolongado não foram confirmados. Não há suíte automatizada completa de testes funcionais no repositório.
