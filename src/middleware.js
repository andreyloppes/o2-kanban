import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // API routes e auth callback — passar direto
  if (pathname.startsWith('/api/') || pathname.startsWith('/auth/callback')) {
    return NextResponse.next({ request });
  }

  // Checar sessao pelo cookie do Supabase (sem chamada HTTP)
  const hasSession = request.cookies.getAll().some(
    (c) => c.name.startsWith('sb-') && c.name.endsWith('-auth-token')
  );

  // Nao autenticado → redirecionar para /login
  if (!hasSession && pathname !== '/login') {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Autenticado acessando /login → redirecionar para /
  if (hasSession && pathname === '/login') {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return NextResponse.next({ request });
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
