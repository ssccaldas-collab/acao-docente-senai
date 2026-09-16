import { NextRequest, NextResponse } from 'next/server';
import { getSession, isGestor } from '@/lib/auth';
import { getDB } from '@/lib/db';
import { checkCycleAccess, cycleAccessErrorResponse } from '@/lib/cycleAuth';

// Lista os outros coordenadores/OPPs da mesma unidade do docente deste ciclo,
// pra o dono do ciclo escolher a quem autorizar a editá-lo.
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || !isGestor(session.role)) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { id } = await params;
  const access = await checkCycleAccess(Number(id), session);
  if (!access.ok) {
    const { error, status } = cycleAccessErrorResponse(access.status);
    return NextResponse.json({ error }, { status });
  }

  const sql = getDB();
  const rows = await sql`
    SELECT u.id, u.name
    FROM users u
    WHERE u.role IN ('coordenador', 'oppp')
      AND u.active = TRUE
      AND u.id != ${session.id}
      AND u.unidade = (SELECT t.unidade FROM evaluation_cycles ec JOIN users t ON t.id = ec.teacher_id WHERE ec.id = ${Number(id)})
    ORDER BY u.name
  `;
  return NextResponse.json(rows);
}