import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(request) {
  const body = await request.json();
  const { email, password, name } = body;

  if (!email || !password) {
    return NextResponse.json(
      { error: 'Email e senha sao obrigatorios.' },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: 'A senha deve ter pelo menos 6 caracteres.' },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name: name || '' },
  });

  if (error) {
    const messages = {
      'A user with this email address has already been registered':
        'Este email ja esta cadastrado.',
      'Unable to validate email address: invalid format':
        'Formato de email invalido.',
    };
    return NextResponse.json(
      { error: messages[error.message] || error.message },
      { status: 400 }
    );
  }

  return NextResponse.json({ user: { id: data.user.id, email: data.user.email } }, { status: 201 });
}
