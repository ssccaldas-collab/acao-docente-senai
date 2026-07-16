import { redirect } from 'next/navigation';
import { getSession, isGestor } from '@/lib/auth';
import { SemestresClient } from './SemestresClient';

export default async function SemestresPage() {
  const session = await getSession();
  if (!session || !isGestor(session.role)) redirect('/login');

  return <SemestresClient userName={session.name} role={session.role} />;
}
