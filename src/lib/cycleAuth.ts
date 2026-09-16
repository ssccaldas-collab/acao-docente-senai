import { getDB } from './db';
import { isGestor, canAccessUnidade, type JWTPayload } from './auth';

type CycleAccessResult =
  | { ok: true; teacherId: number }
  | { ok: false; status: 404 | 403 };

// Confere se a sessao pode acessar o ciclo: docente so ve o proprio, gestor so
// ve docentes da propria unidade (master ve tudo). Usar em toda rota que recebe
// um cycle id, pra impedir acesso cruzado entre unidades so trocando o numero na URL.
export async function checkCycleAccess(cycleId: number, session: JWTPayload): Promise<CycleAccessResult> {
  const sql = getDB();
  const rows = await sql`
    SELECT ec.teacher_id, t.unidade as teacher_unidade
    FROM evaluation_cycles ec
    JOIN users t ON t.id = ec.teacher_id
    WHERE ec.id = ${cycleId}
  `;
  if (rows.length === 0) return { ok: false, status: 404 };
  const { teacher_id, teacher_unidade } = rows[0] as { teacher_id: number; teacher_unidade: string | null };

  if (session.role === 'docente') {
    return teacher_id === session.id ? { ok: true, teacherId: teacher_id } : { ok: false, status: 403 };
  }
  if (isGestor(session.role) && !canAccessUnidade(session, teacher_unidade)) {
    return { ok: false, status: 403 };
  }
  return { ok: true, teacherId: teacher_id };
}

export function cycleAccessErrorResponse(status: 404 | 403) {
  return { error: status === 404 ? 'Ciclo não encontrado' : 'Não autorizado', status };
}