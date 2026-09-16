import { NextRequest, NextResponse } from 'next/server';
import { getSession, isGestor } from '@/lib/auth';
import { getDB } from '@/lib/db';
import { checkCycleAccess, cycleAccessErrorResponse } from '@/lib/cycleAuth';
import { STAGE2_CLASSROOM_OBSERVATION_QUESTIONS, validateAnswers, type FormAnswers } from '@/lib/formQuestions';

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
    SELECT o.*, COALESCE(u.name, 'Usuário removido') as observed_by_name
    FROM stage2_classroom_observations o
    LEFT JOIN users u ON u.id = o.observed_by
    WHERE cycle_id = ${Number(id)}
  `;
  return NextResponse.json(rows[0] ?? null);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || !isGestor(session.role)) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { id } = await params;
  const access = await checkCycleAccess(Number(id), session);
  if (!access.ok) {
    const { error, status } = cycleAccessErrorResponse(access.status);
    return NextResponse.json({ error }, { status });
  }

  const { answers, overall_comment, observation_date } = await req.json() as { answers: FormAnswers; overall_comment?: string; observation_date?: string };

  const errors = validateAnswers(STAGE2_CLASSROOM_OBSERVATION_QUESTIONS, answers);
  if (errors.length > 0) return NextResponse.json({ error: errors.join('; ') }, { status: 400 });

  const sql = getDB();
  const cycles = await sql`SELECT current_stage FROM evaluation_cycles WHERE id = ${Number(id)}`;

  await sql`
    INSERT INTO stage2_classroom_observations (cycle_id, observed_by, observation_date, answers, overall_comment)
    VALUES (${Number(id)}, ${session.id}, ${observation_date || null}, ${JSON.stringify(answers)}, ${overall_comment || null})
    ON CONFLICT (cycle_id) DO UPDATE SET
      observed_by = ${session.id}, observation_date = ${observation_date || null}, answers = ${JSON.stringify(answers)}, overall_comment = ${overall_comment || null}, observed_at = NOW()
  `;

  const currentStage = cycles[0].current_stage as number;
  if (currentStage <= 2) {
    await sql`UPDATE evaluation_cycles SET current_stage = 3, status = 'em_andamento', updated_at = NOW() WHERE id = ${Number(id)}`;
  }

  return NextResponse.json({ ok: true });
}