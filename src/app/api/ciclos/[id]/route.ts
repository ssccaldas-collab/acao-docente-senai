import { NextRequest, NextResponse } from 'next/server';
import { del } from '@vercel/blob';
import { getSession, isGestor, canAccessUnidade } from '@/lib/auth';
import { getDB } from '@/lib/db';
import { checkCycleWriteAccess, cycleWriteErrorResponse } from '@/lib/cycleAuth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { id } = await params;
  const sql = getDB();

  const rows = await sql`
    SELECT
      ec.id, ec.current_stage, ec.status,
      ec.stage1_deadline, ec.stage2_deadline, ec.stage3_deadline, ec.stage4_deadline,
      ec.comprovante_blob_pathname, ec.comprovante_generated_at,
      ec.created_at, ec.updated_at,
      t.id as teacher_id, t.name as teacher_name, t.email as teacher_email, t.unidade as teacher_unidade,
      m.id as manager_id, m.name as manager_name,
      s.id as semester_id, s.label as semester_label
    FROM evaluation_cycles ec
    JOIN users t ON t.id = ec.teacher_id
    LEFT JOIN users m ON m.id = ec.manager_id
    JOIN semesters s ON s.id = ec.semester_id
    WHERE ec.id = ${Number(id)}
  `;

  if (rows.length === 0) return NextResponse.json({ error: 'Ciclo não encontrado' }, { status: 404 });
  const cycle = rows[0] as { teacher_id: number; teacher_unidade: string | null };

  if (session.role === 'docente' && cycle.teacher_id !== session.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }
  if (isGestor(session.role) && !canAccessUnidade(session, cycle.teacher_unidade)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }

  return NextResponse.json(cycle);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || !isGestor(session.role)) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { id } = await params;
  const access = await checkCycleWriteAccess(Number(id), session);
  if (!access.ok) {
    const { error, status } = cycleWriteErrorResponse(access.status);
    return NextResponse.json({ error }, { status });
  }

  const sql = getDB();
  const { stage1_deadline, stage2_deadline, stage3_deadline, stage4_deadline } = await req.json();

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

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || !isGestor(session.role)) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { id } = await params;
  const access = await checkCycleWriteAccess(Number(id), session);
  if (!access.ok) {
    const { error, status } = cycleWriteErrorResponse(access.status);
    return NextResponse.json({ error }, { status });
  }

  const sql = getDB();
  const cycles = await sql`
    SELECT ec.comprovante_blob_pathname
    FROM evaluation_cycles ec
    WHERE ec.id = ${Number(id)}
  `;

  const docs = await sql`SELECT blob_pathname FROM documents WHERE cycle_id = ${Number(id)}`;
  const pathnames = [
    ...(docs as { blob_pathname: string }[]).map(d => d.blob_pathname),
    ...(cycles[0].comprovante_blob_pathname ? [cycles[0].comprovante_blob_pathname as string] : []),
  ];
  for (const pathname of pathnames) {
    try {
      await del(pathname);
    } catch {
      // segue mesmo se o blob já não existir mais
    }
  }

  await sql`DELETE FROM evaluation_cycles WHERE id = ${Number(id)}`;
  return NextResponse.json({ ok: true });
}