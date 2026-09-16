import { NextRequest, NextResponse } from 'next/server';
import { getSession, isGestor, isMaster } from '@/lib/auth';
import { getDB } from '@/lib/db';
import { sendCycleStartedEmail } from '@/lib/mailer';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const semestreId = searchParams.get('semestre_id');
  const status = searchParams.get('status');
  const docenteId = searchParams.get('docente_id');

  const sql = getDB();

  const teacherFilter = session.role === 'docente' ? session.id : (docenteId ? Number(docenteId) : null);
  // Master vê todas as unidades; um gestor comum só vê docentes da própria unidade.
  const unidadeFilter = isMaster(session.role) ? null : session.unidade;

  const rows = await sql`
    SELECT
      ec.id, ec.current_stage, ec.status,
      ec.stage1_deadline, ec.stage2_deadline, ec.stage3_deadline, ec.stage4_deadline,
      ec.created_at, ec.updated_at,
      t.id as teacher_id, t.name as teacher_name, t.unidade as teacher_unidade,
      m.id as manager_id, m.name as manager_name,
      s.id as semester_id, s.label as semester_label,
      (SELECT COUNT(*) FROM documents d WHERE d.cycle_id = ec.id) as document_count
    FROM evaluation_cycles ec
    JOIN users t ON t.id = ec.teacher_id
    LEFT JOIN users m ON m.id = ec.manager_id
    JOIN semesters s ON s.id = ec.semester_id
    WHERE (${semestreId}::int IS NULL OR ec.semester_id = ${semestreId}::int)
      AND (${status}::text IS NULL OR ec.status = ${status}::text)
      AND (${teacherFilter}::int IS NULL OR ec.teacher_id = ${teacherFilter}::int)
      AND (${unidadeFilter}::text IS NULL OR t.unidade = ${unidadeFilter}::text)
    ORDER BY t.name
  `;

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !isGestor(session.role)) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { teacher_id, semester_id } = await req.json();
  if (!teacher_id || !semester_id) {
    return NextResponse.json({ error: 'Docente e semestre são obrigatórios' }, { status: 400 });
  }

  const sql = getDB();

  const teachers = await sql`SELECT id, name, email, unidade FROM users WHERE id = ${teacher_id} AND role = 'docente' AND active = TRUE`;
  if (teachers.length === 0) return NextResponse.json({ error: 'Docente não encontrado ou inativo' }, { status: 404 });
  const teacher = teachers[0];

  if (!isMaster(session.role) && teacher.unidade !== session.unidade) {
    return NextResponse.json({ error: 'Você só pode iniciar a Ação Docente de professores da sua unidade' }, { status: 403 });
  }

  const semesters = await sql`SELECT * FROM semesters WHERE id = ${semester_id}`;
  if (semesters.length === 0) return NextResponse.json({ error: 'Semestre não encontrado' }, { status: 404 });
  const semester = semesters[0];

  const existing = await sql`
    SELECT id FROM evaluation_cycles
    WHERE teacher_id = ${teacher_id} AND semester_id = ${semester_id} AND status != 'cancelado'
  `;
  if (existing.length > 0) {
    return NextResponse.json({ error: 'Este docente já tem um ciclo de Ação Docente neste semestre' }, { status: 409 });
  }

  const result = await sql`
    INSERT INTO evaluation_cycles (teacher_id, semester_id, manager_id, stage1_deadline, stage2_deadline, status)
    VALUES (${teacher_id}, ${semester_id}, ${session.id}, ${semester.default_stage1_deadline}, ${semester.default_stage2_deadline}, 'nao_iniciado')
    RETURNING id
  `;

  const deadlineText = semester.default_stage1_deadline
    ? new Date(semester.default_stage1_deadline).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
    : null;
  await sendCycleStartedEmail(teacher.email, teacher.name, deadlineText).catch(() => {});

  return NextResponse.json({ ok: true, id: result[0].id });
}
