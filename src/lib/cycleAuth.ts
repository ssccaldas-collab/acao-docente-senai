import { getDB } from './db';
import { isGestor, isMaster, canAccessUnidade, type JWTPayload } from './auth';

type CycleAccessResult =
  | { ok: true; teacherId: number }
  | { ok: false; status: 404 | 403 };

type CycleRow = { teacher_id: number; teacher_unidade: string | null; manager_id: number | null; authorized_gestor_id: number | null };

async function fetchCycleRow(cycleId: number): Promise<CycleRow | null> {
  const sql = getDB();
  const rows = await sql`
    SELECT ec.teacher_id, t.unidade as teacher_unidade, ec.manager_id, ec.authorized_gestor_id
    FROM evaluation_cycles ec
    JOIN users t ON t.id = ec.teacher_id
    WHERE ec.id = ${cycleId}
  `;
  return (rows[0] as CycleRow) ?? null;
}

// Confere se a sessao pode VER o ciclo: docente so ve o proprio, gestor ve
// qualquer ciclo de docentes da propria unidade (master ve tudo). Usar em toda
// rota que expoe leitura de ciclo/etapa/documento/comprovante.
export async function checkCycleAccess(cycleId: number, session: JWTPayload): Promise<CycleAccessResult> {
  const row = await fetchCycleRow(cycleId);
  if (!row) return { ok: false, status: 404 };

  if (session.role === 'docente') {
    return row.teacher_id === session.id ? { ok: true, teacherId: row.teacher_id } : { ok: false, status: 403 };
  }
  if (isGestor(session.role) && !canAccessUnidade(session, row.teacher_unidade)) {
    return { ok: false, status: 403 };
  }
  return { ok: true, teacherId: row.teacher_id };
}

// Confere se a sessao pode EDITAR o ciclo: além de pertencer à unidade, um gestor
// só pode alterar o que ele mesmo iniciou (manager_id) ou um ciclo que o dono
// autorizou explicitamente (authorized_gestor_id) — a menos que seja master, ou
// que o ciclo esteja sem dono (manager_id nulo, ex: gestor removido).
export async function checkCycleWriteAccess(cycleId: number, session: JWTPayload): Promise<CycleAccessResult> {
  const row = await fetchCycleRow(cycleId);
  if (!row) return { ok: false, status: 404 };

  if (session.role === 'docente') {
    return row.teacher_id === session.id ? { ok: true, teacherId: row.teacher_id } : { ok: false, status: 403 };
  }
  if (!isGestor(session.role)) return { ok: false, status: 403 };
  if (!canAccessUnidade(session, row.teacher_unidade)) return { ok: false, status: 403 };

  if (isMaster(session.role)) return { ok: true, teacherId: row.teacher_id };

  const isOwner = row.manager_id === null || row.manager_id === session.id;
  const isAuthorized = row.authorized_gestor_id === session.id;
  if (!isOwner && !isAuthorized) return { ok: false, status: 403 };

  return { ok: true, teacherId: row.teacher_id };
}

export function cycleAccessErrorResponse(status: 404 | 403) {
  return {
    error: status === 404 ? 'Ciclo não encontrado' : 'Não autorizado',
    status,
  };
}

export function cycleWriteErrorResponse(status: 404 | 403) {
  return {
    error: status === 404 ? 'Ciclo não encontrado' : 'Só o gestor que iniciou esta Ação Docente (ou alguém autorizado por ele) pode editá-la.',
    status,
  };
}