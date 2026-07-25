'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { ArrowLeft, GraduationCap, Search, ChevronRight, BadgeCheck } from 'lucide-react';
import type { Role } from '@/lib/auth';

interface UserRecord {
  id: number;
  name: string;
  registration_number: string | null;
  email: string;
  role: Role;
  active: boolean;
}

export function DocentesClient({ userName, role }: { userName: string; role: Role }) {
  const router = useRouter();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/usuarios').then(r => r.json()).then(data => { setUsers(data); setLoading(false); });
  }, []);

  const docentes = users.filter(u => u.role === 'docente' && u.active && (
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    (u.registration_number || '').toLowerCase().includes(search.toLowerCase())
  ));

  return (
    <AppShell userName={userName} role={role} maxWidth={900}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <button onClick={() => router.push('/gestor')}
            style={{ background: 'white', border: '1px solid #E0E0E0', borderRadius: '0.5rem', padding: '0.4rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <ArrowLeft size={18} color="#555" />
          </button>
          <div>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#211C5C', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <GraduationCap size={20} color="#4338CA" /> Docentes
            </h1>
            <p style={{ fontSize: '0.8rem', color: '#888' }}>{docentes.length} docente(s) · histórico completo por docente</p>
          </div>
        </div>

        <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
          <Search size={15} color="#999" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)' }} />
          <input type="text" placeholder="Buscar por nome ou matrícula..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', background: 'white', border: '1px solid #E0E0E0', borderRadius: '0.5rem', padding: '0.6rem 0.75rem 0.6rem 2.2rem', fontSize: '0.88rem', outline: 'none' }} />
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>Carregando...</div>
        ) : docentes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>Nenhum docente encontrado</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {docentes.map(d => (
              <div key={d.id} onClick={() => router.push(`/gestor/docentes/${d.id}`)}
                style={{ background: 'white', borderRadius: '0.75rem', border: '1px solid #E0E0E0', padding: '0.9rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <GraduationCap size={18} color="#2E7D32" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#211C5C' }}>{d.name}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {d.registration_number && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.75rem', color: '#1565C0', fontWeight: 600 }}>
                        <BadgeCheck size={12} /> {d.registration_number}
                      </span>
                    )}
                    <span style={{ fontSize: '0.75rem', color: '#aaa' }}>{d.email}</span>
                  </div>
                </div>
                <ChevronRight size={16} color="#bbb" />
              </div>
            ))}
          </div>
        )}
    </AppShell>
  );
}
