import { NextRequest, NextResponse } from 'next/server';
import { getSession, isGestor } from '@/lib/auth';
import { getDB } from '@/lib/db';

const VALID_RESULTS = ['adequado', 'parcialmente_adequado', 'inadequado'];

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { id } = await params;
  const sql = getDB();

  const cycles = await sql`SELECT teacher_id FROM evaluation_cycles WHERE id = ${Number(id)}`;
  if (cycles.length === 0) return NextResponse.json({ error: 'Ciclo não encontrado' }, { status: 404 });
  if (session.role === 'docente' && cycles[0].teacher_id !== session.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }

  const rows = await sql`
    SELECT r.*, u.name as closed_by_name
    FROM stage4_replicas r
    JOIN users u ON u.id = r.closed_by
    WHERE cycle_id = ${Number(id)}
  `;
  return NextResponse.json(rows[0] ?? null);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || !isGestor(session.role)) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { id } = await params;
  const { final_result, notes } = await req.json() as { final_result?: string; notes?: string };

  if (!final_result || !VALID_RESULTS.includes(final_result)) {
    return NextResponse.json({ error: 'Resultado final inválido' }, { status: 400 });
  }

  const sql = getDB();
  const cycles = await sql`SELECT id FROM evaluation_cycles WHERE id = ${Number(id)}`;
  if (cycles.length === 0) return NextResponse.json({ error: 'Ciclo não encontrado' }, { status: 404 });

  await sql`
    INSERT INTO stage4_replicas (cycle_id, closed_by, final_result, notes)
    VALUES (${Number(id)}, ${session.id}, ${final_result}, ${notes?.trim() || null})
    ON CONFLICT (cycle_id) DO UPDATE SET
      closed_by = ${session.id}, final_result = ${final_result}, notes = ${notes?.trim() || null}
  `;

  await sql`UPDATE evaluation_cycles SET status = 'concluido', updated_at = NOW() WHERE id = ${Number(id)}`;

  return NextResponse.json({ ok: true });
}
