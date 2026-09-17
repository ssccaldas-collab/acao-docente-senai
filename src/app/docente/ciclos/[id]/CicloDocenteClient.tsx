'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { DocumentsPanel } from '@/components/DocumentsPanel';
import { SignaturePad } from '@/components/SignaturePad';
import { ArrowLeft, FileText, Eye, MessageSquare, RotateCcw, CheckCircle2, Circle } from 'lucide-react';

export interface CycleDetail {
  id: number;
  current_stage: number;
  status: 'nao_iniciado' | 'em_andamento' | 'concluido' | 'atrasado' | 'cancelado';
  stage1_deadline: string | Date | null;
  stage2_deadline: string | Date | null;
  stage3_deadline: string | Date | null;
  stage4_deadline: string | Date | null;
  manager_name: string | null;
  semester_label: string;
}

interface FeedbackSession {
  session_date: string | null;
  notes: string | null;
  answers: Record<string, { value: string | number | string[] }> | null;
  overall_comment: string | null;
  teacher_acknowledged: boolean;
  applied_by_name?: string;
}

interface ReplicaData {
  final_result: 'adequado' | 'parcialmente_adequado' | 'inadequado';
  notes: string | null;
  manager_signature: string | null;
  docente_signature: string | null;
  docente_signed_at: string | null;
}

const STEPS = [
  { stage: 1, label: 'Documentação', icon: FileText },
  { stage: 2, label: 'Observação de Aula', icon: Eye },
  { stage: 3, label: 'Devolutiva', icon: MessageSquare },
  { stage: 4, label: 'Réplica', icon: RotateCcw },
];

const RESULT_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  adequado: { label: 'Adequado', color: '#2E7D32', bg: '#E8F5E9' },
  parcialmente_adequado: { label: 'Parcialmente adequado', color: '#F57F17', bg: '#FFF8E1' },
  inadequado: { label: 'Inadequado', color: '#C8102E', bg: '#FFEBEE' },
};

