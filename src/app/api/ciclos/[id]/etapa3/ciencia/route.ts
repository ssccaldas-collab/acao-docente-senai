import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getDB } from '@/lib/db';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== 'docente') return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { id } = await params;
  const sql = getDB();

  const cycles = await sql`SELECT teacher_id FROM evaluation_cycles WHERE id = ${Number(id)}`;
  if (cycles.length === 0) return NextResponse.json({ error: 'Ciclo não encontrado' }, { status: 404 });
  if (cycles[0].teacher_id !== session.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });

  const result = await sql`
    UPDATE stage3_feedback_sessions SET teacher_acknowledged = TRUE, teacher_acknowledged_at = NOW()
    WHERE cycle_id = ${Number(id)}
    RETURNING id
  `;
  if (result.length === 0) return NextResponse.json({ error: 'Devolutiva ainda não registrada' }, { status: 409 });

  return NextResponse.json({ ok: true });
}
