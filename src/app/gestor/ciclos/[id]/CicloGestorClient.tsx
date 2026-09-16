'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { QuestionChecklist } from '@/components/QuestionChecklist';
import { DocumentsPanel } from '@/components/DocumentsPanel';
import { SignaturePad } from '@/components/SignaturePad';
import { ArrowLeft, FileText, Eye, MessageSquare, RotateCcw, CheckCircle2, Circle, ChevronDown, ChevronUp, ArrowRight, Inbox, RefreshCcw, FileDown, Pencil, UserCheck, Lock } from 'lucide-react';
import type { Role } from '@/lib/auth';
import { STAGE1_DOCUMENTATION_QUESTIONS, STAGE2_CLASSROOM_OBSERVATION_QUESTIONS, getMissingRequiredIds, type FormAnswers, type QuestionAnswer } from '@/lib/formQuestions';

function scrollToQuestion(id: string) {
  document.getElementById(`question-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

export interface CycleDetail {
  id: number;
  current_stage: number;
  status: 'nao_iniciado' | 'em_andamento' | 'concluido' | 'atrasado' | 'cancelado';
  stage1_deadline: string | Date | null;
  stage2_deadline: string | Date | null;
  stage3_deadline: string | Date | null;
  stage4_deadline: string | Date | null;
  teacher_name: string;
  manager_id: number | null;
  manager_name: string | null;
  authorized_gestor_id: number | null;
  authorized_gestor_name: string | null;
  semester_label: string;
  comprovante_blob_pathname: string | null;
  comprovante_generated_at: string | Date | null;
}

const STEPS = [
  { stage: 1, label: 'Documentação', icon: FileText },
  { stage: 2, label: 'Observação de Aula', icon: Eye },
  { stage: 3, label: 'Devolutiva', icon: MessageSquare },
  { stage: 4, label: 'Réplica', icon: RotateCcw },
];

function fmtDate(d: string | Date | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

function toDateInputValue(d: string | Date | null) {
  if (!d) return '';
  return new Date(d).toISOString().slice(0, 10);
}

interface StageReview {
  answers: FormAnswers;
  overall_comment: string | null;
  observation_date?: string | null;
  reviewed_by_name?: string;
  observed_by_name?: string;
}

function ChecklistSection({
  title, icon: Icon, questions, existing, onSave, saving, open, onToggle, canEdit,
}: {
  title: string;
  icon: typeof FileText;
  questions: typeof STAGE1_DOCUMENTATION_QUESTIONS;
  existing: StageReview | null;
  onSave: (answers: FormAnswers, comment: string) => void;
  saving: boolean;
  open: boolean;
  onToggle: () => void;
  canEdit: boolean;
}) {
  const [isEditing, setIsEditing] = useState(!existing);
  const [answers, setAnswers] = useState<FormAnswers>(existing?.answers ?? {});
  const [comment, setComment] = useState(existing?.overall_comment ?? '');
  const [invalidIds, setInvalidIds] = useState<string[]>([]);

  function handleChange(id: string, value: QuestionAnswer['value']) {
    setAnswers(a => ({ ...a, [id]: { value } }));
    setInvalidIds(ids => ids.filter(i => i !== id));
  }

  function handleSaveClick() {
    const missing = getMissingRequiredIds(questions, answers);
    if (missing.length > 0) {
      setInvalidIds(missing);
      scrollToQuestion(missing[0]);
      return;
    }
    setInvalidIds([]);
    onSave(answers, comment);
  }

  function startEditing() {
    setAnswers(existing?.answers ?? {});
    setComment(existing?.overall_comment ?? '');
    setInvalidIds([]);
    setIsEditing(true);
  }

  const respondedBy = existing?.reviewed_by_name ?? existing?.observed_by_name;
  const locked = !!existing && !isEditing;

  return (
    <div style={{ background: 'white', borderRadius: '0.75rem', border: '1px solid #E0E0E0', marginBottom: '1rem', overflow: 'hidden' }}>
      <button onClick={onToggle} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.25rem', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
        <div style={{ width: 36, height: 36, borderRadius: '0.5rem', background: existing ? '#E8F5E9' : '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={17} color={existing ? '#2E7D32' : '#888'} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 700, fontSize: '0.92rem', color: '#211C5C' }}>{title}</p>
          <p style={{ fontSize: '0.75rem', color: '#888' }}>
            {existing ? `Respondido${respondedBy ? ` por ${respondedBy}` : ''}` : 'Ainda não respondido'}
          </p>
        </div>
        {existing && <span className="badge-concluido">RESPONDIDO</span>}
        {open ? <ChevronUp size={18} color="#888" /> : <ChevronDown size={18} color="#888" />}
      </button>

      {open && (
        <div style={{ padding: '0 1.25rem 1.25rem' }}>
          {locked && existing ? (
            <div>
              <div style={{ background: '#E8F5E9', border: '1px solid #A5D6A7', borderRadius: '0.5rem', padding: '0.75rem 1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="#2E7D32" />
                <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#2E7D32' }}>
                  Etapa concluída — pode avançar. Fica bloqueada até você clicar em &quot;Reabrir e editar&quot;.
                </p>
              </div>
              <QuestionChecklist questions={questions} answers={existing.answers} onChange={() => {}} disabled />
              {existing.overall_comment && (
                <div style={{ marginTop: '1rem' }}>
                  <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#555', marginBottom: '0.3rem' }}>Comentário geral</p>
                  <p style={{ fontSize: '0.85rem', color: '#333', whiteSpace: 'pre-wrap' }}>{existing.overall_comment}</p>
                </div>
              )}
              {canEdit && (
                <button type="button" onClick={startEditing} className="btn-secondary" style={{ marginTop: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Pencil size={14} /> Reabrir e editar
                </button>
              )}
            </div>
          ) : canEdit ? (
            <>
              <QuestionChecklist questions={questions} answers={answers} onChange={handleChange} disabled={saving} invalidIds={invalidIds} />
              <div style={{ marginTop: '1rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#555', display: 'block', marginBottom: '0.4rem' }}>Comentário geral (opcional)</label>
                <textarea value={comment} onChange={e => setComment(e.target.value)} rows={2}
                  style={{ width: '100%', border: '1px solid #E0E0E0', borderRadius: '0.5rem', padding: '0.6rem 0.75rem', fontSize: '0.85rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }} />
              </div>
              {invalidIds.length > 0 && (
                <p style={{ fontSize: '0.78rem', color: '#C8102E', fontWeight: 600, marginTop: '0.6rem' }}>
                  Faltam {invalidIds.length} pergunta{invalidIds.length > 1 ? 's' : ''} obrigatória{invalidIds.length > 1 ? 's' : ''} — destacada{invalidIds.length > 1 ? 's' : ''} em vermelho acima.
                </p>
              )}
              <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                <button onClick={handleSaveClick} disabled={saving} className="btn-primary">
                  {saving ? 'Salvando...' : existing ? 'Salvar alterações' : 'Salvar e avançar'}
                </button>
                {existing && (
                  <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary">
                    Cancelar
                  </button>
                )}
              </div>
            </>
          ) : (
            <p style={{ padding: '1rem 0', textAlign: 'center', color: '#999', fontSize: '0.85rem' }}>
              Aguardando o gestor responsável preencher esta etapa.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

interface FeedbackSession {
  session_date: string | Date;
  notes: string;
  teacher_acknowledged: boolean;
  applied_by_name?: string;
}

function DevolutivaSection({ existing, onSave, saving, open, onToggle, canEdit }: {
  existing: FeedbackSession | null;
  onSave: (sessionDate: string, notes: string) => void;
  saving: boolean;
  open: boolean;
  onToggle: () => void;
  canEdit: boolean;
}) {
  const [isEditing, setIsEditing] = useState(!existing);
  const [sessionDate, setSessionDate] = useState(toDateInputValue(existing?.session_date ?? null));
  const [notes, setNotes] = useState(existing?.notes ?? '');

  function startEditing() {
    setSessionDate(toDateInputValue(existing?.session_date ?? null));
    setNotes(existing?.notes ?? '');
    setIsEditing(true);
  }

  const locked = !!existing && !isEditing;

  return (
    <div style={{ background: 'white', borderRadius: '0.75rem', border: '1px solid #E0E0E0', marginBottom: '1rem', overflow: 'hidden' }}>
      <button onClick={onToggle} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.25rem', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
        <div style={{ width: 36, height: 36, borderRadius: '0.5rem', background: existing ? '#E8F5E9' : '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <MessageSquare size={17} color={existing ? '#2E7D32' : '#888'} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 700, fontSize: '0.92rem', color: '#211C5C' }}>Etapa 3 — Devolutiva</p>
          <p style={{ fontSize: '0.75rem', color: '#888' }}>
            {existing ? `Registrada${existing.applied_by_name ? ` por ${existing.applied_by_name}` : ''} · ${existing.teacher_acknowledged ? 'docente ciente' : 'aguardando ciência do docente'}` : 'Ainda não registrada'}
          </p>
        </div>
        {existing && <span className="badge-concluido">REGISTRADA</span>}
        {open ? <ChevronUp size={18} color="#888" /> : <ChevronDown size={18} color="#888" />}
      </button>

      {open && (
        <div style={{ padding: '0 1.25rem 1.25rem' }}>
          {locked && existing ? (
            <div>
              <div style={{ background: '#E8F5E9', border: '1px solid #A5D6A7', borderRadius: '0.5rem', padding: '0.75rem 1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="#2E7D32" />
                <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#2E7D32' }}>
                  Etapa concluída — pode avançar. Fica bloqueada até você clicar em &quot;Reabrir e editar&quot;.
                </p>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#555', marginBottom: '0.3rem' }}>Data da devolutiva</p>
                <p style={{ fontSize: '0.85rem', color: '#333' }}>{fmtDate(existing.session_date)}</p>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#555', marginBottom: '0.3rem' }}>Apontamentos passados ao docente</p>
                <p style={{ fontSize: '0.85rem', color: '#333', whiteSpace: 'pre-wrap' }}>{existing.notes}</p>
              </div>
              <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 700, color: existing.teacher_acknowledged ? '#2E7D32' : '#F57F17' }}>
                {existing.teacher_acknowledged ? <CheckCircle2 size={15} /> : <Circle size={15} />}
                {existing.teacher_acknowledged ? 'Docente confirmou ciência' : 'Aguardando ciência do docente'}
              </div>
              {canEdit && (
                <button type="button" onClick={startEditing} className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Pencil size={14} /> Reabrir e editar
                </button>
              )}
            </div>
          ) : canEdit ? (
            <>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#555', display: 'block', marginBottom: '0.4rem' }}>Data da devolutiva *</label>
                <input type="date" value={sessionDate} onChange={e => setSessionDate(e.target.value)}
                  style={{ border: '1px solid #E0E0E0', borderRadius: '0.5rem', padding: '0.55rem 0.75rem', fontSize: '0.85rem', outline: 'none' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#555', display: 'block', marginBottom: '0.4rem' }}>Apontamentos passados ao docente *</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={5}
                  placeholder="Descreva os pontos discutidos na devolutiva presencial..."
                  style={{ width: '100%', border: '1px solid #E0E0E0', borderRadius: '0.5rem', padding: '0.6rem 0.75rem', fontSize: '0.85rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }} />
              </div>
              <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                <button onClick={() => onSave(sessionDate, notes)} disabled={saving} className="btn-primary">
                  {saving ? 'Salvando...' : existing ? 'Salvar alterações' : 'Registrar devolutiva e avançar'}
                </button>
                {existing && (
                  <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary">
                    Cancelar
                  </button>
                )}
              </div>
            </>
          ) : (
            <p style={{ padding: '1rem 0', textAlign: 'center', color: '#999', fontSize: '0.85rem' }}>
              Aguardando o gestor responsável preencher esta etapa.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

interface ReplicaData {
  final_result: string;
  notes: string | null;
  closed_by_name?: string;
  manager_signature?: string | null;
  docente_signature?: string | null;
  docente_signed_at?: string | null;
}

const RESULT_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  adequado: { label: 'Adequado', color: '#2E7D32', bg: '#E8F5E9' },
  parcialmente_adequado: { label: 'Parcialmente adequado', color: '#F57F17', bg: '#FFF8E1' },
  inadequado: { label: 'Inadequado', color: '#C8102E', bg: '#FFEBEE' },
};

function ReplicaSection({ existing, onSave, saving, open, onToggle, canEdit }: {
  existing: ReplicaData | null;
  onSave: (finalResult: string, notes: string, managerSignature: string) => void;
  saving: boolean;
  open: boolean;
  onToggle: () => void;
  canEdit: boolean;
}) {
  const [isEditing, setIsEditing] = useState(!existing);
  const [finalResult, setFinalResult] = useState(existing?.final_result ?? 'adequado');
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [signature, setSignature] = useState<string | null>(null);

  function startEditing() {
    setFinalResult(existing?.final_result ?? 'adequado');
    setNotes(existing?.notes ?? '');
    setSignature(null);
    setIsEditing(true);
  }

  const locked = !!existing && !isEditing;

  return (
    <div style={{ background: 'white', borderRadius: '0.75rem', border: '1px solid #E0E0E0', marginBottom: '1rem', overflow: 'hidden' }}>
      <button onClick={onToggle} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.25rem', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
        <div style={{ width: 36, height: 36, borderRadius: '0.5rem', background: existing ? '#E8F5E9' : '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <RotateCcw size={17} color={existing ? '#2E7D32' : '#888'} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 700, fontSize: '0.92rem', color: '#211C5C' }}>Etapa 4 — Réplica / Fechamento</p>
          <p style={{ fontSize: '0.75rem', color: '#888' }}>
            {existing ? `Ciclo fechado${existing.closed_by_name ? ` por ${existing.closed_by_name}` : ''}` : 'Ciclo ainda não fechado'}
          </p>
        </div>
        {existing && <span className={existing.final_result === 'inadequado' ? 'badge-atrasado' : 'badge-concluido'}>{RESULT_LABELS[existing.final_result]?.label ?? existing.final_result}</span>}
        {open ? <ChevronUp size={18} color="#888" /> : <ChevronDown size={18} color="#888" />}
      </button>

      {open && (
        <div style={{ padding: '0 1.25rem 1.25rem' }}>
          {locked && existing ? (
            <div>
              {existing.docente_signature ? (
                <div style={{ background: '#E8F5E9', border: '1px solid #A5D6A7', borderRadius: '0.5rem', padding: '0.75rem 1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="#2E7D32" />
                  <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#2E7D32' }}>Ação Docente concluída — as duas assinaturas foram registradas.</p>
                </div>
              ) : (
                <div style={{ background: '#FFF8E1', border: '1px solid #FFE082', borderRadius: '0.5rem', padding: '0.75rem 1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="#F57F17" />
                  <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#F57F17' }}>Assinatura do gestor registrada — aguardando confirmação do docente.</p>
                </div>
              )}

              <div style={{ marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#555', marginBottom: '0.4rem' }}>Resultado final</p>
                <span style={{
                  display: 'inline-block', padding: '0.35rem 0.85rem', borderRadius: '0.5rem', fontSize: '0.85rem', fontWeight: 700,
                  background: RESULT_LABELS[existing.final_result]?.bg, color: RESULT_LABELS[existing.final_result]?.color,
                }}>
                  {RESULT_LABELS[existing.final_result]?.label ?? existing.final_result}
                </span>
              </div>

              {existing.notes && (
                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#555', marginBottom: '0.4rem' }}>Observações finais</p>
                  <p style={{ fontSize: '0.85rem', color: '#333', whiteSpace: 'pre-wrap' }}>{existing.notes}</p>
                </div>
              )}

              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                {existing.manager_signature && (
                  <div>
                    <p style={{ fontSize: '0.78rem', color: '#888', marginBottom: '0.3rem' }}>Assinatura do gestor</p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={existing.manager_signature} alt="Assinatura do gestor" style={{ maxWidth: 260, border: '1px solid #E0E0E0', borderRadius: '0.5rem' }} />
                  </div>
                )}
                {existing.docente_signature && (
                  <div>
                    <p style={{ fontSize: '0.78rem', color: '#888', marginBottom: '0.3rem' }}>Assinatura do docente</p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={existing.docente_signature} alt="Assinatura do docente" style={{ maxWidth: 260, border: '1px solid #E0E0E0', borderRadius: '0.5rem' }} />
                    {existing.docente_signed_at && <p style={{ fontSize: '0.7rem', color: '#999', marginTop: '0.2rem' }}>Assinado em {new Date(existing.docente_signed_at).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</p>}
                  </div>
                )}
              </div>

              {canEdit && (
                <>
                  <button type="button" onClick={startEditing} className="btn-secondary" style={{ marginTop: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Pencil size={14} /> Reabrir e editar
                  </button>
                  <p style={{ fontSize: '0.7rem', color: '#999', marginTop: '0.4rem' }}>
                    Reabrir exige uma nova assinatura do gestor{existing.docente_signature ? ' e uma nova confirmação do docente' : ''}.
                  </p>
                </>
              )}
            </div>
          ) : canEdit ? (
            <>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#555', display: 'block', marginBottom: '0.4rem' }}>Resultado final *</label>
                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                  {Object.entries(RESULT_LABELS).map(([value, meta]) => (
                    <button key={value} type="button" onClick={() => setFinalResult(value)}
                      style={{
                        padding: '0.5rem 1rem', borderRadius: '0.5rem', fontSize: '0.85rem', fontWeight: 700,
                        border: finalResult === value ? `2px solid ${meta.color}` : '1px solid #E0E0E0',
                        background: finalResult === value ? meta.bg : 'white',
                        color: finalResult === value ? meta.color : '#888',
                        cursor: 'pointer',
                      }}>
                      {meta.label}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#555', display: 'block', marginBottom: '0.4rem' }}>Observações finais (opcional)</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                  style={{ width: '100%', border: '1px solid #E0E0E0', borderRadius: '0.5rem', padding: '0.6rem 0.75rem', fontSize: '0.85rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }} />
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#555', display: 'block', marginBottom: '0.4rem' }}>Assinatura do gestor (encerramento) *</label>
                <SignaturePad onChange={setSignature} />
              </div>
              <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <button onClick={() => signature && onSave(finalResult, notes, signature)} disabled={saving || !signature} className="btn-primary" style={{ opacity: !signature ? 0.5 : 1 }}>
                  {saving ? 'Salvando...' : existing ? 'Salvar alterações' : 'Fechar ciclo'}
                </button>
                {existing && (
                  <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary">
                    Cancelar
                  </button>
                )}
              </div>
              {!signature && <p style={{ fontSize: '0.72rem', color: '#C62828', marginTop: '0.4rem' }}>Desenhe a assinatura para poder salvar.</p>}
              {existing && <p style={{ fontSize: '0.7rem', color: '#999', marginTop: '0.4rem' }}>Ao salvar, a assinatura do docente será solicitada novamente.</p>}
            </>
          ) : (
            <p style={{ padding: '1rem 0', textAlign: 'center', color: '#999', fontSize: '0.85rem' }}>Aguardando o gestor responsável preencher esta etapa.</p>
          )}
        </div>
      )}
    </div>
  );
}

function AdvanceStage1Panel({ documentCount, onAdvance, advancing }: { documentCount: number; onAdvance: () => void; advancing: boolean }) {
  const hasDocuments = documentCount > 0;
  return (
    <div style={{
      background: hasDocuments ? '#E8F5E9' : '#FFF8E1',
      border: `1px solid ${hasDocuments ? '#A5D6A7' : '#FFE082'}`,
      borderRadius: '0.75rem', padding: '1rem 1.25rem', marginBottom: '1rem',
      display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
        background: hasDocuments ? '#C8E6C9' : '#FFE082',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Inbox size={18} color={hasDocuments ? '#2E7D32' : '#F57F17'} />
      </div>
      <div style={{ flex: 1, minWidth: 200 }}>
        <p style={{ fontWeight: 700, fontSize: '0.88rem', color: hasDocuments ? '#2E7D32' : '#F57F17' }}>
          {hasDocuments ? `${documentCount} documento(s) recebido(s)` : 'Nenhum documento recebido ainda'}
        </p>
        <p style={{ fontSize: '0.78rem', color: '#666', marginTop: '0.1rem' }}>
          Você pode avançar para a Etapa 2 assim que decidir que a documentação está OK — o checklist detalhado abaixo é opcional e pode ser preenchido a qualquer momento.
        </p>
      </div>
      <button onClick={onAdvance} disabled={advancing} className="btn-primary" style={{ flexShrink: 0 }}>
        {advancing ? 'Avançando...' : <>Avançar para Etapa 2 <ArrowRight size={15} /></>}
      </button>
    </div>
  );
}

export function CicloGestorClient({ userName, userId, role, cycle }: { userName: string; userId: number; role: Role; cycle: CycleDetail }) {
  const router = useRouter();
  const deadlines = [cycle.stage1_deadline, cycle.stage2_deadline, cycle.stage3_deadline, cycle.stage4_deadline];
  const isConcluded = cycle.status === 'concluido';
  const isArchived = cycle.status === 'cancelado';
  const isOwner = cycle.manager_id === null || cycle.manager_id === userId;
  const canEdit = role === 'master' || isOwner || cycle.authorized_gestor_id === userId;

  const [stage1, setStage1] = useState<StageReview | null>(null);
  const [stage2, setStage2] = useState<StageReview | null>(null);
  const [stage3, setStage3] = useState<FeedbackSession | null>(null);
  const [stage4, setStage4] = useState<ReplicaData | null>(null);
  const [documentCount, setDocumentCount] = useState(0);
  const [openSection, setOpenSection] = useState<number>(cycle.current_stage);
  const [saving, setSaving] = useState<number | null>(null);
  const [advancing, setAdvancing] = useState(false);
  const [restarting, setRestarting] = useState(false);
  const [generatingComprovante, setGeneratingComprovante] = useState(false);
  const [error, setError] = useState('');
  const [version, setVersion] = useState(0);
  const [colegas, setColegas] = useState<{ id: number; name: string }[]>([]);
  const [authorizing, setAuthorizing] = useState(false);
  const canManageAuthorization = role === 'master' || isOwner;

  async function load() {
    const [s1, s2, s3, s4, docs] = await Promise.all([
      fetch(`/api/ciclos/${cycle.id}/etapa1`).then(r => r.json()),
      fetch(`/api/ciclos/${cycle.id}/etapa2`).then(r => r.json()),
      fetch(`/api/ciclos/${cycle.id}/etapa3`).then(r => r.json()),
      fetch(`/api/ciclos/${cycle.id}/etapa4`).then(r => r.json()),
      fetch(`/api/ciclos/${cycle.id}/documentos`).then(r => r.json()),
    ]);
    setStage1(s1); setStage2(s2); setStage3(s3); setStage4(s4);
    setDocumentCount(Array.isArray(docs) ? docs.length : 0);
    setVersion(v => v + 1);
  }

  async function gerarComprovante() {
    setGeneratingComprovante(true); setError('');
    const res = await fetch(`/api/ciclos/${cycle.id}/comprovante`, { method: 'POST' });
    const data = await res.json();
    setGeneratingComprovante(false);
    if (!res.ok) { setError(data.error); return; }
    router.refresh();
  }

  async function avancarEtapa1() {
    setAdvancing(true); setError('');
    const res = await fetch(`/api/ciclos/${cycle.id}/etapa1/avancar`, { method: 'POST' });
    const data = await res.json();
    setAdvancing(false);
    if (!res.ok) { setError(data.error); return; }
    load();
    router.refresh();
  }

  async function reiniciarCiclo() {
    if (!confirm(`Reiniciar a Ação Docente de ${cycle.teacher_name}? O ciclo atual fica arquivado no histórico (você pode consultar ou descartar depois) e um novo ciclo é aberto na Etapa 1.`)) return;
    setRestarting(true); setError('');
    const res = await fetch(`/api/ciclos/${cycle.id}/reiniciar`, { method: 'POST' });
    const data = await res.json();
    setRestarting(false);
    if (!res.ok) { setError(data.error); return; }
    router.push(`/gestor/ciclos/${data.id}`);
    router.refresh();
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps -- data fetch on mount, setState happens inside the async callback, not synchronously
  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!canManageAuthorization) return;
    fetch(`/api/ciclos/${cycle.id}/colegas`).then(r => r.json()).then(data => { if (Array.isArray(data)) setColegas(data); });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetch on mount only
  }, [canManageAuthorization]);

  async function autorizar(targetId: number | null) {
    setAuthorizing(true); setError('');
    const res = await fetch(`/api/ciclos/${cycle.id}/autorizar`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ authorized_gestor_id: targetId }) });
    const data = await res.json();
    setAuthorizing(false);
    if (!res.ok) { setError(data.error); return; }
    router.refresh();
  }

  async function submit(stage: number, url: string, body: unknown) {
    setSaving(stage); setError('');
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json();
    setSaving(null);
    if (!res.ok) { setError(data.error); return; }
    load();
    router.refresh();
  }

  return (
    <AppShell userName={userName} role={role} maxWidth={900}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <button onClick={() => router.push('/gestor')}
            style={{ background: 'white', border: '1px solid #E0E0E0', borderRadius: '0.5rem', padding: '0.4rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <ArrowLeft size={18} color="#555" />
          </button>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#211C5C' }}>{cycle.teacher_name}</h1>
            <p style={{ fontSize: '0.8rem', color: '#888' }}>
              Semestre {cycle.semester_label} {cycle.manager_name ? `· Iniciado por: ${cycle.manager_name}` : ''} {cycle.authorized_gestor_name ? `· Autorizado: ${cycle.authorized_gestor_name}` : ''}
            </p>
          </div>
          {!canEdit && !isConcluded && !isArchived && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#F5F5F5', border: '1px solid #E0E0E0', borderRadius: '0.5rem', padding: '0.4rem 0.75rem', fontSize: '0.78rem', color: '#888', fontWeight: 600 }}>
              <Lock size={13} /> Somente leitura
            </span>
          )}
          {!isArchived && canEdit && (
            <button onClick={reiniciarCiclo} disabled={restarting}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                background: '#FFEBEE', border: '1px solid #FFCDD2', borderRadius: '0.5rem',
                padding: '0.5rem 0.9rem', color: '#C62828', cursor: restarting ? 'not-allowed' : 'pointer',
                fontSize: '0.8rem', fontWeight: 700, opacity: restarting ? 0.6 : 1,
              }}>
              <RefreshCcw size={14} /> {restarting ? 'Reiniciando...' : 'Reiniciar Ação Docente'}
            </button>
          )}
        </div>

        {isArchived && (
          <div style={{ background: '#F5F5F5', border: '1px solid #E0E0E0', borderRadius: '0.75rem', padding: '0.85rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <RefreshCcw size={15} color="#888" />
            <p style={{ fontSize: '0.83rem', color: '#666' }}>
              Este é um ciclo <b>arquivado</b> (foi reiniciado). Fica guardado aqui só para consulta no histórico.
            </p>
          </div>
        )}

        {/* Stepper */}
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
          </div>
        )}

        {isConcluded && (
          <div style={{ background: 'white', border: '1px solid #E0E0E0', borderRadius: '0.75rem', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#E3F2FD', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <FileDown size={18} color="#1565C0" />
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <p style={{ fontWeight: 700, fontSize: '0.88rem', color: '#211C5C' }}>Comprovante de Ação Docente (PDF)</p>
              <p style={{ fontSize: '0.78rem', color: '#888', marginTop: '0.1rem' }}>
                {cycle.comprovante_blob_pathname
                  ? `Gerado em ${cycle.comprovante_generated_at ? new Date(cycle.comprovante_generated_at).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }) : ''} · reúne as respostas de todas as etapas e as duas assinaturas`
                  : stage4?.docente_signature
                    ? 'As duas assinaturas já foram coletadas — gere o comprovante abaixo'
                    : 'Disponível assim que o docente assinar o encerramento'}
              </p>
            </div>
            {cycle.comprovante_blob_pathname ? (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <a href={`/api/ciclos/${cycle.id}/comprovante/download`} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ textDecoration: 'none' }}>
                  <FileDown size={15} /> Baixar PDF
                </a>
                {canEdit && (
                  <button onClick={gerarComprovante} disabled={generatingComprovante} className="btn-secondary">
                    {generatingComprovante ? 'Gerando...' : 'Gerar novamente'}
                  </button>
                )}
              </div>
            ) : stage4?.docente_signature && canEdit ? (
              <button onClick={gerarComprovante} disabled={generatingComprovante} className="btn-primary">
                {generatingComprovante ? 'Gerando...' : 'Gerar comprovante'}
              </button>
            ) : null}
          </div>
        )}

        {error && (
          <div style={{ background: '#FFEBEE', border: '1px solid #FFCDD2', borderRadius: '0.5rem', padding: '0.75rem 1rem', marginBottom: '1rem', color: '#C62828', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <DocumentsPanel cycleId={cycle.id} canUpload={false} canDelete={canEdit} />

        {canManageAuthorization && !isConcluded && !isArchived && (
          <div style={{ background: 'white', border: '1px solid #E0E0E0', borderRadius: '0.75rem', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#EDE7F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <UserCheck size={18} color="#5E35B1" />
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <p style={{ fontWeight: 700, fontSize: '0.88rem', color: '#211C5C' }}>Autorizar outro gestor a editar</p>
              <p style={{ fontSize: '0.78rem', color: '#888', marginTop: '0.1rem' }}>
                {cycle.authorized_gestor_name ? `${cycle.authorized_gestor_name} está autorizado(a) a editar esta Ação Docente.` : 'Só você pode editar. Autorize um colega da mesma unidade para poder editar também.'}
              </p>
            </div>
            <select
              disabled={authorizing}
              value={cycle.authorized_gestor_id ?? ''}
              onChange={e => autorizar(e.target.value ? Number(e.target.value) : null)}
              style={{ border: '1px solid #E0E0E0', borderRadius: '0.5rem', padding: '0.5rem 0.75rem', fontSize: '0.85rem', minWidth: 200 }}>
              <option value="">Ninguém autorizado</option>
              {colegas.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        )}

        {!isConcluded && !isArchived && cycle.current_stage === 1 && canEdit && (
          <AdvanceStage1Panel documentCount={documentCount} onAdvance={avancarEtapa1} advancing={advancing} />
        )}

        <ChecklistSection
          key={`s1-${version}`}
          title="Etapa 1 — Documentação"
          icon={FileText}
          questions={STAGE1_DOCUMENTATION_QUESTIONS}
          existing={stage1}
          onSave={(answers, comment) => submit(1, `/api/ciclos/${cycle.id}/etapa1`, { answers, overall_comment: comment })}
          saving={saving === 1}
          open={openSection === 1}
          onToggle={() => setOpenSection(s => s === 1 ? 0 : 1)}
          canEdit={canEdit}
        />

        <ChecklistSection
          key={`s2-${version}`}
          title="Etapa 2 — Observação de Aula"
          icon={Eye}
          questions={STAGE2_CLASSROOM_OBSERVATION_QUESTIONS}
          existing={stage2}
          onSave={(answers, comment) => submit(2, `/api/ciclos/${cycle.id}/etapa2`, { answers, overall_comment: comment, observation_date: answers.data_aula?.value })}
          saving={saving === 2}
          open={openSection === 2}
          onToggle={() => setOpenSection(s => s === 2 ? 0 : 2)}
          canEdit={canEdit}
        />

        <DevolutivaSection
          key={`s3-${version}`}
          existing={stage3}
          onSave={(sessionDate, notes) => submit(3, `/api/ciclos/${cycle.id}/etapa3`, { session_date: sessionDate, notes })}
          saving={saving === 3}
          open={openSection === 3}
          onToggle={() => setOpenSection(s => s === 3 ? 0 : 3)}
          canEdit={canEdit}
        />

        <ReplicaSection
          key={`s4-${version}`}
          existing={stage4}
          onSave={(finalResult, notes, managerSignature) => submit(4, `/api/ciclos/${cycle.id}/etapa4`, { final_result: finalResult, notes, manager_signature: managerSignature })}
          saving={saving === 4}
          open={openSection === 4}
          onToggle={() => setOpenSection(s => s === 4 ? 0 : 4)}
          canEdit={canEdit}
        />
    </AppShell>
  );
}
