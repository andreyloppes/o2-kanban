import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

// GET /api/boards/[boardId]/activity — List activity log
export async function GET(request, { params }) {
  const { boardId } = await params;
  const supabase = await createServerClient();
  const { searchParams } = new URL(request.url);
  const taskId = searchParams.get('task_id');
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
  const offset = parseInt(searchParams.get('offset') || '0');

  let query = supabase
    .from('activity_log')
    .select('*, user:users(id, name, slug, avatar_url, avatar_color)')
    .eq('board_id', boardId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (taskId) {
    query = query.eq('task_id', taskId);
  }

  const { data: activities, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ activities });
}

// POST /api/boards/[boardId]/activity — Create activity entry
export async function POST(request, { params }) {
  const { boardId } = await params;
  const supabase = await createServerClient();
  const body = await request.json();

  const { data: activity, error } = await supabase
    .from('activity_log')
    .insert({
      board_id: boardId,
      task_id: body.task_id || null,
      user_id: body.user_id || null,
      action: body.action,
      field_name: body.field_name || null,
      old_value: body.old_value || null,
      new_value: body.new_value || null,
      metadata: body.metadata || {},
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ activity }, { status: 201 });
}
