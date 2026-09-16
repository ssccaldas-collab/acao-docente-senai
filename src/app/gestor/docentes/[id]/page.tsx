import { redirect, notFound } from 'next/navigation';
import { getSession, isGestor, canAccessUnidade } from '@/lib/auth';
import { getDB } from '@/lib/db';
import { DocenteHistoricoClient, type Teacher } from './DocenteHistoricoClient';

export default async function DocenteHistoricoPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || !isGestor(session.role)) redirect('/login');

  const { id } = await params;
  const sql = getDB();
  const users = await sql`SELECT id, name, email, registration_number, unidade FROM users WHERE id = ${Number(id)} AND role = 'docente'`;
  if (users.length === 0) notFound();
  if (!canAccessUnidade(session, users[0].unidade as string | null)) notFound();

  return <DocenteHistoricoClient userName={session.name} role={session.role} teacher={users[0] as unknown as Teacher} />;
}
