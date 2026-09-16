import { NextRequest, NextResponse } from 'next/server';
import { getSession, isGestor } from '@/lib/auth';
import { getDB } from '@/lib/db';
import { checkCycleAccess, cycleAccessErrorResponse } from '@/lib/cycleAuth';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || !isGestor(session.role)) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { id } = await params;
  const access = await checkCycleAccess(Number(id), session);
  if (!access.ok) {
    const { error, status } = cycleAccessErrorResponse(access.status);
    return NextResponse.json({ error }, { status });
  }

  const sql = getDB();
  const cycles = await sql`SELECT current_stage, status FROM evaluation_cycles WHERE id = ${Number(id)}`;
  if (cycles[0].current_stage !== 1) {
    return NextResponse.json({ error: 'Este ciclo já não está mais na Etapa 1' }, { status: 409 });
  }

  await sql`UPDATE evaluation_cycles SET current_stage = 2, status = 'em_andamento', updated_at = NOW() WHERE id = ${Number(id)}`;

  return NextResponse.json({ ok: true });
}