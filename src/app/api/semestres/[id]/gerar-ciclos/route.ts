import { NextRequest, NextResponse } from 'next/server';
import { getSession, isGestor } from '@/lib/auth';
import { getDB } from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || !isGestor(session.role)) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { id } = await params;
  const sql = getDB();

  const semesters = await sql`SELECT * FROM semesters WHERE id = ${Number(id)}`;
  if (semesters.length === 0) return NextResponse.json({ error: 'Semestre não encontrado' }, { status: 404 });
  const semester = semesters[0];

  const teachers = await sql`SELECT id FROM users WHERE role = 'docente' AND active = TRUE`;

  let created = 0;
  for (const t of teachers as { id: number }[]) {
    const result = await sql`
      INSERT INTO evaluation_cycles (teacher_id, semester_id, manager_id, stage1_deadline, stage2_deadline, status)
      VALUES (${t.id}, ${semester.id}, ${session.id}, ${semester.default_stage1_deadline}, ${semester.default_stage2_deadline}, 'nao_iniciado')
      ON CONFLICT (teacher_id, semester_id) DO NOTHING
      RETURNING id
    `;
    if (result.length > 0) created++;
  }

  return NextResponse.json({ ok: true, created, totalDocentes: teachers.length });
}
