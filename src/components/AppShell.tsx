import { Sidebar } from './Sidebar';
import type { Role } from '@/lib/auth';

export function AppShell({
  userName, role, children, maxWidth = 1100, background = '#F5F5F5',
}: {
  userName: string;
  role: Role;
  children: React.ReactNode;
  maxWidth?: number;
  background?: string;
}) {
  return (
    <div style={{ minHeight: '100vh', background }}>
      <Sidebar userName={userName} role={role} />
      <div className="app-content">
        <div style={{ maxWidth, margin: '0 auto', padding: '2rem 1.5rem' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
