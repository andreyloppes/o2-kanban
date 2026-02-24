import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB

export async function POST(request, { params }) {
  const { userId } = await params;
  const supabase = await createServerClient();

  const formData = await request.formData();
  const file = formData.get('file');

  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'Arquivo e obrigatorio' }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: 'Tipo de arquivo invalido. Use JPEG, PNG, WebP ou GIF.' },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: 'Arquivo muito grande. Maximo 2MB.' },
      { status: 400 }
    );
  }

  const ext = file.type.split('/')[1].replace('jpeg', 'jpg');
  const filePath = `${userId}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, buffer, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: urlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;

  const { data: user, error: updateError } = await supabase
    .from('users')
    .update({ avatar_url: avatarUrl })
    .eq('id', userId)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ user, avatar_url: avatarUrl });
}

export async function DELETE(request, { params }) {
  const { userId } = await params;
  const supabase = await createServerClient();

  // Remove from storage (try common extensions)
  for (const ext of ['jpg', 'png', 'webp', 'gif']) {
    await supabase.storage.from('avatars').remove([`${userId}.${ext}`]);
  }

  const { data: user, error } = await supabase
    .from('users')
    .update({ avatar_url: null })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ user });
}
