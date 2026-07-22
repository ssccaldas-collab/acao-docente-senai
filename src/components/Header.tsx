'use client';

import { useRouter } from 'next/navigation';
import { SenaiLogo } from './SenaiLogo';
import { LogOut, User } from 'lucide-react';
import type { Role } from '@/lib/auth';

interface HeaderProps {
  userName?: string;
  role?: Role;
}

const roleLabels: Record<Role, string> = {
  docente: 'Docente',
  oppp: 'OPP',
  coordenador: 'Coordenador',
};

export function Header({ userName, role }: HeaderProps) {
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  const initials = userName?.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() ?? '';
  const accentColor = role === 'docente' ? '#2E7D32' : '#4338CA';

  return (
    <header style={{ background: 'linear-gradient(135deg, #211C5C 0%, #130F35 100%)', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <SenaiLogo size="md" />
          <div style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.2)' }} />
          <div>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
              Sistema de
            </p>
            <p style={{ color: 'white', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.05em' }}>
              AÇÃO DOCENTE
            </p>
          </div>
        </div>

        {userName && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: 38, height: 38, borderRadius: '50%',
                background: accentColor,
                border: '2px solid rgba(255,255,255,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {initials ? (
                  <span style={{ color: 'white', fontWeight: 700, fontSize: '0.82rem' }}>{initials}</span>
                ) : (
                  <User size={16} color="white" />
                )}
              </div>
              <div>
                <p style={{ color: 'white', fontSize: '0.82rem', fontWeight: 600, lineHeight: 1.2 }}>{userName}</p>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem' }}>
                  {role ? roleLabels[role] : ''}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '0.4rem',
                padding: '0.4rem 0.8rem',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.8rem',
                fontWeight: 500,
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(67,56,202,0.4)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
            >
              <LogOut size={14} />
              Sair
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
