import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { getSession } from '@/lib/auth';
import { getDB } from '@/lib/db';

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/png',
];

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { id } = await params;
  const sql = getDB();

  const cycles = await sql`SELECT teacher_id FROM evaluation_cycles WHERE id = ${Number(id)}`;
  if (cycles.length === 0) return NextResponse.json({ error: 'Ciclo não encontrado' }, { status: 404 });
  if (session.role === 'docente' && cycles[0].teacher_id !== session.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }

  const docs = await sql`
    SELECT id, document_type, file_name, size_bytes, content_type, uploaded_at, uploaded_by
    FROM documents
    WHERE cycle_id = ${Number(id)}
    ORDER BY uploaded_at DESC
  `;
  return NextResponse.json(docs);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== 'docente') return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { id } = await params;
  const sql = getDB();

  const cycles = await sql`SELECT teacher_id, current_stage, status FROM evaluation_cycles WHERE id = ${Number(id)}`;
  if (cycles.length === 0) return NextResponse.json({ error: 'Ciclo não encontrado' }, { status: 404 });
  const cycle = cycles[0];
  if (cycle.teacher_id !== session.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  if (cycle.current_stage !== 1) return NextResponse.json({ error: 'A etapa de documentação já foi encerrada para este ciclo' }, { status: 409 });

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const documentType = (formData.get('document_type') as string) || 'outro';

  if (!file) return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
  if (file.size > MAX_SIZE_BYTES) return NextResponse.json({ error: 'Arquivo maior que 10MB' }, { status: 400 });
  if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ error: 'Tipo de arquivo não permitido' }, { status: 400 });

  const blob = await put(`docentes/${session.id}/ciclo-${id}/${Date.now()}-${file.name}`, file, {
    access: 'private',
    addRandomSuffix: true,
  });

  const result = await sql`
    INSERT INTO documents (cycle_id, uploaded_by, document_type, file_name, blob_url, blob_pathname, size_bytes, content_type)
    VALUES (${Number(id)}, ${session.id}, ${documentType}, ${file.name}, ${blob.url}, ${blob.pathname}, ${file.size}, ${file.type})
    RETURNING id, document_type, file_name, size_bytes, content_type, uploaded_at, uploaded_by
  `;

  return NextResponse.json(result[0]);
}
