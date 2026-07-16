import { NextRequest, NextResponse } from 'next/server';
import { getSession, isGestor } from '@/lib/auth';
import { getDB } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { id } = await params;
  const sql = getDB();

  const rows = await sql`
    SELECT
      ec.id, ec.current_stage, ec.status,
      ec.stage1_deadline, ec.stage2_deadline, ec.stage3_deadline, ec.stage4_deadline,
      ec.created_at, ec.updated_at,
      t.id as teacher_id, t.name as teacher_name, t.email as teacher_email,
      m.id as manager_id, m.name as manager_name,
      s.id as semester_id, s.label as semester_label
    FROM evaluation_cycles ec
    JOIN users t ON t.id = ec.teacher_id
    LEFT JOIN users m ON m.id = ec.manager_id
    JOIN semesters s ON s.id = ec.semester_id
    WHERE ec.id = ${Number(id)}
  `;

  if (rows.length === 0) return NextResponse.json({ error: 'Ciclo não encontrado' }, { status: 404 });
  const cycle = rows[0] as { teacher_id: number };

  if (session.role === 'docente' && cycle.teacher_id !== session.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }

  return NextResponse.json(cycle);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || !isGestor(session.role)) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { id } = await params;
  const { stage1_deadline, stage2_deadline, stage3_deadline, stage4_deadline } = await req.json();
  const sql = getDB();

  await sql`
    UPDATE evaluation_cycles SET
      stage1_deadline = COALESCE(${stage1_deadline}, stage1_deadline),
      stage2_deadline = COALESCE(${stage2_deadline}, stage2_deadline),
      stage3_deadline = COALESCE(${stage3_deadline}, stage3_deadline),
      stage4_deadline = COALESCE(${stage4_deadline}, stage4_deadline),
      updated_at = NOW()
    WHERE id = ${Number(id)}
  `;

  return NextResponse.json({ ok: true });
}
