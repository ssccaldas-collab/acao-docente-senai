import { NextResponse } from 'next/server';
import { getSession, isGestor } from '@/lib/auth';

// Rota de diagnóstico temporária — remover depois de confirmar a variável APP_URL em produção.
export async function GET() {
  const session = await getSession();
  if (!session || !isGestor(session.role)) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  return NextResponse.json({
    APP_URL_raw: process.env.APP_URL ?? null,
    APP_URL_resolved: (process.env.APP_URL || 'http://localhost:3000').trim().replace(/\/+$/, ''),
  });
}
