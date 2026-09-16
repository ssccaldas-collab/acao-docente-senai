import { NextRequest, NextResponse } from 'next/server';
import { getSession, isGestor } from '@/lib/auth';
import { getDB } from '@/lib/db';
import { checkCycleAccess, cycleAccessErrorResponse, checkCycleWriteAccess, cycleWriteErrorResponse } from '@/lib/cycleAuth';

const VALID_RESULTS = ['adequado', 'parcialmente_adequado', 'inadequado'];

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { id } = await params;
  const access = await checkCycleAccess(Number(id), session);
  if (!access.ok) {
    const { error, status } = cycleAccessErrorResponse(access.status);
    return NextResponse.json({ error }, { status });
  }

  const sql = getDB();
  const rows = await sql`
    SELECT r.*, COALESCE(u.name, 'Usuário removido') as closed_by_name
    FROM stage4_replicas r
    LEFT JOIN users u ON u.id = r.closed_by
    WHERE cycle_id = ${Number(id)}
  `;
  return NextResponse.json(rows[0] ?? null);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || !isGestor(session.role)) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { id } = await params;
  const access = await checkCycleWriteAccess(Number(id), session);
  if (!access.ok) {
    const { error, status } = cycleWriteErrorResponse(access.status);
    return NextResponse.json({ error }, { status });
  }

  const { final_result, notes, manager_signature } = await req.json() as { final_result?: string; notes?: string; manager_signature?: string };

  if (!final_result || !VALID_RESULTS.includes(final_result)) {
    return NextResponse.json({ error: 'Resultado final inválido' }, { status: 400 });
  }
  if (!manager_signature) {
    return NextResponse.json({ error: 'A assinatura do gestor é obrigatória para encerrar o ciclo' }, { status: 400 });
  }

  const sql = getDB();

  // Se o resultado for editado depois, a assinatura anterior do docente perde validade e ele precisa assinar de novo.
  await sql`
    INSERT INTO stage4_replicas (cycle_id, closed_by, final_result, notes, manager_signature)
    VALUES (${Number(id)}, ${session.id}, ${final_result}, ${notes?.trim() || null}, ${manager_signature})
    ON CONFLICT (cycle_id) DO UPDATE SET
      closed_by = ${session.id}, final_result = ${final_result}, notes = ${notes?.trim() || null},
      manager_signature = ${manager_signature}, docente_signature = NULL, docente_signed_at = NULL, closed_at = NOW()
  `;

  await sql`UPDATE evaluation_cycles SET status = 'concluido', updated_at = NOW() WHERE id = ${Number(id)}`;

  return NextResponse.json({ ok: true });
}