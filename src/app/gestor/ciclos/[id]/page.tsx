import { redirect, notFound } from 'next/navigation';
import { getSession, isGestor } from '@/lib/auth';
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
      t.name as teacher_name, m.name as manager_name, s.label as semester_label
    FROM evaluation_cycles ec
    JOIN users t ON t.id = ec.teacher_id
    LEFT JOIN users m ON m.id = ec.manager_id
    JOIN semesters s ON s.id = ec.semester_id
    WHERE ec.id = ${Number(id)}
  `;
  if (rows.length === 0) notFound();

  return <CicloGestorClient userName={session.name} role={session.role} cycle={rows[0] as unknown as CycleDetail} />;
}
