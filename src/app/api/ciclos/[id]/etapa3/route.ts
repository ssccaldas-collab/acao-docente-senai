import { NextRequest, NextResponse } from 'next/server';
import { getSession, isGestor } from '@/lib/auth';
import { getDB } from '@/lib/db';
import { sendFeedbackRegisteredEmail } from '@/lib/mailer';

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
    SELECT f.*, u.name as applied_by_name
    FROM stage3_feedback_sessions f
    JOIN users u ON u.id = f.applied_by
    WHERE cycle_id = ${Number(id)}
  `;
  return NextResponse.json(rows[0] ?? null);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || !isGestor(session.role)) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { id } = await params;
  const { session_date, notes } = await req.json() as { session_date?: string; notes?: string };

  if (!session_date || !notes?.trim()) {
    return NextResponse.json({ error: 'Data da devolutiva e apontamentos são obrigatórios' }, { status: 400 });
  }

  const sql = getDB();
  const cycles = await sql`
    SELECT ec.current_stage, u.name as teacher_name, u.email as teacher_email
    FROM evaluation_cycles ec JOIN users u ON u.id = ec.teacher_id
    WHERE ec.id = ${Number(id)}
  `;
  if (cycles.length === 0) return NextResponse.json({ error: 'Ciclo não encontrado' }, { status: 404 });

  const wasAlreadyRegistered = cycles[0].current_stage > 3;

  await sql`
    INSERT INTO stage3_feedback_sessions (cycle_id, applied_by, session_date, notes)
    VALUES (${Number(id)}, ${session.id}, ${session_date}, ${notes.trim()})
    ON CONFLICT (cycle_id) DO UPDATE SET
      applied_by = ${session.id}, session_date = ${session_date}, notes = ${notes.trim()}
  `;

  const currentStage = cycles[0].current_stage as number;
  if (currentStage <= 3) {
    await sql`UPDATE evaluation_cycles SET current_stage = 4, status = 'em_andamento', updated_at = NOW() WHERE id = ${Number(id)}`;
  }

  if (!wasAlreadyRegistered) {
    sendFeedbackRegisteredEmail(cycles[0].teacher_email as string, cycles[0].teacher_name as string).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
