import { redirect, notFound } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getDB } from '@/lib/db';
import { CicloDocenteClient, type CycleDetail } from './CicloDocenteClient';

export default async function CicloDocentePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== 'docente') redirect('/login');

  const { id } = await params;
  const sql = getDB();
  const rows = await sql`
    SELECT
      ec.id, ec.current_stage, ec.status, ec.teacher_id,
      ec.stage1_deadline, ec.stage2_deadline, ec.stage3_deadline, ec.stage4_deadline,
      m.name as manager_name, s.label as semester_label
    FROM evaluation_cycles ec
    LEFT JOIN users m ON m.id = ec.manager_id
    JOIN semesters s ON s.id = ec.semester_id
    WHERE ec.id = ${Number(id)}
  `;
  if (rows.length === 0) notFound();
  const cycle = rows[0] as { teacher_id: number } & Record<string, unknown>;
  if (cycle.teacher_id !== session.id) notFound();

  return <CicloDocenteClient userName={session.name} cycle={cycle as unknown as CycleDetail} />;
}