function fmtDate(d: string | Date | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

export function CicloDocenteClient({ userName, cycle }: { userName: string; cycle: CycleDetail }) {
  const router = useRouter();
  const deadlines = [cycle.stage1_deadline, cycle.stage2_deadline, cycle.stage3_deadline, cycle.stage4_deadline];
  const isConcluded = cycle.status === 'concluido';

  const [stage3, setStage3] = useState<FeedbackSession | null>(null);
  const [stage4, setStage4] = useState<ReplicaData | null>(null);
  const [ackLoading, setAckLoading] = useState(false);
  const [closingSignature, setClosingSignature] = useState<string | null>(null);
  const [signLoading, setSignLoading] = useState(false);

  function load() {
    fetch(`/api/ciclos/${cycle.id}/etapa3`).then(r => r.json()).then(setStage3);
    fetch(`/api/ciclos/${cycle.id}/etapa4`).then(r => r.json()).then(setStage4);
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps -- load only needs to run once on mount
  useEffect(() => { load(); }, []);

  async function assinarEncerramento() {
    if (!closingSignature) return;
    setSignLoading(true);
    await fetch(`/api/ciclos/${cycle.id}/etapa4/assinatura`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ docente_signature: closingSignature }),
    });
    setSignLoading(false);
    load();
  }

  async function confirmarCiencia() {
    setAckLoading(true);
    await fetch(`/api/ciclos/${cycle.id}/etapa3/ciencia`, { method: 'PATCH' });
    setAckLoading(false);
    load();
  }

  return (
    <AppShell userName={userName} role="docente" maxWidth={900}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <button onClick={() => router.push('/docente')}
            style={{ background: 'white', border: '1px solid #E0E0E0', borderRadius: '0.5rem', padding: '0.4rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <ArrowLeft size={18} color="#555" />
          </button>
          <div>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#211C5C' }}>Semestre {cycle.semester_label}</h1>
            <p style={{ fontSize: '0.8rem', color: '#888' }}>{cycle.manager_name ? `Gestor responsável: ${cycle.manager_name}` : ''}</p>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '0.75rem', border: '1px solid #E0E0E0', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              const done = isConcluded || step.stage < cycle.current_stage;
              const activeStep = !isConcluded && step.stage === cycle.current_stage;
              const color = done ? '#2E7D32' : activeStep ? '#4338CA' : '#bbb';
              return (
                <div key={step.stage} style={{ flex: 1, textAlign: 'center', position: 'relative' }}>
                  {i > 0 && (
                    <div style={{ position: 'absolute', top: 18, left: '-50%', width: '100%', height: 2, background: done ? '#2E7D32' : '#E0E0E0', zIndex: 0 }} />
                  )}
                  <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: '50%',
                      background: done ? '#E8F5E9' : activeStep ? '#FFEBEE' : '#F5F5F5',
                      border: `2px solid ${color}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {done ? <CheckCircle2 size={18} color={color} /> : activeStep ? <Icon size={16} color={color} /> : <Circle size={14} color={color} />}
                    </div>
                    <p style={{ fontSize: '0.75rem', fontWeight: activeStep ? 700 : 600, color: activeStep ? '#211C5C' : '#888' }}>{step.label}</p>
                    <p style={{ fontSize: '0.68rem', color: '#aaa' }}>Prazo: {fmtDate(deadlines[step.stage - 1])}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {isConcluded && stage4 && (
          <div style={{
            background: RESULT_LABELS[stage4.final_result]?.bg ?? '#F5F5F5',
            border: `1px solid ${RESULT_LABELS[stage4.final_result]?.color ?? '#ccc'}`,
            borderRadius: '0.75rem', padding: '1rem 1.25rem', marginBottom: '1.5rem',
          }}>
            <p style={{ fontWeight: 700, color: RESULT_LABELS[stage4.final_result]?.color ?? '#555' }}>
              Ciclo concluído — Resultado final: {RESULT_LABELS[stage4.final_result]?.label ?? stage4.final_result}
            </p>
            {stage4.notes && <p style={{ fontSize: '0.85rem', color: '#555', marginTop: '0.4rem' }}>{stage4.notes}</p>}
          </div>
        )}

        {isConcluded && stage4 && (
          <div style={{ background: 'white', borderRadius: '0.75rem', border: '1px solid #E0E0E0', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#211C5C', marginBottom: '0.75rem' }}>Assinaturas de encerramento</h3>

            {stage4.manager_signature && (
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.78rem', color: '#888', marginBottom: '0.3rem' }}>Gestor</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={stage4.manager_signature} alt="Assinatura do gestor" style={{ maxWidth: 300, border: '1px solid #E0E0E0', borderRadius: '0.5rem' }} />
              </div>
            )}

            {stage4.docente_signature ? (
              <div>
                <div style={{ background: '#E8F5E9', border: '1px solid #A5D6A7', borderRadius: '0.5rem', padding: '0.75rem 1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="#2E7D32" />
                  <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#2E7D32' }}>Ação Docente concluída — sua assinatura foi registrada com sucesso.</p>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#888', marginBottom: '0.3rem' }}>Sua assinatura</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={stage4.docente_signature} alt="Sua assinatura" style={{ maxWidth: 300, border: '1px solid #E0E0E0', borderRadius: '0.5rem' }} />
                {stage4.docente_signed_at && <p style={{ fontSize: '0.7rem', color: '#999', marginTop: '0.2rem' }}>Assinado em {new Date(stage4.docente_signed_at).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</p>}
              </div>
            ) : (
              <div>
                <p style={{ fontSize: '0.82rem', color: '#555', marginBottom: '0.5rem' }}>Assine abaixo para confirmar o encerramento do seu ciclo de Ação Docente:</p>
                <SignaturePad onChange={setClosingSignature} />
                <button onClick={assinarEncerramento} disabled={signLoading || !closingSignature} className="btn-primary" style={{ marginTop: '0.75rem', opacity: !closingSignature ? 0.5 : 1 }}>
                  {signLoading ? 'Salvando...' : 'Confirmar assinatura'}
                </button>
              </div>
            )}
          </div>
        )}

        <DocumentsPanel cycleId={cycle.id} canUpload={!isConcluded && cycle.current_stage === 1} canDelete={!isConcluded && cycle.current_stage === 1} />

        {stage3 && (
          <div style={{ background: 'white', borderRadius: '0.75rem', border: '1px solid #E0E0E0', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#211C5C', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageSquare size={17} color="#F57F17" /> Devolutiva — {fmtDate(stage3.session_date)}
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#333', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {(() => {
                const conclusao = stage3.answers?.conclusao?.value;
                return typeof conclusao === 'string' && conclusao.trim() ? conclusao : (stage3.notes ?? '');
              })()}
            </p>
            {stage3.overall_comment && <p style={{ fontSize: '0.85rem', color: '#555', marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}>{stage3.overall_comment}</p>}
            {stage3.applied_by_name && <p style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.5rem' }}>Aplicada por {stage3.applied_by_name}</p>}

            {stage3.teacher_acknowledged ? (
              <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#2E7D32', fontSize: '0.85rem', fontWeight: 600 }}>
                <CheckCircle2 size={16} /> Você confirmou ciência desta devolutiva
              </div>
            ) : (
              <button onClick={confirmarCiencia} disabled={ackLoading} className="btn-primary" style={{ marginTop: '1rem' }}>
                {ackLoading ? 'Confirmando...' : 'Confirmar ciência'}
              </button>
            )}
          </div>
        )}

        <div style={{ background: 'white', borderRadius: '0.75rem', border: '1px solid #E0E0E0', padding: '2rem', textAlign: 'center' }}>
          <p style={{ color: '#888', fontSize: '0.9rem' }}>
            {isConcluded
              ? 'Ciclo concluído.'
              : cycle.current_stage === 1
                ? 'Envie sua documentação acima. Assim que o gestor avaliar, você poderá acompanhar o andamento das próximas etapas por aqui.'
                : `Aguardando o gestor avançar para a Etapa ${cycle.current_stage} (${STEPS[cycle.current_stage - 1].label}).`}
          </p>
        </div>
    </AppShell>
  );
}
