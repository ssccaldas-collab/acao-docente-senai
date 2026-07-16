import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSession, isGestor } from '@/lib/auth';
import { getDB } from '@/lib/db';

export async function GET() {
  const session = await getSession();
  if (!session || !isGestor(session.role)) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const sql = getDB();
  const users = await sql`
    SELECT id, name, registration_number, email, role, active, created_at
    FROM users
    ORDER BY role, name
  `;
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !isGestor(session.role)) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { name, registration_number, email, password, role } = await req.json();

  if (!name || !password || !role) {
    return NextResponse.json({ error: 'Nome, senha e perfil são obrigatórios' }, { status: 400 });
  }
  if (!['docente', 'oppp', 'coordenador'].includes(role)) {
    return NextResponse.json({ error: 'Perfil inválido' }, { status: 400 });
  }

  const sql = getDB();
  const regNumber = registration_number?.trim() || null;
  const emailValue = email?.trim() || `${regNumber ?? Date.now()}@senai.internal`;

  const existingEmail = await sql`SELECT id FROM users WHERE LOWER(email) = LOWER(${emailValue})`;
  if (existingEmail.length > 0) return NextResponse.json({ error: 'E-mail já cadastrado' }, { status: 409 });

  if (regNumber) {
    const existingReg = await sql`SELECT id FROM users WHERE registration_number = ${regNumber}`;
    if (existingReg.length > 0) return NextResponse.json({ error: 'Matrícula já cadastrada' }, { status: 409 });
  }

  const hash = await bcrypt.hash(password, 10);
  const result = await sql`
    INSERT INTO users (name, registration_number, email, password_hash, role)
    VALUES (${name.trim()}, ${regNumber}, ${emailValue}, ${hash}, ${role})
    RETURNING id, name, registration_number, email, role, active, created_at
  `;

  return NextResponse.json(result[0]);
}
