import { NextRequest, NextResponse } from 'next/server';
import { getSession, isGestor, isMaster } from '@/lib/auth';
import { getDB } from '@/lib/db';

// Só quem iniciou o ciclo (manager_id) ou o master pode autorizar/revogar outro
// gestor a editá-lo — o próprio autorizado não pode repassar a autorização adiante.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || !isGestor(session.role)) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { id } = await params;
  const { authorized_gestor_id } = await req.json() as { authorized_gestor_id: number | null };

  const sql = getDB();
  const cycles = await sql`
    SELECT ec.manager_id, t.unidade as teacher_unidade
    FROM evaluation_cycles ec JOIN users t ON t.id = ec.teacher_id
    WHERE ec.id = ${Number(id)}
  `;
  if (cycles.length === 0) return NextResponse.json({ error: 'Ciclo não encontrado' }, { status: 404 });
  const cycle = cycles[0];

  const isOwner = cycle.manager_id === null || cycle.manager_id === session.id;
  if (!isMaster(session.role) && !isOwner) {
    return NextResponse.json({ error: 'Só quem iniciou esta Ação Docente pode autorizar outra pessoa a editá-la' }, { status: 403 });
  }

  if (authorized_gestor_id !== null) {
    const candidates = await sql`
      SELECT id FROM users
      WHERE id = ${authorized_gestor_id} AND role IN ('coordenador', 'oppp') AND active = TRUE AND unidade = ${cycle.teacher_unidade}
    `;
    if (candidates.length === 0) {
      return NextResponse.json({ error: 'Selecione um gestor válido da mesma unidade' }, { status: 400 });
    }
  }

  await sql`UPDATE evaluation_cycles SET authorized_gestor_id = ${authorized_gestor_id}, updated_at = NOW() WHERE id = ${Number(id)}`;

  return NextResponse.json({ ok: true });
}