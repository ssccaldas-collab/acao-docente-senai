import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSession, isGestor } from '@/lib/auth';
import { getDB } from '@/lib/db';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || !isGestor(session.role)) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { id } = await params;
  const { name, registration_number, email, password, role, active } = await req.json();
  const sql = getDB();

  const regNumber = registration_number?.trim() || null;
  if (regNumber) {
    const existing = await sql`SELECT id FROM users WHERE registration_number = ${regNumber} AND id != ${Number(id)}`;
    if (existing.length > 0) return NextResponse.json({ error: 'Matrícula já cadastrada para outro usuário' }, { status: 409 });
  }

  if (password) {
    const hash = await bcrypt.hash(password, 10);
    await sql`
      UPDATE users SET name = ${name}, registration_number = ${regNumber}, email = ${email},
        password_hash = ${hash}, role = ${role}, active = ${active ?? true}
      WHERE id = ${Number(id)}
    `;
  } else {
    await sql`
      UPDATE users SET name = ${name}, registration_number = ${regNumber}, email = ${email},
        role = ${role}, active = ${active ?? true}
      WHERE id = ${Number(id)}
    `;
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || !isGestor(session.role)) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { id } = await params;
  if (Number(id) === session.id) {
    return NextResponse.json({ error: 'Não é possível desativar seu próprio usuário' }, { status: 400 });
  }

  const sql = getDB();
  await sql`UPDATE users SET active = FALSE WHERE id = ${Number(id)}`;
  return NextResponse.json({ ok: true });
}
