import { redirect, notFound } from 'next/navigation';
import { getSession, isGestor, canAccessUnidade } from '@/lib/auth';
import { getDB } from '@/lib/db';
import { CicloGestorClient, type CycleDetail } from './CicloGestorClient';

export default async function CicloGestorPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || !isGestor(session.role)) redirect('/login');

  const { id } = await params;
  const sql = getDB();
  const rows = await sql`
    SELECT
      ec.id, ec.current_stage, ec.status,
      ec.stage1_deadline, ec.stage2_deadline, ec.stage3_deadline, ec.stage4_deadline,
      ec.comprovante_blob_pathname, ec.comprovante_generated_at,
      ec.manager_id, ec.authorized_gestor_id,
      t.name as teacher_name, t.unidade as teacher_unidade, m.name as manager_name, a.name as authorized_gestor_name,
      s.label as semester_label
    FROM evaluation_cycles ec
    JOIN users t ON t.id = ec.teacher_id
    LEFT JOIN users m ON m.id = ec.manager_id
    LEFT JOIN users a ON a.id = ec.authorized_gestor_id
    JOIN semesters s ON s.id = ec.semester_id
    WHERE ec.id = ${Number(id)}
  `;
  if (rows.length === 0) notFound();
  if (!canAccessUnidade(session, rows[0].teacher_unidade as string | null)) notFound();

  return <CicloGestorClient userName={session.name} userId={session.id} role={session.role} cycle={rows[0] as unknown as CycleDetail} />;
}
