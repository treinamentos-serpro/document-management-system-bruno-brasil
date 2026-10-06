---
name: implement-dms-change
description: "Implementa uma mudança incremental no DMS, seguindo a especificação, atualizando testes relevantes e validando o backend ou frontend afetado."
argument-hint: "Descreva uma mudança pontual no DMS"
agent: agent
---
# Implementar mudança no DMS

Implemente esta mudança: `${input:change:Descreva uma mudança pontual no DMS}`

Use como referência [as instruções do repositório](../copilot-instructions.md) e [a especificação do DMS](../../docs/specs/dms-spec.md). Leia o código e os testes mais próximos da mudança antes de editar.

## Execução

1. Identifique os requisitos e contratos afetados e a menor camada que controla o comportamento. Preserve as convenções existentes e a direção `routes -> controllers -> services -> repositories` no backend.
2. Faça a menor alteração que satisfaça a solicitação. Reutilize dependências e abstrações existentes; não crie camadas ou refatore áreas não relacionadas.
3. Atualize ou acrescente testes focados para o comportamento e os erros relevantes. Testes de filesystem devem usar diretório temporário; nunca apague ou sobrescreva arquivos em `backend/storage`.
4. Valide de acordo com o escopo: execute `npm test` dentro de `backend/` para mudanças no backend e `npm run build` dentro de `frontend/` para mudanças no frontend. Se ambos forem afetados, execute ambos. Não invente etapas de lint, pois não há lint configurado.
5. Se a solicitação entrar em conflito com a especificação ou exigir ampliar o escopo (por exemplo, autenticação real, banco de dados ou storage externo), explique o conflito antes de alterar esses contratos.

Ao concluir, informe brevemente o que mudou, os arquivos relevantes e os comandos de validação executados, incluindo qualquer validação que não pôde ser feita.
