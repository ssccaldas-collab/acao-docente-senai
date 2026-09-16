import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { del } from '@vercel/blob';
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

  if (email) {
    const existingEmail = await sql`SELECT id FROM users WHERE LOWER(email) = LOWER(${email}) AND id != ${Number(id)}`;
    if (existingEmail.length > 0) return NextResponse.json({ error: 'E-mail já cadastrado para outro usuário' }, { status: 409 });
  }

  try {
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
  } catch (err) {
    console.error('Erro ao atualizar usuário:', err);
    return NextResponse.json({ error: 'Não foi possível salvar as alterações. Verifique os dados informados.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || !isGestor(session.role)) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { id } = await params;
  if (Number(id) === session.id) {
    return NextResponse.json({ error: 'Não é possível excluir seu próprio usuário' }, { status: 400 });
  }

  const sql = getDB();

  const users = await sql`SELECT id FROM users WHERE id = ${Number(id)}`;
  if (users.length === 0) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });

  // Remove os arquivos do Blob antes do cascade apagar as linhas de documentos no banco
  const docs = await sql`
    SELECT d.blob_pathname
    FROM documents d
    JOIN evaluation_cycles ec ON ec.id = d.cycle_id
    WHERE ec.teacher_id = ${Number(id)}
  `;
  for (const doc of docs as { blob_pathname: string }[]) {
    try {
      await del(doc.blob_pathname);
    } catch {
      // segue mesmo se o blob já não existir mais
    }
  }

  await sql`DELETE FROM users WHERE id = ${Number(id)}`;
  return NextResponse.json({ ok: true });
}
