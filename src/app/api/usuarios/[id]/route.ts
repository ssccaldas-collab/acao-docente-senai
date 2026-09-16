import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { del } from '@vercel/blob';
import { getSession, isGestor, isMaster } from '@/lib/auth';
import { getDB } from '@/lib/db';
import { isValidUnidade } from '@/lib/unidades';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || !isGestor(session.role)) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { id } = await params;
  const sql = getDB();

  const targets = await sql`SELECT role, unidade FROM users WHERE id = ${Number(id)}`;
  if (targets.length === 0) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
  const target = targets[0];

  if (!isMaster(session.role) && (target.role !== 'docente' || target.unidade !== session.unidade)) {
    return NextResponse.json({ error: 'Você só pode editar docentes da sua unidade' }, { status: 403 });
  }

  const { name, registration_number, email, password, role, active, unidade } = await req.json();

  // Gestor comum não pode trocar o perfil nem a unidade do docente que edita.
  const finalRole = isMaster(session.role) ? role : 'docente';
  let finalUnidade: string | null = isMaster(session.role) ? unidade : session.unidade;
  if (finalRole === 'master') finalUnidade = null;
  if (finalRole !== 'master' && !isValidUnidade(finalUnidade)) {
    return NextResponse.json({ error: 'Unidade inválida ou não informada' }, { status: 400 });
  }
  if (!['docente', 'oppp', 'coordenador', 'master'].includes(finalRole)) {
    return NextResponse.json({ error: 'Perfil inválido' }, { status: 400 });
  }

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
          password_hash = ${hash}, role = ${finalRole}, active = ${active ?? true}, unidade = ${finalUnidade}
        WHERE id = ${Number(id)}
      `;
    } else {
      await sql`
        UPDATE users SET name = ${name}, registration_number = ${regNumber}, email = ${email},
          role = ${finalRole}, active = ${active ?? true}, unidade = ${finalUnidade}
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

  const users = await sql`SELECT id, role, unidade FROM users WHERE id = ${Number(id)}`;
  if (users.length === 0) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
  const target = users[0];

  if (!isMaster(session.role) && (target.role !== 'docente' || target.unidade !== session.unidade)) {
    return NextResponse.json({ error: 'Você só pode excluir docentes da sua unidade' }, { status: 403 });
  }

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