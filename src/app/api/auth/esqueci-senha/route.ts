import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getDB } from '@/lib/db';
import { sendPasswordResetEmail } from '@/lib/mailer';

const APP_URL = (process.env.APP_URL || 'http://localhost:3000').trim().replace(/\/+$/, '');
const GENERIC_MESSAGE = 'Se o NIF ou e-mail informado existir em nossa base, enviamos um link de redefinição de senha para o e-mail cadastrado.';

export async function POST(req: NextRequest) {
  const { identifier } = await req.json();
  const trimmed = (identifier || '').trim();

  // Sempre responde com a mesma mensagem genérica, exista ou não a conta — evita que alguém
  // descubra quais NIFs/e-mails estão cadastrados só testando essa rota.
  if (!trimmed) return NextResponse.json({ ok: true, message: GENERIC_MESSAGE });

  const sql = getDB();
  const users = await sql`
    SELECT id, name, email FROM users
    WHERE (registration_number = ${trimmed} OR LOWER(email) = LOWER(${trimmed})) AND active = TRUE
    LIMIT 1
  `;

  if (users.length === 0) return NextResponse.json({ ok: true, message: GENERIC_MESSAGE });
  const user = users[0];

  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await sql`DELETE FROM password_resets WHERE user_id = ${user.id} AND used = FALSE`;
  await sql`
    INSERT INTO password_resets (user_id, token_hash, expires_at)
    VALUES (${user.id}, ${tokenHash}, ${expiresAt.toISOString()})
  `;

  const resetLink = `${APP_URL}/redefinir-senha?token=${rawToken}`;
  await sendPasswordResetEmail(user.email, user.name, resetLink).catch(() => {});

  return NextResponse.json({ ok: true, message: GENERIC_MESSAGE });
}
