import { NextRequest, NextResponse } from 'next/server';
import { getSession, isGestor } from '@/lib/auth';
import { getDB } from '@/lib/db';
import { sendCycleStartedEmail } from '@/lib/mailer';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || !isGestor(session.role)) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { id } = await params;
  const sql = getDB();

  const cycles = await sql`
    SELECT ec.teacher_id, ec.semester_id, ec.stage1_deadline, ec.stage2_deadline, u.name as teacher_name, u.email as teacher_email
    FROM evaluation_cycles ec JOIN users u ON u.id = ec.teacher_id
    WHERE ec.id = ${Number(id)}
  `;
  if (cycles.length === 0) return NextResponse.json({ error: 'Ciclo não encontrado' }, { status: 404 });
  const cycle = cycles[0];

  // Arquiva o ciclo atual (fica disponível no histórico do docente) e cria um novo ciclo em branco.
  await sql`UPDATE evaluation_cycles SET status = 'cancelado', updated_at = NOW() WHERE id = ${Number(id)}`;

  const result = await sql`
    INSERT INTO evaluation_cycles (teacher_id, semester_id, manager_id, stage1_deadline, stage2_deadline, status)
    VALUES (${cycle.teacher_id}, ${cycle.semester_id}, ${session.id}, ${cycle.stage1_deadline}, ${cycle.stage2_deadline}, 'nao_iniciado')
    RETURNING id
  `;

  const deadlineText = cycle.stage1_deadline
    ? new Date(cycle.stage1_deadline).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
    : null;
  await sendCycleStartedEmail(cycle.teacher_email as string, cycle.teacher_name as string, deadlineText).catch(() => {});

  return NextResponse.json({ ok: true, id: result[0].id });
}
