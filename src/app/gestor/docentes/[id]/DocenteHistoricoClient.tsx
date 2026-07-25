'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { ArrowLeft, GraduationCap, ChevronRight, FileText, Eye, MessageSquare, RotateCcw, Trash2 } from 'lucide-react';
import type { Role } from '@/lib/auth';

export interface Teacher {
  id: number;
  name: string;
  email: string;
  registration_number: string | null;
}

interface Cycle {
  id: number;
  current_stage: number;
  status: 'nao_iniciado' | 'em_andamento' | 'concluido' | 'atrasado' | 'cancelado';
  semester_label: string;
  created_at: string;
}

const STAGE_LABELS = ['', 'Documentação', 'Observação de Aula', 'Devolutiva', 'Réplica'];
const STAGE_ICONS = [FileText, FileText, Eye, MessageSquare, RotateCcw];

const STATUS_BADGE: Record<string, string> = {
  concluido: 'badge-concluido',
  atrasado: 'badge-atrasado',
  em_andamento: 'badge-em-andamento',
  nao_iniciado: 'badge-nao-iniciado',
  cancelado: 'badge-inativo',
};

const STATUS_LABEL: Record<string, string> = {
  concluido: 'CONCLUÍDO',
  atrasado: 'ATRASADO',
  em_andamento: 'EM ANDAMENTO',
  nao_iniciado: 'NÃO INICIADO',
  cancelado: 'ARQUIVADO',
};

export function DocenteHistoricoClient({ userName, role, teacher }: { userName: string; role: Role; teacher: Teacher }) {
  const router = useRouter();
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    fetch(`/api/ciclos?docente_id=${teacher.id}`)
      .then(r => r.json())
      .then(data => {
        const sorted = [...data].sort((a: Cycle, b: Cycle) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setCycles(sorted);
        setLoading(false);
      });
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps -- load is redefined each render but only needs to re-run when teacher.id changes
  useEffect(() => { load(); }, [teacher.id]);

  async function descartar(e: React.MouseEvent, id: number) {
    e.stopPropagation();
    if (!confirm('Descartar permanentemente este ciclo do histórico? Documentos, respostas e assinaturas relacionados serão apagados. Essa ação não pode ser desfeita.')) return;
    await fetch(`/api/ciclos/${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <AppShell userName={userName} role={role} maxWidth={900}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <button onClick={() => router.push('/gestor/docentes')}
            style={{ background: 'white', border: '1px solid #E0E0E0', borderRadius: '0.5rem', padding: '0.4rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <ArrowLeft size={18} color="#555" />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <GraduationCap size={20} color="#2E7D32" />
            </div>
            <div>
              <h1 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#211C5C' }}>{teacher.name}</h1>
              <p style={{ fontSize: '0.8rem', color: '#888' }}>{teacher.email}{teacher.registration_number ? ` · ${teacher.registration_number}` : ''}</p>
            </div>
          </div>
        </div>

        <h2 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
          Histórico de Ação Docente ({cycles.length})
        </h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>Carregando...</div>
        ) : cycles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>Nenhum ciclo de avaliação encontrado para este docente</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {cycles.map(c => {
              const Icon = c.status === 'concluido' ? RotateCcw : STAGE_ICONS[c.current_stage];
              return (
                <div key={c.id} onClick={() => router.push(`/gestor/ciclos/${c.id}`)}
                  style={{ background: 'white', borderRadius: '0.75rem', border: '1px solid #E0E0E0', padding: '0.9rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', opacity: c.status === 'cancelado' ? 0.7 : 1 }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={18} color="#888" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#211C5C' }}>Semestre {c.semester_label}</p>
                    <p style={{ fontSize: '0.75rem', color: '#888' }}>
                      Etapa {c.current_stage}/4 — {STAGE_LABELS[c.current_stage]} · {new Date(c.created_at).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
                    </p>
                  </div>
                  <span className={STATUS_BADGE[c.status]}>{STATUS_LABEL[c.status]}</span>
                  <button onClick={e => descartar(e, c.id)}
                    style={{ background: '#FFEBEE', border: 'none', borderRadius: '0.4rem', padding: '0.4rem', color: '#C62828', cursor: 'pointer', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                    <Trash2 size={14} />
                  </button>
                  <ChevronRight size={16} color="#bbb" />
                </div>
              );
            })}
          </div>
        )}
    </AppShell>
  );
}
