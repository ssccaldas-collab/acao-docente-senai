import { redirect } from 'next/navigation';
import { getSession, isGestor } from '@/lib/auth';
import { DocentesClient } from './DocentesClient';

export default async function DocentesPage() {
  const session = await getSession();
  if (!session || !isGestor(session.role)) redirect('/login');

  return <DocentesClient userName={session.name} role={session.role} />;
}
