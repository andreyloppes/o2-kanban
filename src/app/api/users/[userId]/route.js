import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { updateUserSchema } from '@/lib/validators';

export async function PATCH(request, { params }) {
  const { userId } = await params;
  const supabase = createServerClient();
  const body = await request.json();

  const parsed = updateUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { data: user, error } = await supabase
    .from('users')
    .update(parsed.data)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json({ user });
}
