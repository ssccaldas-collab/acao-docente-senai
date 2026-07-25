import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getDB } from '@/lib/db';
import { generateAndStoreComprovante } from '@/lib/comprovantePdf';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== 'docente') return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { id } = await params;
  const { docente_signature } = await req.json() as { docente_signature?: string };
  if (!docente_signature) return NextResponse.json({ error: 'Assinatura é obrigatória' }, { status: 400 });

  const sql = getDB();
  const cycles = await sql`SELECT teacher_id FROM evaluation_cycles WHERE id = ${Number(id)}`;
  if (cycles.length === 0) return NextResponse.json({ error: 'Ciclo não encontrado' }, { status: 404 });
  if (cycles[0].teacher_id !== session.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });

  const result = await sql`
    UPDATE stage4_replicas SET docente_signature = ${docente_signature}, docente_signed_at = NOW()
    WHERE cycle_id = ${Number(id)}
    RETURNING id
  `;
  if (result.length === 0) return NextResponse.json({ error: 'Réplica ainda não registrada pelo gestor' }, { status: 409 });

  // Com as duas assinaturas completas, gera o comprovante em PDF automaticamente.
  try {
    await generateAndStoreComprovante(Number(id));
  } catch (err) {
    console.error('Falha ao gerar comprovante em PDF:', err);
  }

  return NextResponse.json({ ok: true });
}
