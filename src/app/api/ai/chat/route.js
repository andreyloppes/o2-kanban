import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { buildSystemPrompt } from '@/lib/ai/systemPrompt';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

async function getUserBoardRole(supabase, boardId) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { user: null, role: null };
  const { data } = await supabase
    .from('board_members')
    .select('role')
    .eq('board_id', boardId)
    .eq('user_id', user.id)
    .single();
  return { user, role: data?.role || null };
}

async function fetchBoardData(supabase, boardId) {
  const [boardRes, columnsRes, tasksRes, membersRes, usersRes] = await Promise.all([
    supabase.from('boards').select('*').eq('id', boardId).single(),
    supabase.from('columns').select('*').eq('board_id', boardId).order('position', { ascending: true }),
    supabase.from('tasks').select('*').eq('board_id', boardId).order('position', { ascending: true }),
    supabase.from('board_members').select('*').eq('board_id', boardId),
    supabase.from('users').select('*'),
  ]);

  if (boardRes.error || !boardRes.data) return null;

  const members = (membersRes.data || []).map((bm) => {
    const user = (usersRes.data || []).find((u) => u.id === bm.user_id);
    return { ...bm, user: user || null };
  });

  return {
    board: boardRes.data,
    columns: columnsRes.data || [],
    tasks: tasksRes.data || [],
    members,
  };
}

function parseActions(responseText, boardData) {
  const actions = [];
  const lines = responseText.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();

    const criarMatch = trimmed.match(/^\/criar\s+(.+)$/i);
    if (criarMatch) {
      actions.push({ type: 'create_task', title: criarMatch[1].trim() });
    }

    const moverMatch = trimmed.match(/^\/mover\s+(.+?)\s+(?:para\s+)?(.+)$/i);
    if (moverMatch) {
      actions.push({ type: 'move_task', taskTitle: moverMatch[1].trim(), columnTitle: moverMatch[2].trim() });
    }

    const prioridadeMatch = trimmed.match(/^\/prioridade\s+(.+?)\s+(low|medium|high|urgent)$/i);
    if (prioridadeMatch) {
      actions.push({ type: 'change_priority', taskTitle: prioridadeMatch[1].trim(), priority: prioridadeMatch[2].toLowerCase() });
    }
  }

  return actions;
}

async function executeActions(actions, boardData, supabase) {
  const results = [];
  const { board, columns, tasks } = boardData;

  for (const action of actions) {
    if (action.type === 'create_task') {
      const firstColumn = columns[0];
      if (!firstColumn) {
        results.push({ action, success: false, error: 'Nenhuma coluna encontrada' });
        continue;
      }

      const colTasks = tasks.filter((t) => t.column_id === firstColumn.id);
      const maxPos = colTasks.length > 0 ? Math.max(...colTasks.map((t) => t.position)) : 0;
      const position = maxPos + 1000;

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          board_id: board.id,
          column_id: firstColumn.id,
          title: action.title,
          position,
          type: 'task',
          priority: 'medium',
        })
        .select()
        .single();

      results.push({
        action,
        success: !error,
        result: data ? `Tarefa "${action.title}" criada na coluna "${firstColumn.title}"` : null,
        error: error?.message,
      });
    }

    if (action.type === 'move_task') {
      const task = tasks.find(
        (t) => t.title.toLowerCase() === action.taskTitle.toLowerCase()
      );
      const targetCol = columns.find(
        (c) => c.title.toLowerCase() === action.columnTitle.toLowerCase()
      );

      if (!task) {
        results.push({ action, success: false, error: `Tarefa "${action.taskTitle}" nao encontrada` });
        continue;
      }
      if (!targetCol) {
        results.push({ action, success: false, error: `Coluna "${action.columnTitle}" nao encontrada` });
        continue;
      }

      const colTasks = tasks.filter((t) => t.column_id === targetCol.id);
      const maxPos = colTasks.length > 0 ? Math.max(...colTasks.map((t) => t.position)) : 0;

      const { error } = await supabase
        .from('tasks')
        .update({
          column_id: targetCol.id,
          position: maxPos + 1000,
          column_entered_at: new Date().toISOString(),
        })
        .eq('id', task.id);

      results.push({
        action,
        success: !error,
        result: !error ? `Tarefa "${task.title}" movida para "${targetCol.title}"` : null,
        error: error?.message,
      });
    }

    if (action.type === 'change_priority') {
      const task = tasks.find(
        (t) => t.title.toLowerCase() === action.taskTitle.toLowerCase()
      );

      if (!task) {
        results.push({ action, success: false, error: `Tarefa "${action.taskTitle}" nao encontrada` });
        continue;
      }

      const { error } = await supabase
        .from('tasks')
        .update({ priority: action.priority })
        .eq('id', task.id);

      results.push({
        action,
        success: !error,
        result: !error ? `Prioridade de "${task.title}" alterada para ${action.priority}` : null,
        error: error?.message,
      });
    }
  }

  return results;
}

export async function POST(request) {
  const supabase = await createServerClient();

  // Autenticar usuario
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Body invalido' }, { status: 400 });
  }

  const { boardId, message, history = [] } = body;

  if (!boardId || !message) {
    return NextResponse.json({ error: 'boardId e message sao obrigatorios' }, { status: 400 });
  }

  // Verificar acesso ao board
  const { role: userRole } = await getUserBoardRole(supabase, boardId);

  // Buscar dados do board
  const boardData = await fetchBoardData(supabase, boardId);
  if (!boardData) {
    return NextResponse.json({ error: 'Board nao encontrado' }, { status: 404 });
  }

  // Construir system prompt
  const systemPrompt = buildSystemPrompt({
    ...boardData,
    userRole,
  });

  // Montar mensagens (ultimas 10 do historico + nova)
  const messages = [
    ...history.slice(-10).map((h) => ({ role: h.role, content: h.content })),
    { role: 'user', content: message },
  ];

  // Verificar API key
  const apiKey = process.env.ANTHROPIC_API_KEY;
  let assistantMessage;
  let actions = [];

  if (!apiKey) {
    assistantMessage = 'Agente de IA nao configurado. Adicione ANTHROPIC_API_KEY nas variaveis de ambiente.';
  } else {
    try {
      const response = await fetch(ANTHROPIC_API_URL, {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          system: systemPrompt,
          messages,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API error: ${response.status}`);
      }

      const data = await response.json();
      assistantMessage = data.content?.[0]?.text || 'Sem resposta do modelo.';

      // Parsear e executar acoes (somente para owners)
      if (userRole === 'owner') {
        actions = parseActions(assistantMessage, boardData);
        if (actions.length > 0) {
          const results = await executeActions(actions, boardData, supabase);
          actions = results;
        }
      }
    } catch (error) {
      assistantMessage = `Erro ao consultar IA: ${error.message}`;
    }
  }

  // Salvar mensagens no historico
  await supabase.from('ai_chat_history').insert([
    { board_id: boardId, user_id: user.id, role: 'user', content: message },
    { board_id: boardId, user_id: user.id, role: 'assistant', content: assistantMessage },
  ]);

  return NextResponse.json({ message: assistantMessage, actions });
}
