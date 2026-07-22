import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSession, signToken } from '@/lib/auth';
import { getDB } from '@/lib/db';

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { current_password, new_password } = await req.json();
  if (!current_password || !new_password) {
    return NextResponse.json({ error: 'Senha atual e nova senha são obrigatórias' }, { status: 400 });
  }
  if (new_password.length < 6) {
    return NextResponse.json({ error: 'A nova senha deve ter pelo menos 6 caracteres' }, { status: 400 });
  }

  const sql = getDB();
  const users = await sql`SELECT password_hash FROM users WHERE id = ${session.id}`;
  if (users.length === 0) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });

  const valid = await bcrypt.compare(current_password, users[0].password_hash);
  if (!valid) return NextResponse.json({ error: 'Senha atual incorreta' }, { status: 401 });

  const hash = await bcrypt.hash(new_password, 10);
  await sql`UPDATE users SET password_hash = ${hash}, must_change_password = FALSE WHERE id = ${session.id}`;

  const token = await signToken({ ...session, mustChangePassword: false });
  const response = NextResponse.json({ ok: true });
  response.cookies.set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8,
    path: '/',
  });

  return response;
}
