import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { moveTaskSchema } from '@/lib/validators';

export async function PATCH(request, { params }) {
  const { taskId } = await params;
  const supabase = createServerClient();
  const body = await request.json();

  // Validar com Zod
  const parsed = moveTaskSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { column_id, position } = parsed.data;

  const { data: task, error } = await supabase
    .from('tasks')
    .update({ column_id, position })
    .eq('id', taskId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ task });
}
