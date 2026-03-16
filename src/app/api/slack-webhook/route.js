import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { error: 'Integracao Slack ainda nao implementada. Em breve.' },
    { status: 501 }
  );
}

export async function GET() {
  return NextResponse.json(
    { error: 'Integracao Slack ainda nao implementada. Em breve.' },
    { status: 501 }
  );
}
