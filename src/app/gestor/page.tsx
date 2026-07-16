import { redirect } from 'next/navigation';
import { getSession, isGestor } from '@/lib/auth';
import { GestorDashboard } from './GestorDashboard';

export default async function GestorPage() {
  const session = await getSession();
  if (!session || !isGestor(session.role)) redirect('/login');

  return <GestorDashboard userName={session.name} role={session.role} />;
}
