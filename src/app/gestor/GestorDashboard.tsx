'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import {
  Users, CalendarDays, FileText, Eye, MessageSquare, RotateCcw, GraduationCap,
  ChevronRight, RefreshCw, CheckCircle2, Clock, AlertTriangle,
} from 'lucide-react';
import type { Role } from '@/lib/auth';

interface Cycle {
  id: number;
  current_stage: number;
  status: 'nao_iniciado' | 'em_andamento' | 'concluido' | 'atrasado' | 'cancelado';
  stage1_deadline: string | null;
  stage2_deadline: string | null;
  stage3_deadline: string | null;
  stage4_deadline: string | null;
  teacher_id: number;
  teacher_name: string;
  manager_name: string | null;
  semester_id: number;
  semester_label: string;
}

interface Semester {
  id: number;
  label: string;
  is_active: boolean;
}

const POLL_INTERVAL = 8000;

const STAGE_LABELS = ['', 'Documentação', 'Observação de Aula', 'Devolutiva', 'Réplica'];

function pctColor(pct: number) {
  if (pct === 100) return '#2E7D32';
  if (pct >= 67) return '#1565C0';
  if (pct >= 34) return '#F57F17';
  return '#C8102E';
}

function deadlineFor(c: Cycle): string | null {
  return [c.stage1_deadline, c.stage2_deadline, c.stage3_deadline, c.stage4_deadline][c.current_stage - 1] ?? null;
}

function fmtDate(d: string | null) {
  if (!d) return '—';
  return new Date(d.slice(0, 10) + 'T00:00:00').toLocaleDateString('pt-BR');
}

