'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { ArrowLeft, Users, Plus, Trash2, Search, User, ShieldCheck, GraduationCap, Eye, EyeOff, BadgeCheck } from 'lucide-react';
import type { Role } from '@/lib/auth';

interface UserRecord {
  id: number;
  name: string;
  registration_number: string | null;
  email: string;
  role: Role;
  active: boolean;
  created_at: string;
}

const emptyForm = { name: '', registration_number: '', email: '', password: '', role: 'docente' as Role };

const roleMeta: Record<Role, { label: string; icon: typeof User; color: string; bg: string }> = {
  coordenador: { label: 'Coordenadores', icon: ShieldCheck, color: '#4338CA', bg: '#FFEBEE' },
  oppp: { label: 'OPPs', icon: ShieldCheck, color: '#1565C0', bg: '#E3F2FD' },
  docente: { label: 'Docentes', icon: GraduationCap, color: '#2E7D32', bg: '#E8F5E9' },
};

export function UsuariosClient({ userName, role }: { userName: string; role: Role }) {
  const router = useRouter();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  const [editUser, setEditUser] = useState<UserRecord | null>(null);
  const [editForm, setEditForm] = useState({ name: '', registration_number: '', email: '', password: '', role: 'docente' as Role, active: true });
  const [editError, setEditError] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [showEditPass, setShowEditPass] = useState(false);

  function load() {
    fetch('/api/usuarios').then(r => r.json()).then(data => { setUsers(data); setLoading(false); });
  }

  useEffect(() => { load(); }, []);

  async function createUser() {
    if (!form.name || !form.password) { setError('Nome e senha são obrigatórios'); return; }
    setSaving(true); setError('');
    const res = await fetch('/api/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setSaving(false); return; }
    setForm(emptyForm);
    setShowForm(false); setSaving(false);
    load();
  }

  async function deleteUser(id: number, name: string) {
    if (!confirm(`Excluir permanentemente o usuário "${name}"? Essa ação não pode ser desfeita: todos os ciclos de avaliação, documentos e respostas relacionados a ele também serão apagados.`)) return;
    await fetch(`/api/usuarios/${id}`, { method: 'DELETE' });
    load();
  }

  function openEdit(u: UserRecord) {
    setEditUser(u);
    setEditForm({
      name: u.name,
      registration_number: u.registration_number || '',
      email: u.email.endsWith('@senai.internal') ? '' : u.email,
      password: '',
      role: u.role,
      active: u.active,
    });
    setEditError('');
    setShowEditPass(false);
  }

  async function saveEdit() {
    if (!editUser) return;
    if (!editForm.name) { setEditError('Nome é obrigatório'); return; }
    setEditSaving(true); setEditError('');
    const res = await fetch(`/api/usuarios/${editUser.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...editForm,
        email: editForm.email || `${editForm.registration_number || editUser.id}@senai.internal`,
        password: editForm.password || undefined,
      }),
    });
    const data = await res.json();
    if (!res.ok) { setEditError(data.error); setEditSaving(false); return; }
    setEditUser(null);
    setEditSaving(false);
    load();
  }

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    (u.registration_number || '').toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const inputStyle = { width: '100%', border: '1px solid #E0E0E0', borderRadius: '0.5rem', padding: '0.6rem 0.75rem', fontSize: '0.88rem', outline: 'none' };
  const labelStyle = { fontSize: '0.8rem', fontWeight: 600 as const, color: '#555', display: 'block' as const, marginBottom: '0.3rem' };

  function PencilIcon() {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    );
  }

  return (
    <AppShell userName={userName} role={role} maxWidth={900}>
      {editUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', width: '100%', maxWidth: 560, boxShadow: '0 8px 32px rgba(0,0,0,0.18)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#211C5C', marginBottom: '1.25rem' }}>Editar Usuário — {editUser.name}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div>
                <label style={labelStyle}>Nome completo *</label>
                <input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>NIF</label>
                <input value={editForm.registration_number} onChange={e => setEditForm(f => ({ ...f, registration_number: e.target.value }))} style={inputStyle} />
              </div>
              <div style={{ position: 'relative' }}>
                <label style={labelStyle}>Nova senha (deixe em branco para manter)</label>
                <input type={showEditPass ? 'text' : 'password'} value={editForm.password} onChange={e => setEditForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" style={{ ...inputStyle, paddingRight: '2.2rem' }} />
                <button type="button" onClick={() => setShowEditPass(p => !p)}
                  style={{ position: 'absolute', right: 10, bottom: 10, background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}>
                  {showEditPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <div>
                <label style={labelStyle}>E-mail (opcional)</label>
                <input type="email" value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} placeholder="email@senai.br" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Perfil *</label>
                <select value={editForm.role} onChange={e => setEditForm(f => ({ ...f, role: e.target.value as Role }))} style={{ ...inputStyle, background: 'white' }}>
                  <option value="docente">Docente</option>
                  <option value="oppp">OPP</option>
                  <option value="coordenador">Coordenador</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.4rem' }}>
                <input type="checkbox" checked={editForm.active} onChange={e => setEditForm(f => ({ ...f, active: e.target.checked }))} style={{ accentColor: '#4338CA', cursor: 'pointer' }} />
                <label style={{ fontSize: '0.85rem', color: '#333' }}>Usuário ativo</label>
              </div>
            </div>
            {editError && <p style={{ color: '#C62828', fontSize: '0.82rem', marginBottom: '0.75rem' }}>{editError}</p>}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={saveEdit} disabled={editSaving} className="btn-primary">{editSaving ? 'Salvando...' : 'Salvar alterações'}</button>
              <button onClick={() => setEditUser(null)} className="btn-secondary">Cancelar</button>
            </div>
          </div>
        </div>
      )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button onClick={() => router.push('/gestor')}
              style={{ background: 'white', border: '1px solid #E0E0E0', borderRadius: '0.5rem', padding: '0.4rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <ArrowLeft size={18} color="#555" />
            </button>
            <div>
              <h1 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#211C5C', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={20} color="#4338CA" /> Usuários
              </h1>
              <p style={{ fontSize: '0.8rem', color: '#888' }}>
                {users.filter(u => u.role === 'docente').length} docente(s) • {users.filter(u => u.role === 'oppp').length} OPP(s) • {users.filter(u => u.role === 'coordenador').length} coordenador(es)
              </p>
            </div>
          </div>
          <button onClick={() => { setShowForm(!showForm); setError(''); }} className="btn-primary">
            <Plus size={16} /> Novo Usuário
          </button>
        </div>

        {showForm && (
          <div style={{ background: 'white', borderRadius: '0.75rem', border: '1px solid #E0E0E0', padding: '1.25rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#211C5C', marginBottom: '1rem' }}>Novo Usuário</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div>
                <label style={labelStyle}>Nome completo *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nome completo" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>NIF (opcional)</label>
                <input value={form.registration_number} onChange={e => setForm(f => ({ ...f, registration_number: e.target.value }))} placeholder="Ex: 1234567" style={inputStyle} />
              </div>
              <div style={{ position: 'relative' }}>
                <label style={labelStyle}>Senha *</label>
                <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Senha de acesso"
                  style={{ ...inputStyle, paddingRight: '2.2rem' }} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 10, bottom: 10, background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <div>
                <label style={labelStyle}>Perfil *</label>
                <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as Role }))}
                  style={{ ...inputStyle, background: 'white' }}>
                  <option value="docente">Docente</option>
                  <option value="oppp">OPP</option>
                  <option value="coordenador">Coordenador</option>
                </select>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>E-mail (opcional)</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@senai.br (opcional)" style={inputStyle} />
              </div>
            </div>
            {error && <p style={{ color: '#C62828', fontSize: '0.82rem', marginBottom: '0.75rem' }}>{error}</p>}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={createUser} disabled={saving} className="btn-primary">{saving ? 'Salvando...' : 'Salvar'}</button>
              <button onClick={() => { setShowForm(false); setError(''); setForm(emptyForm); }} className="btn-secondary">Cancelar</button>
            </div>
          </div>
        )}

        <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
          <Search size={15} color="#999" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)' }} />
          <input type="text" placeholder="Buscar por nome, NIF ou e-mail..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', background: 'white', border: '1px solid #E0E0E0', borderRadius: '0.5rem', padding: '0.6rem 0.75rem 0.6rem 2.2rem', fontSize: '0.88rem', outline: 'none' }} />
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>Carregando...</div>
        ) : (
          <>
            {(['coordenador', 'oppp', 'docente'] as Role[]).map(r => {
              const group = filtered.filter(u => u.role === r);
              if (group.length === 0) return null;
              const meta = roleMeta[r];
              const Icon = meta.icon;
              return (
                <div key={r} style={{ marginBottom: '1.25rem' }}>
                  <h2 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Icon size={15} /> {meta.label}
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {group.map(u => (
                      <div key={u.id} style={{ background: 'white', borderRadius: '0.75rem', border: '1px solid #E0E0E0', padding: '0.9rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: u.active ? 1 : 0.55, flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                          <div style={{ width: 38, height: 38, borderRadius: '50%', background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Icon size={18} color={meta.color} />
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#211C5C' }}>{u.name}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.1rem', flexWrap: 'wrap' }}>
                              {u.registration_number && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.75rem', color: '#1565C0', fontWeight: 600 }}>
                                  <BadgeCheck size={12} /> {u.registration_number}
                                </span>
                              )}
                              <span style={{ fontSize: '0.75rem', color: '#aaa' }}>{u.email}</span>
                              {!u.active && <span className="badge-inativo">Inativo</span>}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
                          <button onClick={() => openEdit(u)}
                            style={{ background: '#E3F2FD', border: 'none', borderRadius: '0.4rem', padding: '0.4rem', color: '#1565C0', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                            <PencilIcon />
                          </button>
                          <button onClick={() => deleteUser(u.id, u.name)}
                            style={{ background: '#FFEBEE', border: 'none', borderRadius: '0.4rem', padding: '0.4rem', color: '#C62828', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>Nenhum usuário encontrado</div>
            )}
          </>
        )}
    </AppShell>
  );
}
