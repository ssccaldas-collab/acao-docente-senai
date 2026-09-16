import { NextRequest, NextResponse } from 'next/server';
import { get } from '@vercel/blob';
import { getSession, isGestor, canAccessUnidade } from '@/lib/auth';
import { getDB } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || !isGestor(session.role)) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { id } = await params;
  const sql = getDB();

  const cycles = await sql`
    SELECT ec.comprovante_blob_pathname, t.name as teacher_name, t.unidade as teacher_unidade, s.label as semester_label
    FROM evaluation_cycles ec
    JOIN users t ON t.id = ec.teacher_id
    JOIN semesters s ON s.id = ec.semester_id
    WHERE ec.id = ${Number(id)}
  `;
  if (cycles.length === 0) return NextResponse.json({ error: 'Ciclo não encontrado' }, { status: 404 });
  const cycle = cycles[0];
  if (!canAccessUnidade(session, cycle.teacher_unidade)) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  if (!cycle.comprovante_blob_pathname) return NextResponse.json({ error: 'Comprovante ainda não gerado' }, { status: 404 });

  const result = await get(cycle.comprovante_blob_pathname as string, { access: 'private' });
  if (!result || result.statusCode !== 200) {
    return NextResponse.json({ error: 'Arquivo não encontrado no armazenamento' }, { status: 404 });
  }

  const fileName = `comprovante-${(cycle.teacher_name as string).replace(/\s+/g, '-')}-${cycle.semester_label}.pdf`;

  return new NextResponse(result.stream, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${encodeURIComponent(fileName)}"`,
    },
  });
}
