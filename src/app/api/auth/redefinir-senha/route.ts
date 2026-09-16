import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { getDB } from '@/lib/db';

export async function POST(req: NextRequest) {
  const { token, password } = await req.json();
  if (!token || !password) {
    return NextResponse.json({ error: 'Token e nova senha são obrigatórios' }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: 'A nova senha deve ter pelo menos 6 caracteres' }, { status: 400 });
  }

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const sql = getDB();

  const resets = await sql`
    SELECT id, user_id FROM password_resets
    WHERE token_hash = ${tokenHash} AND used = FALSE AND expires_at > NOW()
  `;
  if (resets.length === 0) {
    return NextResponse.json({ error: 'Link inválido ou expirado. Solicite uma nova redefinição.' }, { status: 400 });
  }
  const reset = resets[0];

  const hash = await bcrypt.hash(password, 10);
  await sql`UPDATE users SET password_hash = ${hash}, must_change_password = FALSE WHERE id = ${reset.user_id}`;
  await sql`UPDATE password_resets SET used = TRUE WHERE id = ${reset.id}`;

  return NextResponse.json({ ok: true });
}
