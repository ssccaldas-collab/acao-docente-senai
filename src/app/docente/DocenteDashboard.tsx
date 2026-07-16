'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { ChevronRight, FileText, Eye, MessageSquare, RotateCcw, CheckCircle2 } from 'lucide-react';

interface Cycle {
  id: number;
  current_stage: number;
  status: 'nao_iniciado' | 'em_andamento' | 'concluido' | 'atrasado' | 'cancelado';
  stage1_deadline: string | null;
  stage2_deadline: string | null;
  stage3_deadline: string | null;
  stage4_deadline: string | null;
  semester_id: number;
  semester_label: string;
}

const STAGE_LABELS = ['', 'Documentação', 'Observação de Aula', 'Devolutiva', 'Réplica'];
const STAGE_ICONS = [FileText, FileText, Eye, MessageSquare, RotateCcw];

function fmtDate(d: string | null) {
  if (!d) return '—';
  return new Date(d.slice(0, 10) + 'T00:00:00').toLocaleDateString('pt-BR');
}

function deadlineFor(c: Cycle): string | null {
  return [c.stage1_deadline, c.stage2_deadline, c.stage3_deadline, c.stage4_deadline][c.current_stage - 1] ?? null;
}

export function DocenteDashboard({ userName }: { userName: string }) {
  const router = useRouter();
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/ciclos').then(r => r.json()).then(data => { setCycles(data); setLoading(false); });
  }, []);

  const sorted = [...cycles].sort((a, b) => b.semester_id - a.semester_id);
  const current = sorted.find(c => c.status !== 'concluido' && c.status !== 'cancelado');
  const history = sorted.filter(c => c.id !== current?.id);

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F5' }}>
      <Header userName={userName} role="docente" />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1A2344' }}>Minha Ação Docente</h1>
        <p style={{ color: '#666', fontSize: '0.88rem', marginTop: '0.2rem', marginBottom: '1.5rem' }}>
          Acompanhe o andamento da sua avaliação semestral
        </p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>Carregando...</div>
        ) : (
          <>
            {current ? (
              <div
                onClick={() => router.push(`/docente/ciclos/${current.id}`)}
                style={{
                  background: 'linear-gradient(135deg, #1A2344 0%, #0D1628 100%)',
                  borderRadius: '1rem', padding: '1.75rem 2rem', marginBottom: '2rem', cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(13,22,40,0.25)',
                }}>
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.5rem' }}>
                  Semestre {current.semester_label} · Ciclo atual
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <p style={{ color: 'white', fontSize: '1.3rem', fontWeight: 700 }}>
                      Etapa {current.current_stage} de 4 — {STAGE_LABELS[current.current_stage]}
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', marginTop: '0.3rem' }}>
                      Prazo: {fmtDate(deadlineFor(current))}
                      {current.status === 'atrasado' && <span style={{ color: '#FF8A65', fontWeight: 700 }}> · ATRASADO</span>}
                    </p>
                  </div>
                  <ChevronRight size={22} color="white" />
                </div>
                <div style={{ height: 6, borderRadius: 999, background: 'rgba(255,255,255,0.1)', overflow: 'hidden', marginTop: '1.25rem' }}>
                  <div style={{ height: '100%', width: `${(current.current_stage / 4) * 100}%`, background: '#69F0AE', borderRadius: 999 }} />
                </div>
              </div>
            ) : (
              <div style={{ background: 'white', borderRadius: '0.75rem', border: '1px solid #E0E0E0', padding: '2rem', textAlign: 'center', marginBottom: '2rem' }}>
                <p style={{ color: '#888', fontSize: '0.9rem' }}>Nenhum ciclo de avaliação em andamento no momento.</p>
              </div>
            )}

            {history.length > 0 && (
              <div>
                <h2 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
                  Histórico
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {history.map(c => {
                    const Icon = c.status === 'concluido' ? CheckCircle2 : STAGE_ICONS[c.current_stage];
                    return (
                      <div key={c.id}
                        onClick={() => router.push(`/docente/ciclos/${c.id}`)}
                        style={{ background: 'white', borderRadius: '0.75rem', border: '1px solid #E0E0E0', padding: '0.9rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                        <div style={{ width: 38, height: 38, borderRadius: '50%', background: c.status === 'concluido' ? '#E8F5E9' : '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Icon size={18} color={c.status === 'concluido' ? '#2E7D32' : '#888'} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1A2344' }}>Semestre {c.semester_label}</p>
                          <span className={c.status === 'concluido' ? 'badge-concluido' : 'badge-nao-iniciado'}>
                            {c.status === 'concluido' ? 'CONCLUÍDO' : c.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <ChevronRight size={16} color="#bbb" />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
