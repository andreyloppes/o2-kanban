/**
 * Constroi o system prompt para o agente IA com contexto do board.
 * @param {Object} boardData
 * @param {Object} boardData.board - Dados do board
 * @param {Array} boardData.columns - Colunas do board
 * @param {Array} boardData.tasks - Tasks do board
 * @param {Array} boardData.members - Membros do board
 * @param {string} boardData.userRole - Role do usuario ('owner' | 'member' | null)
 * @returns {string} System prompt
 */
export function buildSystemPrompt({ board, columns, tasks, members, userRole }) {
  const columnSummary = columns
    .map((col) => {
      const colTasks = tasks.filter((t) => t.column_id === col.id);
      return `  - ${col.title}: ${colTasks.length} tarefa(s)`;
    })
    .join('\n');

  const memberList = members
    .filter((m) => m.user)
    .map((m) => `  - ${m.user.name} (${m.role === 'owner' ? 'admin' : 'membro'})`)
    .join('\n');

  const totalTasks = tasks.length;

  let permissionBlock = '';
  if (userRole === 'owner') {
    permissionBlock = `O usuario atual e ADMINISTRADOR do board. Ele pode executar comandos de acao:
- /criar [titulo] — Cria uma nova tarefa na primeira coluna
- /mover [titulo da tarefa] [titulo da coluna] — Move uma tarefa para outra coluna
- /prioridade [titulo da tarefa] [low|medium|high|urgent] — Altera a prioridade de uma tarefa

Quando o usuario pedir para criar, mover ou alterar tarefas, use os comandos acima na sua resposta.`;
  } else if (userRole === 'member') {
    permissionBlock = `O usuario atual e MEMBRO do board. Ele pode visualizar tudo e fazer sugestoes, mas NAO pode executar comandos de acao diretamente. Sugira acoes ao admin quando necessario.`;
  } else {
    permissionBlock = `O usuario atual NAO e membro do board. Ele pode apenas visualizar informacoes e fazer perguntas. NAO sugira acoes de modificacao.`;
  }

  return `Voce e o agente de IA do board "${board.title}" no O2 Kanban.
Responda SEMPRE em portugues do Brasil.
Seja conciso, pratico e direto.

## Contexto do Board

Board: ${board.title}
${board.description ? `Descricao: ${board.description}` : ''}
Total de tarefas: ${totalTasks}

### Colunas
${columnSummary}

### Membros
${memberList || '  Nenhum membro encontrado'}

## Permissoes
${permissionBlock}

## Regras
- Responda de forma concisa (maximo 2-3 paragrafos)
- Use listas quando apropriado
- Nao repita informacoes que o usuario ja pode ver no board
- Quando perguntado sobre resumo, foque no que e relevante e acionavel
- Se o usuario pedir algo fora do escopo do board, responda educadamente que voce so pode ajudar com assuntos relacionados ao board`;
}
