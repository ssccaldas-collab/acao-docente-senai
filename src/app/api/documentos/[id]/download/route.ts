import { NextRequest, NextResponse } from 'next/server';
import { get } from '@vercel/blob';
import { getSession, isGestor, canAccessUnidade } from '@/lib/auth';
import { getDB } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { id } = await params;
  const sql = getDB();

  const docs = await sql`
    SELECT d.file_name, d.blob_pathname, d.content_type, ec.teacher_id, t.unidade as teacher_unidade
    FROM documents d
    JOIN evaluation_cycles ec ON ec.id = d.cycle_id
    JOIN users t ON t.id = ec.teacher_id
    WHERE d.id = ${Number(id)}
  `;
  if (docs.length === 0) return NextResponse.json({ error: 'Documento não encontrado' }, { status: 404 });
  const doc = docs[0];

  if (session.role === 'docente' && doc.teacher_id !== session.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }
  if (isGestor(session.role) && !canAccessUnidade(session, doc.teacher_unidade)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }

  const result = await get(doc.blob_pathname as string, { access: 'private' });
  if (!result || result.statusCode !== 200) {
    return NextResponse.json({ error: 'Arquivo não encontrado no armazenamento' }, { status: 404 });
  }

  return new NextResponse(result.stream, {
    headers: {
      'Content-Type': (doc.content_type as string) || 'application/octet-stream',
      'Content-Disposition': `inline; filename="${encodeURIComponent(doc.file_name as string)}"`,
    },
  });
}
