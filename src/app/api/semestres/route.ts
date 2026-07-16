import { NextRequest, NextResponse } from 'next/server';
import { getSession, isGestor } from '@/lib/auth';
import { getDB } from '@/lib/db';

export async function GET() {
  const session = await getSession();
  if (!session || !isGestor(session.role)) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const sql = getDB();
  const semesters = await sql`SELECT * FROM semesters ORDER BY start_date DESC`;
  return NextResponse.json(semesters);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !isGestor(session.role)) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { label, start_date, end_date, default_stage1_deadline, default_stage2_deadline } = await req.json();

  if (!label || !start_date || !end_date) {
    return NextResponse.json({ error: 'Label, data de início e data de fim são obrigatórios' }, { status: 400 });
  }

  const sql = getDB();
  const existing = await sql`SELECT id FROM semesters WHERE label = ${label.trim()}`;
  if (existing.length > 0) return NextResponse.json({ error: 'Já existe um semestre com esse identificador' }, { status: 409 });

  const result = await sql`
    INSERT INTO semesters (label, start_date, end_date, default_stage1_deadline, default_stage2_deadline)
    VALUES (${label.trim()}, ${start_date}, ${end_date}, ${default_stage1_deadline || null}, ${default_stage2_deadline || null})
    RETURNING *
  `;
  return NextResponse.json(result[0]);
}
