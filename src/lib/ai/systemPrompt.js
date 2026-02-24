/**
 * Constroi o system prompt para o agente IA com contexto completo do board.
 * @param {Object} boardData
 * @param {Object} boardData.board - Dados do board
 * @param {Array} boardData.columns - Colunas do board
 * @param {Array} boardData.tasks - Tasks do board
 * @param {Array} boardData.members - Membros do board
 * @param {string} boardData.userRole - Role do usuario ('owner' | 'member' | null)
 * @returns {string} System prompt
 */
export function buildSystemPrompt({ board, columns, tasks, members, userRole }) {
  // Detalhes completos de cada coluna com suas tasks
  const columnDetails = columns
    .map((col) => {
      const colTasks = tasks
        .filter((t) => t.column_id === col.id)
        .sort((a, b) => a.position - b.position);

      if (colTasks.length === 0) {
        return `### ${col.title} (0 tarefas)\n  (vazia)`;
      }

      const taskLines = colTasks
        .map((t) => {
          const parts = [`    - "${t.title}"`];
          if (t.type && t.type !== 'task') parts.push(`tipo: ${t.type}`);
          if (t.priority) parts.push(`prioridade: ${t.priority}`);
          if (t.assignee) parts.push(`responsavel: ${t.assignee}`);
          if (t.due_date) parts.push(`prazo: ${t.due_date}`);
          if (t.start_date) parts.push(`inicio: ${t.start_date}`);
          if (t.description) {
            const desc = t.description.length > 100
              ? t.description.slice(0, 100) + '...'
              : t.description;
            parts.push(`descricao: "${desc}"`);
          }
          return parts.join(' | ');
        })
        .join('\n');

      return `### ${col.title} (${colTasks.length} tarefa${colTasks.length !== 1 ? 's' : ''})\n${taskLines}`;
    })
    .join('\n\n');

  const memberList = members
    .filter((m) => m.user)
    .map((m) => `  - ${m.user.name} (slug: ${m.user.slug}, ${m.role === 'owner' ? 'admin' : 'membro'})`)
    .join('\n');

  const totalTasks = tasks.length;

  // Resumo de prioridades
  const priorities = { urgent: 0, high: 0, medium: 0, low: 0 };
  const overdue = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  tasks.forEach((t) => {
    if (t.priority && priorities[t.priority] !== undefined) {
      priorities[t.priority]++;
    }
    if (t.due_date) {
      const due = new Date(t.due_date + 'T00:00:00');
      if (due < today) overdue.push(t.title);
    }
  });

  const prioritySummary = `Urgente: ${priorities.urgent} | Alta: ${priorities.high} | Media: ${priorities.medium} | Baixa: ${priorities.low}`;
  const overdueSummary = overdue.length > 0
    ? `\nTarefas VENCIDAS (${overdue.length}): ${overdue.map(t => `"${t}"`).join(', ')}`
    : '';

  let permissionBlock = '';
  if (userRole === 'owner') {
    permissionBlock = `O usuario atual e ADMINISTRADOR do board. Ele tem controle total. Pode executar comandos de acao:
- /criar [titulo] — Cria uma nova tarefa na primeira coluna
- /mover [titulo da tarefa] para [titulo da coluna] — Move uma tarefa para outra coluna
- /prioridade [titulo da tarefa] [low|medium|high|urgent] — Altera a prioridade de uma tarefa

Quando o usuario pedir para criar, mover ou alterar tarefas, use os comandos acima na sua resposta. Execute SEM pedir confirmacao — o usuario e admin e tem autoridade total.`;
  } else if (userRole === 'member') {
    permissionBlock = `O usuario atual e MEMBRO do board. Ele pode visualizar tudo e fazer sugestoes, mas NAO pode executar comandos de acao diretamente. Sugira acoes ao admin quando necessario.`;
  } else {
    permissionBlock = `O usuario atual NAO e membro do board. Ele pode apenas visualizar informacoes e fazer perguntas. NAO sugira acoes de modificacao.`;
  }

  return `Voce e o assistente de IA do board "${board.title}" no O2 Kanban.
Responda SEMPRE em portugues do Brasil.
Seja conciso, pratico e direto.

## Contexto Completo do Board

Board: ${board.title}
${board.description ? `Descricao: ${board.description}` : ''}
Total de tarefas: ${totalTasks}
Distribuicao por prioridade: ${prioritySummary}${overdueSummary}

## Colunas e Tarefas (dados em tempo real)

${columnDetails}

## Membros do Board
${memberList || '  Nenhum membro encontrado'}

## Permissoes
${permissionBlock}

## Regras
- Voce TEM acesso a TODAS as tarefas do board com seus detalhes (titulo, tipo, prioridade, responsavel, datas, descricao)
- Quando perguntado sobre tarefas, SEMPRE responda com os dados reais que voce tem acima
- Liste tarefas por nome quando perguntado "quais tarefas", "o que tem em", etc
- Responda de forma concisa (maximo 2-3 paragrafos), use listas quando listar tarefas
- Quando perguntado sobre resumo, foque no que e relevante e acionavel
- Se o usuario pedir para criar/mover/alterar, execute imediatamente com os comandos (se admin)
- Se o usuario pedir algo fora do escopo do board, responda educadamente que voce so pode ajudar com assuntos relacionados ao board`;
}