export function GestorDashboard({ userName, role }: { userName: string; role: Role }) {
  const router = useRouter();
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [activeSemester, setActiveSemester] = useState<Semester | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function fetchData() {
    try {
      const semesters: Semester[] = await fetch('/api/semestres').then(r => r.json());
      const active = semesters.find(s => s.is_active) ?? semesters[0] ?? null;
      setActiveSemester(active);

      if (active) {
        const cyclesData: Cycle[] = await fetch(`/api/ciclos?semestre_id=${active.id}`).then(r => r.json());
        setCycles(cyclesData);
      } else {
        setCycles([]);
      }
      setLastUpdate(new Date());
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- polling data fetch on mount, setState happens inside the async callback, not synchronously
    fetchData();
    intervalRef.current = setInterval(fetchData, POLL_INTERVAL);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const active = cycles.filter(c => c.status !== 'cancelado');
  const concluded = active.filter(c => c.status === 'concluido');
  const overdue = active.filter(c => c.status === 'atrasado');
  const total = active.length;
  const overallPct = total > 0 ? Math.round((concluded.length / total) * 100) : 0;

  const pending = active.filter(c => c.status !== 'concluido');
  const byStage = [1, 2, 3, 4].map(stage => pending.filter(c => c.current_stage === stage));

  const navCards = [
    { icon: <GraduationCap size={24} />, label: 'Docentes', desc: 'Histórico completo de avaliação por docente', color: '#C8102E', bg: '#FFEBEE', path: '/gestor/docentes' },
    { icon: <Users size={24} />, label: 'Usuários', desc: 'Gerenciar docentes, OPPs e coordenadores', color: '#6A1B9A', bg: '#F3E5F5', path: '/gestor/usuarios' },
    { icon: <CalendarDays size={24} />, label: 'Semestres', desc: 'Cadastrar semestres e gerar ciclos de avaliação', color: '#00695C', bg: '#E0F2F1', path: '/gestor/semestres' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#F0F2F5' }}>
      <Header userName={userName} role={role} />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1A2344' }}>Painel do Gestor</h1>
            <p style={{ color: '#666', fontSize: '0.88rem', marginTop: '0.2rem' }}>
              {activeSemester ? `Semestre ${activeSemester.label}` : 'Nenhum semestre ativo'} · Ação Docente
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', color: '#999' }}>
            <RefreshCw size={12} />
            {lastUpdate?.toLocaleTimeString('pt-BR')}
          </div>
        </div>

        {/* ── HERO CARD ─────────────────────────────────────── */}
        <div style={{
          background: 'linear-gradient(135deg, #1A2344 0%, #0D1628 100%)',
          borderRadius: '1.25rem',
          padding: '2rem 2.5rem',
          marginBottom: '1.5rem',
          boxShadow: '0 8px 32px rgba(13,22,40,0.28)',
        }}>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '1.25rem' }}>
            Visão Geral do Semestre
          </p>

          {loading ? (
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1rem' }}>Carregando...</p>
          ) : total === 0 ? (
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1rem' }}>
              Nenhum ciclo de avaliação gerado para este semestre ainda. Vá em <b>Semestres</b> para gerar os ciclos.
            </p>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', width: 120, height: 120, flexShrink: 0 }}>
                  <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
                    <circle cx="60" cy="60" r="50" fill="none"
                      stroke={pctColor(overallPct)}
                      strokeWidth="10" strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 50}`}
                      strokeDashoffset={`${2 * Math.PI * 50 * (1 - overallPct / 100)}`}
                      style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.4s' }}
                    />
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white', lineHeight: 1 }}>{overallPct}%</span>
                    <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '0.15rem' }}>concluído</span>
                  </div>
                </div>

                <div style={{ width: 1, height: 80, background: 'rgba(255,255,255,0.1)', flexShrink: 0 }} />

                <div style={{ display: 'flex', gap: '2.5rem', flex: 1, flexWrap: 'wrap' }}>
                  <div>
                    <p style={{ fontSize: '3rem', fontWeight: 800, color: '#69F0AE', lineHeight: 1 }}>{concluded.length}</p>
                    <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', fontWeight: 600, marginTop: '0.3rem' }}>ciclos concluídos</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '3rem', fontWeight: 800, color: '#FF8A65', lineHeight: 1 }}>{overdue.length}</p>
                    <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', fontWeight: 600, marginTop: '0.3rem' }}>docentes atrasados</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '3rem', fontWeight: 800, color: '#FFD740', lineHeight: 1 }}>
                      {total - concluded.length}
                      <span style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>/{total}</span>
                    </p>
                    <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', fontWeight: 600, marginTop: '0.3rem' }}>em andamento</p>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                <div style={{ height: 8, borderRadius: 999, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 999, width: `${overallPct}%`,
                    background: `linear-gradient(90deg, ${pctColor(overallPct)}, #69F0AE)`,
                    transition: 'width 0.8s ease',
                  }} />
                </div>
                <p style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>
                  {total} docente(s) no semestre {activeSemester?.label}
                </p>
              </div>
            </>
          )}
        </div>

        {/* ── KPI CARDS ─────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '2rem' }} className="stats-grid">
          {[
            { icon: <FileText size={20} />, label: 'Documentação', value: byStage[0].length, color: '#1565C0', bg: '#E3F2FD' },
            { icon: <Eye size={20} />, label: 'Observação', value: byStage[1].length, color: '#6A1B9A', bg: '#F3E5F5' },
            { icon: <MessageSquare size={20} />, label: 'Devolutiva', value: byStage[2].length, color: '#F57F17', bg: '#FFF8E1' },
            { icon: <RotateCcw size={20} />, label: 'Réplica', value: byStage[3].length, color: '#00695C', bg: '#E0F2F1' },
            { icon: <AlertTriangle size={20} />, label: 'Atrasados', value: overdue.length, color: '#C8102E', bg: '#FFEBEE' },
          ].map(s => (
            <div key={s.label} style={{ background: 'white', borderRadius: '0.75rem', padding: '1.1rem', border: '1px solid #E0E0E0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</p>
                <div style={{ width: 32, height: 32, borderRadius: '0.5rem', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>
                  {s.icon}
                </div>
              </div>
              <p style={{ fontSize: '1.6rem', fontWeight: 700, color: '#1A2344' }}>{loading ? '—' : s.value}</p>
            </div>
          ))}
        </div>

        {/* ── NAV CARDS ─────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          {navCards.map(card => (
            <button key={card.path} onClick={() => router.push(card.path)}
              style={{
                background: 'white', border: '1px solid #E0E0E0', borderRadius: '0.75rem',
                padding: '1.25rem 1.5rem', cursor: 'pointer', textAlign: 'left',
                display: 'flex', alignItems: 'center', gap: '1rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)', transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = card.color; e.currentTarget.style.boxShadow = `0 4px 12px ${card.color}20`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#E0E0E0'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'; }}
            >
              <div style={{ width: 52, height: 52, borderRadius: '0.75rem', background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.color, flexShrink: 0 }}>
                {card.icon}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, fontSize: '1rem', color: '#1A2344' }}>{card.label}</p>
                <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.2rem' }}>{card.desc}</p>
              </div>
              <ChevronRight size={18} color={card.color} />
            </button>
          ))}
        </div>

        {/* ── PIPELINE POR ETAPA ────────────────────────────── */}
        {!loading && total > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {[1, 2, 3, 4].map(stage => {
              const group = byStage[stage - 1];
              if (group.length === 0) return null;
              return (
                <div key={stage}>
                  <h2 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
                    Etapa {stage} — {STAGE_LABELS[stage]} ({group.length})
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {group.map(c => {
                      const isOverdue = c.status === 'atrasado';
                      return (
                        <div key={c.id}
                          onClick={() => router.push(`/gestor/ciclos/${c.id}`)}
                          style={{
                            background: 'white', borderRadius: '0.75rem',
                            border: isOverdue ? '2px solid #C8102E' : '1px solid #E0E0E0',
                            padding: '0.9rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer',
                          }}>
                          <div style={{
                            width: 38, height: 38, borderRadius: '50%',
                            background: isOverdue ? '#FFEBEE' : '#E3F2FD',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          }}>
                            {isOverdue ? <AlertTriangle size={18} color="#C8102E" /> : <Clock size={18} color="#1565C0" />}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                              <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1A2344' }}>{c.teacher_name}</p>
                              <span className={isOverdue ? 'badge-atrasado' : 'badge-no-prazo'}>{isOverdue ? 'ATRASADO' : 'NO PRAZO'}</span>
                            </div>
                            <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.15rem' }}>
                              Prazo: {fmtDate(deadlineFor(c))} {c.manager_name ? `· Gestor: ${c.manager_name}` : ''}
                            </p>
                            <div style={{ height: 5, borderRadius: 999, background: '#E0E0E0', overflow: 'hidden', marginTop: '0.4rem', maxWidth: 240 }}>
                              <div style={{ height: '100%', width: `${(c.current_stage / 4) * 100}%`, background: pctColor((c.current_stage / 4) * 100), borderRadius: 999, transition: 'width 0.5s' }} />
                            </div>
                          </div>
                          <ChevronRight size={16} color="#bbb" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {concluded.length > 0 && (
              <div>
                <h2 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
                  Concluídos ({concluded.length})
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {concluded.map(c => (
                    <div key={c.id}
                      onClick={() => router.push(`/gestor/ciclos/${c.id}`)}
                      style={{ background: 'white', border: '1px solid #C8E6C9', borderRadius: '0.75rem', padding: '0.9rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                      <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <CheckCircle2 size={18} color="#2E7D32" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1A2344' }}>{c.teacher_name}</p>
                        <span className="badge-concluido">CONCLUÍDO</span>
                      </div>
                      <ChevronRight size={16} color="#bbb" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
