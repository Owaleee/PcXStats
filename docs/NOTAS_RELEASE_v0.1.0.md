# PcX Control v0.1.0

Primeira versão de demonstração do PcX Control: acompanhe métricas de um PC Windows no celular Android pela rede local.

## Funcionalidades

- Uso de CPU e memória RAM.
- Espaço ocupado e capacidade da unidade do Windows.
- Utilização de GPU com identificação do adaptador pelo Windows.
- Conexão por IPv4 e chave de acesso.
- Consulta periódica e horário da última leitura.
- Tratamento de falhas de consulta e indicação de valores anteriores.
- APK independente do Expo Go e Metro.

## Como usar

1. Baixe o APK anexado a esta release e instale no Android.
2. No PC Windows, prepare e inicie o agente Python.
3. Com PC e celular na mesma rede confiável, informe o IPv4 do PC e a chave no aplicativo.
4. Toque em **Conectar**.

Consulte as [instruções do projeto](https://github.com/Owaleee/PcX_Control) para executar o agente. O computador precisa permanecer ligado, com o agente aberto.

## Validação conhecida

- Build Android concluída no EAS.
- Instalação e consulta de métricas confirmadas em Android físico.
- Funcionamento sem Expo Go e Metro confirmado pelo autor.
- GPU física validada: NVIDIA GeForce RTX 3070.

Build de referência: [dee632f9-b783-4d0d-996f-04ed78fc77ba](https://expo.dev/accounts/owaleez/projects/pcx-control/builds/dee632f9-b783-4d0d-996f-04ed78fc77ba).

## Limitações

- Comunicação HTTP destinada à rede local confiável.
- Sem persistência de IP/chave, histórico, temperaturas ou controle de ações no PC.
- Outras GPUs e aparelhos ainda não foram validados.
- Testes de chave errada, agente desligado e recuperação no APK ainda precisam de registro.
- Revisão de avisos das dependências pendente.

Esta é uma versão inicial de aprendizado e portfólio. O painel de botões e atalhos faz parte dos planos futuros.
