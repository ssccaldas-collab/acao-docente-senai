import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { initDB, getDB } from '@/lib/db';

export async function POST() {
  try {
    await initDB();

    const sql = getDB();
    const existing = await sql`SELECT id FROM users WHERE role = 'coordenador' LIMIT 1`;
    if (existing.length === 0) {
      const hash = await bcrypt.hash('senai@2024', 10);
      await sql`
        INSERT INTO users (name, email, password_hash, role)
        VALUES ('Coordenador', 'coordenador@senai.br', ${hash}, 'coordenador')
      `;
    }

    return NextResponse.json({ ok: true, message: 'Banco de dados inicializado com sucesso.' });
  } catch (err) {
    console.error('Init error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
