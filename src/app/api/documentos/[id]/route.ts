import { NextRequest, NextResponse } from 'next/server';
import { del } from '@vercel/blob';
import { getSession, isGestor } from '@/lib/auth';
import { getDB } from '@/lib/db';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { id } = await params;
  const sql = getDB();

  const docs = await sql`
    SELECT d.id, d.uploaded_by, d.blob_pathname, ec.teacher_id, ec.current_stage
    FROM documents d
    JOIN evaluation_cycles ec ON ec.id = d.cycle_id
    WHERE d.id = ${Number(id)}
  `;
  if (docs.length === 0) return NextResponse.json({ error: 'Documento não encontrado' }, { status: 404 });
  const doc = docs[0];

  const isOwner = session.role === 'docente' && doc.teacher_id === session.id;
  const canDelete = isGestor(session.role) || (isOwner && doc.current_stage === 1);
  if (!canDelete) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });

  await del(doc.blob_pathname as string);
  await sql`DELETE FROM documents WHERE id = ${Number(id)}`;

  return NextResponse.json({ ok: true });
}
