'use client';

import { usePathname, useRouter } from 'next/navigation';
import { SenaiLogo } from './SenaiLogo';
import { LayoutDashboard, GraduationCap, CalendarDays, Users, LogOut, User, Crown } from 'lucide-react';
import type { Role } from '@/lib/auth';

interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
}

const GESTOR_NAV: NavItem[] = [
  { label: 'Início', href: '/gestor', icon: LayoutDashboard },
  { label: 'Docentes', href: '/gestor/docentes', icon: GraduationCap },
  { label: 'Semestres', href: '/gestor/semestres', icon: CalendarDays },
  { label: 'Usuários', href: '/gestor/usuarios', icon: Users },
];

const DOCENTE_NAV: NavItem[] = [
  { label: 'Início', href: '/docente', icon: LayoutDashboard },
];

const roleLabels: Record<Role, string> = {
  docente: 'Docente',
  oppp: 'OPP',
  coordenador: 'Coordenador',
  master: 'Master',
};

export function Sidebar({ userName, role }: { userName?: string; role?: Role }) {
  const pathname = usePathname();
  const router = useRouter();
  const items = role === 'docente' ? DOCENTE_NAV : GESTOR_NAV;

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  const initials = userName?.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() ?? '';
  const isMasterRole = role === 'master';
  const accentColor = isMasterRole ? '#D9922E' : role === 'docente' ? '#2E7D32' : '#4338CA';
  const sidebarBg = isMasterRole
    ? 'linear-gradient(180deg, #000000 0%, #0A0A0A 55%, #241705 100%)'
    : 'linear-gradient(180deg, #211C5C 0%, #130F35 100%)';
  const activeDotColor = isMasterRole ? '#F0AC66' : '#69F0AE';

  return (
    <aside className="sidebar" style={{
      position: 'fixed', top: 0, left: 0, bottom: 0,
      background: sidebarBg,
      display: 'flex', flexDirection: 'column',
      boxShadow: '2px 0 8px rgba(0,0,0,0.2)', zIndex: 100,
    }}>
      <div className="sidebar-brand" style={{ padding: '1.4rem 1.1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="sidebar-logo-full" style={{ width: 'fit-content', marginBottom: '0.85rem' }}>
          <SenaiLogo size="md" />
        </div>
        <div className="sidebar-logo-mini" style={{ width: 34, height: 34, borderRadius: '0.6rem', background: 'rgba(255,255,255,0.1)', display: 'none', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.85rem' }}>
          <GraduationCap size={18} color="white" />
        </div>
        <div className="sidebar-label">
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>Sistema de</p>
          <p style={{ color: 'white', fontSize: '0.82rem', fontWeight: 700, letterSpacing: '0.03em', whiteSpace: 'nowrap' }}>AÇÃO DOCENTE</p>
          {isMasterRole && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.4rem', background: '#000000', border: '1px solid rgba(217,146,46,0.6)', borderRadius: '999px', padding: '0.2rem 0.55rem', width: 'fit-content' }}>
              <Crown size={11} color={accentColor} />
              <span style={{ color: accentColor, fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.05em' }}>MASTER</span>
            </div>
          )}
        </div>
      </div>

      <nav style={{ flex: 1, padding: '1rem 0.7rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        {items.map(item => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <button key={item.href} onClick={() => router.push(item.href)}
              title={item.label}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.6rem 0.7rem', borderRadius: '0.6rem', cursor: 'pointer',
                border: active && isMasterRole ? '1px solid rgba(240,172,102,0.35)' : 'none',
                background: active ? (isMasterRole ? 'rgba(240,172,102,0.12)' : 'rgba(255,255,255,0.12)') : 'transparent',
                color: active ? 'white' : 'rgba(255,255,255,0.6)',
                fontWeight: active ? 700 : 500, fontSize: '0.85rem',
                textAlign: 'left', transition: 'background 0.15s, color 0.15s', width: '100%',
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = isMasterRole ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'white'; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; } }}
            >
              <Icon size={18} style={{ flexShrink: 0 }} />
              <span className="sidebar-label" style={{ whiteSpace: 'nowrap' }}>{item.label}</span>
              {active && <div className="sidebar-label" style={{ width: 6, height: 6, borderRadius: '50%', background: activeDotColor, marginLeft: 'auto', flexShrink: 0 }} />}
            </button>
          );
        })}
      </nav>

      {userName && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: '1rem 1.1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
              background: isMasterRole ? '#000000' : accentColor,
              border: isMasterRole ? `2px solid ${accentColor}` : '2px solid rgba(255,255,255,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {initials ? <span style={{ color: 'white', fontWeight: 700, fontSize: '0.72rem' }}>{initials}</span> : <User size={14} color="white" />}
            </div>
            <div className="sidebar-label" style={{ minWidth: 0 }}>
              <p style={{ color: 'white', fontSize: '0.78rem', fontWeight: 600, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName}</p>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.68rem' }}>{role ? roleLabels[role] : ''}</p>
            </div>
          </div>
          <button onClick={handleLogout} title="Sair"
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center',
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '0.5rem',
              padding: '0.5rem', color: 'white', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, transition: 'background 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = isMasterRole ? 'rgba(217,146,46,0.4)' : 'rgba(67,56,202,0.5)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
          >
            <LogOut size={14} />
            <span className="sidebar-label">Sair</span>
          </button>
        </div>
      )}
    </aside>
  );
}
