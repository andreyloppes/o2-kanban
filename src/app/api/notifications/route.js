import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

// GET /api/notifications — List notifications for current user
export async function GET(request) {
  const supabase = await createServerClient();
  const { searchParams } = new URL(request.url);
  const unreadOnly = searchParams.get('unread') === 'true';
  const limit = Math.min(parseInt(searchParams.get('limit') || '30'), 100);

  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) {
    return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 });
  }

  // Get our user record
  const { data: userData } = await supabase
    .from('users')
    .select('id')
    .eq('auth_id', authUser.id)
    .single();

  if (!userData) {
    return NextResponse.json({ notifications: [], unread_count: 0 });
  }

  let query = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userData.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (unreadOnly) {
    query = query.eq('is_read', false);
  }

  const { data: notifications, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Count unread
  const { count } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userData.id)
    .eq('is_read', false);

  return NextResponse.json({ notifications: notifications || [], unread_count: count || 0 });
}

// PATCH /api/notifications — Mark notifications as read
export async function PATCH(request) {
  const supabase = await createServerClient();
  const body = await request.json();

  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) {
    return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 });
  }

  const { data: userData } = await supabase
    .from('users')
    .select('id')
    .eq('auth_id', authUser.id)
    .single();

  if (!userData) {
    return NextResponse.json({ error: 'Usuario nao encontrado' }, { status: 404 });
  }

  if (body.mark_all_read) {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userData.id)
      .eq('is_read', false);
  } else if (body.notification_ids && Array.isArray(body.notification_ids)) {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userData.id)
      .in('id', body.notification_ids);
  }

  return NextResponse.json({ success: true });
}
