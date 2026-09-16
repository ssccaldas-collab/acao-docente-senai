import { NextRequest, NextResponse } from 'next/server';
import { getSession, isGestor } from '@/lib/auth';
import { checkCycleWriteAccess, cycleWriteErrorResponse } from '@/lib/cycleAuth';
import { generateAndStoreComprovante } from '@/lib/comprovantePdf';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || !isGestor(session.role)) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { id } = await params;
  const access = await checkCycleWriteAccess(Number(id), session);
  if (!access.ok) {
    const { error, status } = cycleWriteErrorResponse(access.status);
    return NextResponse.json({ error }, { status });
  }

  const pathname = await generateAndStoreComprovante(Number(id));
  if (!pathname) {
    return NextResponse.json({ error: 'O ciclo ainda não tem as duas assinaturas (gestor e docente) para gerar o comprovante' }, { status: 409 });
  }

  return NextResponse.json({ ok: true });
}
