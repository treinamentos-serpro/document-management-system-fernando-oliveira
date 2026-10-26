---
description: Executa uma tarefa recorrente de evolução ou manutenção do DMS com implementação e validação focadas.
name: tarefa-dms
argument-hint: tipo da tarefa, objetivo, escopo e critérios de aceite
agent: agent
---

# Tarefa recorrente do DMS

Atenda a tarefa abaixo neste repositório:

- Tipo: `${input:tipo:funcionalidade, correção, refatoração ou documentação}`
- Objetivo: `${input:objetivo:o que deve mudar}`
- Escopo: `${input:escopo:arquivos ou módulos envolvidos; deixe em branco se não souber}`
- Critérios de aceite: `${input:aceite:comportamentos que devem ser verdadeiros}`

Siga as instruções em [copilot-instructions.md](../copilot-instructions.md) e estas etapas:

1. Leia o código, os testes e a documentação diretamente relacionados ao pedido. Formule a hipótese mais provável e identifique uma verificação capaz de refutá-la antes de editar.
2. Faça a menor alteração que satisfaça os critérios de aceite, preservando APIs e comportamentos existentes que não estejam no escopo.
3. No backend, mantenha as responsabilidades em `routes -> controllers -> services -> repositories`. Use `node:test`, filesystem local e as dependências existentes. Uploads devem continuar usando `multer` com `diskStorage` em `backend/storage`; metadados permanecem em memória.
4. No frontend, use componentes funcionais com hooks e concentre chamadas HTTP em `frontend/src/services`, usando `fetch` pelo prefixo `/api`.
5. Adicione ou ajuste testes somente para os comportamentos afetados. Não introduza armazenamento externo, dependências ou abstrações sem necessidade.
6. Rode a validação mais específica disponível. Para mudanças no backend, use `npm --prefix backend test`; para mudanças no frontend, use `npm --prefix frontend run build`. Rode ambos se a alteração cruzar as duas áreas.
7. Ao concluir, resuma os arquivos alterados, os testes executados e qualquer requisito não validado. Não faça commit nem push.