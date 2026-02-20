import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(request, { params }) {
  const { boardId } = await params;
  const supabase = createServerClient();

  // Buscar board
  const { data: board, error: boardError } = await supabase
    .from('boards')
    .select('*')
    .eq('id', boardId)
    .single();

  if (boardError || !board) {
    return NextResponse.json(
      { error: 'Board nao encontrado' },
      { status: 404 }
    );
  }

  // Buscar colunas ordenadas por posicao
  const { data: columns } = await supabase
    .from('columns')
    .select('*')
    .eq('board_id', boardId)
    .order('position', { ascending: true });

  // Buscar tasks ordenadas por posicao
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('board_id', boardId)
    .order('position', { ascending: true });

  return NextResponse.json({
    board,
    columns: columns || [],
    tasks: tasks || [],
  });
}
