import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getDB } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const semestreId = searchParams.get('semestre_id');
  const status = searchParams.get('status');
  const docenteId = searchParams.get('docente_id');

  const sql = getDB();

  const teacherFilter = session.role === 'docente' ? session.id : (docenteId ? Number(docenteId) : null);

  const rows = await sql`
    SELECT
      ec.id, ec.current_stage, ec.status,
      ec.stage1_deadline, ec.stage2_deadline, ec.stage3_deadline, ec.stage4_deadline,
      ec.created_at, ec.updated_at,
      t.id as teacher_id, t.name as teacher_name,
      m.id as manager_id, m.name as manager_name,
      s.id as semester_id, s.label as semester_label
    FROM evaluation_cycles ec
    JOIN users t ON t.id = ec.teacher_id
    LEFT JOIN users m ON m.id = ec.manager_id
    JOIN semesters s ON s.id = ec.semester_id
    WHERE (${semestreId}::int IS NULL OR ec.semester_id = ${semestreId}::int)
      AND (${status}::text IS NULL OR ec.status = ${status}::text)
      AND (${teacherFilter}::int IS NULL OR ec.teacher_id = ${teacherFilter}::int)
    ORDER BY t.name
  `;

  return NextResponse.json(rows);
}
