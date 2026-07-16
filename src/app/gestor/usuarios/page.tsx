import { redirect } from 'next/navigation';
import { getSession, isGestor } from '@/lib/auth';
import { UsuariosClient } from './UsuariosClient';

export default async function UsuariosPage() {
  const session = await getSession();
  if (!session || !isGestor(session.role)) redirect('/login');

  return <UsuariosClient userName={session.name} role={session.role} />;
}
