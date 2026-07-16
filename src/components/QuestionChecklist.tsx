'use client';

import { Check, X } from 'lucide-react';
import type { FormQuestion, FormAnswers } from '@/lib/formQuestions';

interface Props {
  questions: FormQuestion[];
  answers: FormAnswers;
  onChange: (id: string, value: string | number) => void;
  disabled?: boolean;
}

export function QuestionChecklist({ questions, answers, onChange, disabled }: Props) {
  const labelStyle = { fontSize: '0.88rem', fontWeight: 600 as const, color: '#1A2344', display: 'block' as const, marginBottom: '0.5rem' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {questions.map(q => {
        const current = answers[q.id]?.value;
        return (
          <div key={q.id}>
            <label style={labelStyle}>
              {q.label}{q.required && <span style={{ color: '#C8102E' }}> *</span>}
            </label>
            {q.helpText && <p style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.4rem' }}>{q.helpText}</p>}

            {q.type === 'sim_nao' && (
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button type="button" disabled={disabled} onClick={() => onChange(q.id, 'ok')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                    padding: '0.5rem 1rem', borderRadius: '0.5rem', fontSize: '0.85rem', fontWeight: 700,
                    border: current === 'ok' ? '2px solid #2E7D32' : '1px solid #E0E0E0',
                    background: current === 'ok' ? '#E8F5E9' : 'white',
                    color: current === 'ok' ? '#2E7D32' : '#888',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                  }}>
                  <Check size={14} /> OK
                </button>
                <button type="button" disabled={disabled} onClick={() => onChange(q.id, 'nao_ok')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                    padding: '0.5rem 1rem', borderRadius: '0.5rem', fontSize: '0.85rem', fontWeight: 700,
                    border: current === 'nao_ok' ? '2px solid #C8102E' : '1px solid #E0E0E0',
                    background: current === 'nao_ok' ? '#FFEBEE' : 'white',
                    color: current === 'nao_ok' ? '#C8102E' : '#888',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                  }}>
                  <X size={14} /> Não OK
                </button>
              </div>
            )}

            {q.type === 'nota' && (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {Array.from({ length: (q.scale?.max ?? 5) - (q.scale?.min ?? 1) + 1 }, (_, i) => (q.scale?.min ?? 1) + i).map(n => (
                  <button key={n} type="button" disabled={disabled} onClick={() => onChange(q.id, n)}
                    style={{
                      width: 38, height: 38, borderRadius: '50%', fontSize: '0.85rem', fontWeight: 700,
                      border: current === n ? '2px solid #1565C0' : '1px solid #E0E0E0',
                      background: current === n ? '#E3F2FD' : 'white',
                      color: current === n ? '#1565C0' : '#888',
                      cursor: disabled ? 'not-allowed' : 'pointer',
                    }}>
                    {n}
                  </button>
                ))}
              </div>
            )}

            {q.type === 'texto' && (
              <textarea
                disabled={disabled}
                value={typeof current === 'string' ? current : ''}
                onChange={e => onChange(q.id, e.target.value)}
                rows={3}
                placeholder="Escreva aqui..."
                style={{ width: '100%', border: '1px solid #E0E0E0', borderRadius: '0.5rem', padding: '0.6rem 0.75rem', fontSize: '0.85rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
