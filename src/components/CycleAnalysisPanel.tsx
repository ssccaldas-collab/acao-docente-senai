'use client';

import { BarChart3, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { CycleAnalysis } from '@/lib/cycleAnalysis';

const STAGE_LABELS: Record<number, string> = {
  1: 'Etapa 1',
  2: 'Etapa 2',
  3: 'Etapa 3',
};

export function CycleAnalysisPanel({ analysis }: { analysis: CycleAnalysis }) {
  const hasData = analysis.categories.length > 0;

  return (
    <div style={{ background: 'white', borderRadius: '0.75rem', border: '1px solid #E0E0E0', padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
        <BarChart3 size={18} color="#4338CA" />
        <p style={{ fontWeight: 700, fontSize: '0.95rem', color: '#211C5C' }}>Análise de Desempenho</p>
      </div>
      <p style={{ fontSize: '0.78rem', color: '#888', marginBottom: '1.25rem' }}>
        Gerada automaticamente com base nas respostas já registradas nas Etapas 1 a 3 — ajuda a direcionar o feedback ao(à) docente.
      </p>

      {!hasData ? (
        <p style={{ fontSize: '0.82rem', color: '#999', padding: '0.5rem 0' }}>
          A análise aparecerá aqui assim que houver respostas suficientes nas Etapas 1, 2 ou 3.
        </p>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', marginBottom: '1.5rem' }}>
            {analysis.categories.map(cat => (
              <div key={cat.category}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.3rem' }}>
                  <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#333' }}>{cat.category}</p>
                  <p style={{ fontSize: '0.75rem', color: '#888' }}>{cat.positive}/{cat.total} pontos fortes</p>
                </div>
                <div style={{ display: 'flex', height: 10, borderRadius: 6, overflow: 'hidden', background: '#F0F0F0' }}>
                  {cat.percent > 0 && <div style={{ width: `${cat.percent}%`, background: '#2E7D32' }} />}
                  {cat.percent < 100 && <div style={{ width: `${100 - cat.percent}%`, background: '#C8102E' }} />}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            <div>
              <p style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 700, color: '#2E7D32', marginBottom: '0.6rem' }}>
                <CheckCircle2 size={15} /> Pontos fortes ({analysis.strengths.length})
              </p>
              {analysis.strengths.length === 0 ? (
                <p style={{ fontSize: '0.78rem', color: '#999' }}>Nenhum ponto forte identificado ainda.</p>
              ) : (
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingLeft: '1.1rem', margin: 0 }}>
                  {analysis.strengths.map(s => (
                    <li key={`${s.stage}-${s.questionId}`} style={{ fontSize: '0.8rem', color: '#333' }}>
                      {s.label} <span style={{ color: '#aaa', fontSize: '0.7rem' }}>({STAGE_LABELS[s.stage]})</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <p style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 700, color: '#C8102E', marginBottom: '0.6rem' }}>
                <AlertTriangle size={15} /> Pontos de melhoria ({analysis.improvements.length})
              </p>
              {analysis.improvements.length === 0 ? (
                <p style={{ fontSize: '0.78rem', color: '#999' }}>Nenhum ponto de melhoria identificado ainda.</p>
              ) : (
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingLeft: '1.1rem', margin: 0 }}>
                  {analysis.improvements.map(i => (
                    <li key={`${i.stage}-${i.questionId}`} style={{ fontSize: '0.8rem', color: '#333' }}>
                      <span style={{ fontWeight: 600 }}>{i.label}</span> <span style={{ color: '#aaa', fontSize: '0.7rem' }}>({STAGE_LABELS[i.stage]})</span>
                      <p style={{ fontSize: '0.78rem', color: '#666', marginTop: '0.15rem' }}>{i.tip}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}