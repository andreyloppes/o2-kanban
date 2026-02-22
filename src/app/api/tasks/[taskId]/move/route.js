import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { moveTaskSchema } from '@/lib/validators';

export async function PATCH(request, { params }) {
  const { taskId } = await params;
  const supabase = await createServerClient();
  const body = await request.json();

  // Validar com Zod
  const parsed = moveTaskSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { column_id, position, column_entered_at } = parsed.data;

  const updateData = { column_id, position };
  if (column_entered_at) {
    updateData.column_entered_at = column_entered_at;
  }

  const { data: task, error } = await supabase
    .from('tasks')
    .update(updateData)
    .eq('id', taskId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ task });
}
