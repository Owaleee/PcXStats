# Validação técnica — PcX Control v0.1.0

Registro consolidado em **10/10/2026**. As verificações técnicas e os testes no aparelho têm escopos diferentes. Consulte também [testes.md](testes.md).

## Versões verificadas no ambiente local

| Ferramenta/pacote | Versão |
| --- | --- |
| Python | 3.13.14 |
| Node.js | 24.21.0 |
| npm | 11.19.0 |
| FastAPI | 0.143.0 |
| Uvicorn | 0.54.0 |
| psutil | 7.2.2 |
| pywin32 | 312 |
| Expo, faixa declarada | `~57.0.27` |
| React Native, versão declarada | `0.86.3` |
| React, versão declarada | `19.2.3` |
| TypeScript, faixa declarada | `~6.0.3` |
| expo-build-properties, faixa declarada | `~57.0.22` |

As versões Python foram conferidas no ambiente virtual. Os campos descritos como declarados são os do `package.json`; o `package-lock.json` contém as resoluções do npm.

## Verificações executadas

Antes da primeira build APK, os comandos abaixo terminaram sem erros:

```powershell
npm.cmd run typecheck
npm.cmd run lint
```

O Expo reconheceu a configuração pública do app, incluindo nome, identificador Android e plugin de HTTP. O EAS concluiu a build `dee632f9-b783-4d0d-996f-04ed78fc77ba`, e o autor confirmou instalação e funcionamento em Android físico.

Um registro anterior do projeto informa **21 de 21 verificações aprovadas no Expo Doctor** durante a construção da primeira tela. Esse resultado é histórico e não deve ser apresentado como uma nova execução após todas as alterações.

## Auditoria de dependências

Durante a instalação de `expo-build-properties`, o npm informou **22 vulnerabilidades: 7 moderadas e 15 altas**. Esse número descreve a saída daquela instalação; não foi feita uma nova auditoria ao preparar esta documentação.

A análise de impacto e das correções compatíveis permanece pendente. Não foi aplicado `npm audit fix --force`. Aprovação de TypeScript, ESLint, Expo Doctor ou build não equivale a uma auditoria de segurança aprovada.

Para revisar a situação atual dentro de `mobile`:

```powershell
npm.cmd audit
```

Examine os caminhos das dependências, a aplicabilidade dos avisos e a compatibilidade das correções antes de atualizar. A primeira distribuição é uma demonstração de aprendizado, não uma versão comercial validada.

## Pendências de apresentação e precisão

- Registrar modelo do celular, versão Android e versão do Windows.
- Completar os testes pendentes específicos do APK.
- Acrescentar imagens reais e, se disponível, vídeo de demonstração.
- Gerar uma nova build e testá-la no aparelho. O título da tela (`PcX Control`) e o detalhe do cartão de GPU (`Uso da GPU · motor mais ocupado`) já foram corrigidos no código, mas o APK `dee632f9-b783-4d0d-996f-04ed78fc77ba` ainda mostra `PC Stats` e `3D`.

## Performance e compatibilidade

Não há medição sistemática de CPU/RAM do agente, bateria do celular, tráfego ou estabilidade prolongada. A arquitetura contém esperas entre amostras e consultas, mas isso não substitui uma medição real.

A coleta usa APIs do Windows sem exigir uma biblioteca de uma fabricante específica. A confirmação em hardware foi feita com a RTX 3070. Compatibilidade com outras placas permanece a validar.
