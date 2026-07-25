import { NextRequest, NextResponse } from 'next/server';
import { getSession, isGestor } from '@/lib/auth';
import { getDB } from '@/lib/db';
import { sendCycleStartedEmail } from '@/lib/mailer';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || !isGestor(session.role)) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { id } = await params;
  const sql = getDB();

  const semesters = await sql`SELECT * FROM semesters WHERE id = ${Number(id)}`;
  if (semesters.length === 0) return NextResponse.json({ error: 'Semestre não encontrado' }, { status: 404 });
  const semester = semesters[0];

  const teachers = await sql`SELECT id, name, email FROM users WHERE role = 'docente' AND active = TRUE`;

  const deadlineText = semester.default_stage1_deadline
    ? new Date(semester.default_stage1_deadline).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
    : null;

  let created = 0;
  for (const t of teachers as { id: number; name: string; email: string }[]) {
    const existing = await sql`
      SELECT id FROM evaluation_cycles
      WHERE teacher_id = ${t.id} AND semester_id = ${semester.id} AND status != 'cancelado'
    `;
    if (existing.length > 0) continue;

    await sql`
      INSERT INTO evaluation_cycles (teacher_id, semester_id, manager_id, stage1_deadline, stage2_deadline, status)
      VALUES (${t.id}, ${semester.id}, ${session.id}, ${semester.default_stage1_deadline}, ${semester.default_stage2_deadline}, 'nao_iniciado')
    `;
    created++;
    sendCycleStartedEmail(t.email, t.name, deadlineText).catch(() => {});
  }

  return NextResponse.json({ ok: true, created, totalDocentes: teachers.length });
}
