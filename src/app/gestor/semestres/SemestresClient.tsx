'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { ArrowLeft, CalendarDays, Plus, Trash2, Users2 } from 'lucide-react';
import type { Role } from '@/lib/auth';

interface Semester {
  id: number;
  label: string;
  start_date: string;
  end_date: string;
  default_stage1_deadline: string | null;
  default_stage2_deadline: string | null;
  is_active: boolean;
}

const emptyForm = { label: '', start_date: '', end_date: '', default_stage1_deadline: '', default_stage2_deadline: '' };

export function SemestresClient({ userName, role }: { userName: string; role: Role }) {
  const router = useRouter();
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState<number | null>(null);
  const [genMessage, setGenMessage] = useState<string | null>(null);

  function load() {
    fetch('/api/semestres').then(r => r.json()).then(data => { setSemesters(data); setLoading(false); });
  }

  useEffect(() => { load(); }, []);

  async function createSemester() {
    if (!form.label || !form.start_date || !form.end_date) { setError('Identificador, data de início e data de fim são obrigatórios'); return; }
    setSaving(true); setError('');
    const res = await fetch('/api/semestres', {
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

  async function deleteSemester(id: number, label: string) {
    if (!confirm(`Excluir o semestre "${label}"? Todos os ciclos de avaliação vinculados serão apagados também.`)) return;
    await fetch(`/api/semestres/${id}`, { method: 'DELETE' });
    load();
  }

  async function gerarCiclos(id: number, label: string) {
    if (!confirm(`Gerar ciclos de avaliação para todos os docentes ativos no semestre "${label}"? Docentes que já têm ciclo neste semestre não serão duplicados.`)) return;
    setGenerating(id); setGenMessage(null);
    const res = await fetch(`/api/semestres/${id}/gerar-ciclos`, { method: 'POST' });
    const data = await res.json();
    setGenerating(null);
    if (!res.ok) { setGenMessage(data.error || 'Erro ao gerar ciclos'); return; }
    setGenMessage(`${data.created} ciclo(s) criado(s) de ${data.totalDocentes} docente(s) ativo(s).`);
  }

  const inputStyle = { width: '100%', border: '1px solid #E0E0E0', borderRadius: '0.5rem', padding: '0.6rem 0.75rem', fontSize: '0.88rem', outline: 'none' };
  const labelStyle = { fontSize: '0.8rem', fontWeight: 600 as const, color: '#555', display: 'block' as const, marginBottom: '0.3rem' };

  const fmt = (d: string | null) => d ? new Date(d + 'T00:00:00').toLocaleDateString('pt-BR') : '—';

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F5' }}>
      <Header userName={userName} role={role} />

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button onClick={() => router.push('/gestor')}
              style={{ background: 'white', border: '1px solid #E0E0E0', borderRadius: '0.5rem', padding: '0.4rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <ArrowLeft size={18} color="#555" />
            </button>
            <div>
              <h1 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#211C5C', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CalendarDays size={20} color="#4338CA" /> Semestres
              </h1>
              <p style={{ fontSize: '0.8rem', color: '#888' }}>{semesters.length} semestre(s) cadastrado(s)</p>
            </div>
          </div>
          <button onClick={() => { setShowForm(!showForm); setError(''); }} className="btn-primary">
            <Plus size={16} /> Novo Semestre
          </button>
        </div>

        {showForm && (
          <div style={{ background: 'white', borderRadius: '0.75rem', border: '1px solid #E0E0E0', padding: '1.25rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#211C5C', marginBottom: '1rem' }}>Novo Semestre</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div>
                <label style={labelStyle}>Identificador * (ex: 2026-1)</label>
                <input value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} placeholder="2026-1" style={inputStyle} />
              </div>
              <div />
              <div>
                <label style={labelStyle}>Data de início *</label>
                <input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Data de fim *</label>
                <input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Prazo padrão — Documentação</label>
                <input type="date" value={form.default_stage1_deadline} onChange={e => setForm(f => ({ ...f, default_stage1_deadline: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Prazo padrão — Observação de aula</label>
                <input type="date" value={form.default_stage2_deadline} onChange={e => setForm(f => ({ ...f, default_stage2_deadline: e.target.value }))} style={inputStyle} />
              </div>
            </div>
            {error && <p style={{ color: '#C62828', fontSize: '0.82rem', marginBottom: '0.75rem' }}>{error}</p>}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={createSemester} disabled={saving} className="btn-primary">{saving ? 'Salvando...' : 'Salvar'}</button>
              <button onClick={() => { setShowForm(false); setError(''); setForm(emptyForm); }} className="btn-secondary">Cancelar</button>
            </div>
          </div>
        )}

        {genMessage && (
          <div style={{ background: '#E3F2FD', border: '1px solid #90CAF9', borderRadius: '0.5rem', padding: '0.75rem 1rem', marginBottom: '1.25rem', color: '#1565C0', fontSize: '0.85rem', fontWeight: 600 }}>
            {genMessage}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>Carregando...</div>
        ) : semesters.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>Nenhum semestre cadastrado</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {semesters.map(s => (
              <div key={s.id} style={{ background: 'white', borderRadius: '0.75rem', border: '1px solid #E0E0E0', padding: '0.9rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <p style={{ fontWeight: 700, fontSize: '0.92rem', color: '#211C5C' }}>{s.label}</p>
                    {s.is_active && <span className="badge-no-prazo">Ativo</span>}
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#888', marginTop: '0.15rem' }}>
                    {fmt(s.start_date)} — {fmt(s.end_date)}
                  </p>
                  <p style={{ fontSize: '0.73rem', color: '#aaa', marginTop: '0.1rem' }}>
                    Prazos padrão: Documentação {fmt(s.default_stage1_deadline)} · Aula {fmt(s.default_stage2_deadline)}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <button onClick={() => gerarCiclos(s.id, s.label)} disabled={generating === s.id}
                    style={{ background: '#E0F2F1', border: 'none', borderRadius: '0.4rem', padding: '0.4rem 0.7rem', color: '#00695C', cursor: generating === s.id ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', fontWeight: 700 }}>
                    <Users2 size={14} /> {generating === s.id ? 'Gerando...' : 'Gerar ciclos'}
                  </button>
                  <button onClick={() => deleteSemester(s.id, s.label)}
                    style={{ background: '#FFEBEE', border: 'none', borderRadius: '0.4rem', padding: '0.4rem', color: '#C62828', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
