import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { DocenteDashboard } from './DocenteDashboard';

export default async function DocentePage() {
  const session = await getSession();
  if (!session || session.role !== 'docente') redirect('/login');

  return <DocenteDashboard userName={session.name} />;
}
