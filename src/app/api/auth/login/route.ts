import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';
import { getDB } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { nif, email, password } = await req.json();
    const identifier = (nif || email || '').trim();

    if (!identifier || !password) {
      return NextResponse.json({ error: 'NIF e senha são obrigatórios' }, { status: 400 });
    }

    const sql = getDB();
    const users = await sql`
      SELECT id, name, registration_number, email, password_hash, role, active, must_change_password, unidade
      FROM users
      WHERE registration_number = ${identifier} OR LOWER(email) = LOWER(${identifier})
      LIMIT 1
    `;

    if (users.length === 0 || !users[0].active) {
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
    }

    const user = users[0];
    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
    }

    const token = await signToken({
      id: user.id, name: user.name, email: user.email, role: user.role,
      mustChangePassword: user.must_change_password, unidade: user.unidade ?? null,
    });

    const response = NextResponse.json({ role: user.role, name: user.name, mustChangePassword: user.must_change_password });
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8,
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
