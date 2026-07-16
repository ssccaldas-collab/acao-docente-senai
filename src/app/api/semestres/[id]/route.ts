import { NextRequest, NextResponse } from 'next/server';
import { getSession, isGestor } from '@/lib/auth';
import { getDB } from '@/lib/db';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || !isGestor(session.role)) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { id } = await params;
  const { label, start_date, end_date, default_stage1_deadline, default_stage2_deadline, is_active } = await req.json();
  const sql = getDB();

  await sql`
    UPDATE semesters SET
      label = ${label},
      start_date = ${start_date},
      end_date = ${end_date},
      default_stage1_deadline = ${default_stage1_deadline || null},
      default_stage2_deadline = ${default_stage2_deadline || null},
      is_active = ${is_active ?? true}
    WHERE id = ${Number(id)}
  `;
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || !isGestor(session.role)) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { id } = await params;
  const sql = getDB();
  await sql`DELETE FROM semesters WHERE id = ${Number(id)}`;
  return NextResponse.json({ ok: true });
}
