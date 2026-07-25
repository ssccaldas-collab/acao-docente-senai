import { NextRequest, NextResponse } from 'next/server';
import { getSession, isGestor } from '@/lib/auth';
import { getDB } from '@/lib/db';
import { STAGE1_DOCUMENTATION_QUESTIONS, validateAnswers, type FormAnswers } from '@/lib/formQuestions';

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
    SELECT r.*, COALESCE(u.name, 'Usuário removido') as reviewed_by_name
    FROM stage1_documentation_reviews r
    LEFT JOIN users u ON u.id = r.reviewed_by
    WHERE cycle_id = ${Number(id)}
  `;
  return NextResponse.json(rows[0] ?? null);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || !isGestor(session.role)) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { id } = await params;
  const { answers, overall_comment } = await req.json() as { answers: FormAnswers; overall_comment?: string };

  const errors = validateAnswers(STAGE1_DOCUMENTATION_QUESTIONS, answers);
  if (errors.length > 0) return NextResponse.json({ error: errors.join('; ') }, { status: 400 });

  const sql = getDB();
  const cycles = await sql`SELECT id FROM evaluation_cycles WHERE id = ${Number(id)}`;
  if (cycles.length === 0) return NextResponse.json({ error: 'Ciclo não encontrado' }, { status: 404 });

  await sql`
    INSERT INTO stage1_documentation_reviews (cycle_id, reviewed_by, answers, overall_comment)
    VALUES (${Number(id)}, ${session.id}, ${JSON.stringify(answers)}, ${overall_comment || null})
    ON CONFLICT (cycle_id) DO UPDATE SET
      reviewed_by = ${session.id}, answers = ${JSON.stringify(answers)}, overall_comment = ${overall_comment || null}, reviewed_at = NOW()
  `;

  return NextResponse.json({ ok: true });
}
