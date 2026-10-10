# Arquitetura e decisões

## Objetivo da versão 0.1.0

Mostrar métricas reais de um computador Windows no Android, com uma instalação independente do Expo Go. O escopo inicial considera um usuário, um PC e comunicação pela rede local.

## Componentes

```text
agente/
  main.py                 API, autenticação e composição da resposta
  gpu.py                  Coleta PDH e resumo do uso por adaptador
  adaptadores_gpu.py       Identificação de adaptadores pelo DXGI
  metricas.py              Exercício inicial de coleta no terminal
  requirements.txt        Dependências diretas
  requirements.lock.txt   Versões fixadas do ambiente Python

mobile/
  App.tsx                 Conexão, estado, consultas e cartões
  src/api.ts              Requisição HTTP e validação do JSON
  src/types.ts            Tipos de conexão e métricas
  app.json                Configuração do aplicativo e do Android
  eas.json                Perfis de build
  package-lock.json       Versões resolvidas pelo npm
```

## Caminho de uma consulta

1. O usuário informa IPv4 e chave e toca em **Conectar**.
2. O app verifica o formato do IPv4 e o tamanho mínimo da chave.
3. O cliente envia `GET /stats` com `Authorization: Bearer ...`.
4. O agente valida a chave antes de coletar dados.
5. O psutil consulta CPU, RAM e espaço ocupado na unidade do Windows.
6. A coleta de GPU consulta contadores PDH e associa adaptadores aos nomes DXGI.
7. O FastAPI devolve o JSON conforme os modelos Pydantic.
8. O app valida a resposta e atualiza os cartões e o horário.

## CPU, memória e disco

A CPU é amostrada durante 0,2 segundo. O agente usa `virtual_memory()` para a RAM e `disk_usage()` para a unidade indicada por `SystemDrive`, com `C:` como alternativa.

O espaço de disco representa a capacidade ocupada na unidade do sistema. O agente não lista arquivos nem mede a atividade de leitura e escrita.

## GPU

O agente usa `win32pdh`, incluído no pywin32, para consultar `\GPU Engine(*)\Utilization Percentage`. São coletadas duas amostras com uma espera de 1 segundo entre elas.

Os contadores identificam processos, adaptadores e motores da GPU. O código soma as contribuições dos processos para o mesmo motor e usa o motor mais ocupado como resumo do adaptador, limitado a 100%.

Esse resumo não é a soma de todos os motores nem uma média global. A abordagem de representar o uso pelo motor mais ocupado também é explicada pela Microsoft no [artigo sobre GPUs no Gerenciador de Tarefas](https://devblogs.microsoft.com/directx/gpus-in-the-task-manager/).

O DXGI fornece o nome do adaptador e permite excluir adaptadores classificados como software. A associação usa o mesmo LUID dos contadores, sem presumir que duas listas estejam na mesma ordem. Uma placa física com uso de 0% continua válida.

Os nomes são consultados a cada coleta. A estratégia usa APIs do Windows sem uma dependência específica de NVIDIA, AMD ou Intel, mas isso não garante funcionamento em todo hardware e driver. A confirmação física atual é para a RTX 3070.

## Atualização e ciclo de vida

- Uma consulta começa ao conectar ou retomar o aplicativo.
- O limite de espera do cliente é 5 segundos.
- Após terminar uma consulta, o app espera mais 3 segundos antes da próxima.
- As consultas do mesmo ciclo não são sobrepostas.
- Ao sair do primeiro plano, desconectar ou desmontar o efeito, o timer é cancelado e a requisição em andamento é abortada no cliente.
- Uma falha preserva a última leitura válida, indicando que são valores anteriores.

Abortar a requisição no cliente não garante interromper uma coleta que já começou no servidor. A rota é síncrona (`def`), e a coleta é executada no mecanismo de threads do FastAPI. Vários clientes podem provocar coletas simultâneas; esse cenário não foi avaliado como carga de produção.

Como há 0,2 segundo de amostragem de CPU, 1 segundo de espera para GPU e 3 segundos entre requisições, o ciclo bem-sucedido normalmente leva mais de 4,2 segundos, incluindo processamento e rede. Não existe atualização garantida a cada 3 segundos.

## Acesso e armazenamento

A chave do agente vem de uma variável de ambiente. O servidor compara bytes com `secrets.compare_digest`. O app mantém a chave e o endereço em estado na memória, sem persistência local implementada.

A API não implementa contas, controle de ações, HTTPS ou limitação de requisições. A chave restringe a consulta, mas o tráfego HTTP não é criptografado. A versão é destinada à demonstração em rede confiável.

## Consumo de recursos

A interface contém poucos cartões e recebe respostas pequenas. O agente consulta contadores do sistema e mantém um processo Python aberto. A coleta de GPU é uma parte relevante a medir porque o número de contadores pode variar com os processos e adaptadores.

Ainda não foram medidos consumo de CPU/RAM, bateria, tráfego ou estabilidade em uso prolongado. Tempos de espera no código não equivalem a períodos de CPU integralmente ocupada.

## Evolução prevista

O nome PcX Control acomoda a ideia de acrescentar botões, controle de mídia e perfis personalizáveis. A versão atual apenas consulta métricas.

Antes de expor ações no computador, será necessário definir ações permitidas, autenticação, autorização e proteção da comunicação. Um primeiro passo possível é oferecer ações predefinidas, em vez de receber comandos arbitrários pela rede.
