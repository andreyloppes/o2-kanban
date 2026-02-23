/**
 * Motor de automacoes do O2 Kanban
 * Executa acoes automaticas com base em gatilhos configurados.
 * Chamado do lado do cliente (useBoardStore) apos mutacoes.
 */

function matchesTrigger(automation, context) {
  const cfg = automation.trigger_config || {};

  switch (automation.trigger_type) {
    case 'task_moved_to_column':
      return cfg.column_id ? cfg.column_id === context.columnId : true;

    case 'task_created':
      return true;

    case 'task_overdue':
      return true;

    case 'timer_completed':
      return true;

    default:
      return false;
  }
}

async function executeAction(automation, context) {
  const cfg = automation.action_config || {};
  const taskId = context.taskId;

  if (!taskId) return { success: false, error: 'taskId ausente no contexto' };

  try {
    switch (automation.action_type) {
      case 'set_priority': {
        const res = await fetch(`/api/tasks/${taskId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ priority: cfg.priority }),
        });
        return { success: res.ok, action: 'set_priority', priority: cfg.priority };
      }

      case 'assign_member': {
        const res = await fetch(`/api/tasks/${taskId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ assignee: cfg.assignee }),
        });
        return { success: res.ok, action: 'assign_member', assignee: cfg.assignee };
      }

      case 'log_execution': {
        const res = await fetch(`/api/tasks/${taskId}/execution-log`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            automation_id: automation.id,
            automation_name: automation.name,
          }),
        });
        return { success: res.ok, action: 'log_execution' };
      }

      case 'move_to_column': {
        const res = await fetch(`/api/tasks/${taskId}/move`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            column_id: cfg.column_id,
            position: cfg.position || 1,
          }),
        });
        return { success: res.ok, action: 'move_to_column', column_id: cfg.column_id };
      }

      case 'add_comment': {
        const res = await fetch(`/api/tasks/${taskId}/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            author: 'Automacao',
            content: cfg.message || `Automacao "${automation.name}" executada.`,
          }),
        });
        return { success: res.ok, action: 'add_comment' };
      }

      default:
        return { success: false, error: `Acao desconhecida: ${automation.action_type}` };
    }
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Executa automacoes ativas para um board + gatilho.
 * @param {string} boardId - ID do board
 * @param {string} triggerType - Tipo do gatilho
 * @param {object} context - Contexto { taskId, columnId, previousColumnId, ... }
 * @returns {Promise<Array>} Array de resultados de execucao
 */
export async function runAutomations(boardId, triggerType, context = {}) {
  try {
    const res = await fetch(`/api/boards/${boardId}/automations`);
    if (!res.ok) return [];

    const { automations } = await res.json();
    if (!automations || automations.length === 0) return [];

    const matching = automations.filter(
      (a) => a.enabled && a.trigger_type === triggerType && matchesTrigger(a, context)
    );

    const results = [];
    for (const automation of matching) {
      const result = await executeAction(automation, context);
      results.push({
        automationId: automation.id,
        automationName: automation.name,
        ...result,
      });
    }

    return results;
  } catch {
    return [];
  }
}
