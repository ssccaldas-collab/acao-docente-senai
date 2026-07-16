export type QuestionType = 'sim_nao' | 'nota' | 'texto';

export interface FormQuestion {
  id: string;
  label: string;
  type: QuestionType;
  required?: boolean;
  helpText?: string;
  scale?: { min: number; max: number };
}

// Checklist inicial — ajuste os textos livremente, não é necessário mexer em schema ou rotas.
export const STAGE1_DOCUMENTATION_QUESTIONS: FormQuestion[] = [
  { id: 'plano_aula_entregue', label: 'Plano de aula entregue dentro do prazo', type: 'sim_nao', required: true },
  { id: 'plano_aula_atualizado', label: 'Plano de aula atualizado e coerente com o plano de curso', type: 'sim_nao', required: true },
  { id: 'diario_classe_em_dia', label: 'Diário de classe preenchido corretamente e em dia', type: 'sim_nao', required: true },
  { id: 'frequencia_registrada', label: 'Frequência dos alunos registrada corretamente', type: 'sim_nao', required: true },
  { id: 'material_didatico_coerente', label: 'Material didático coerente com o plano de aula', type: 'sim_nao', required: true },
  { id: 'avaliacoes_registradas', label: 'Avaliações aplicadas e notas registradas no sistema', type: 'sim_nao', required: true },
  { id: 'carga_horaria_cumprida', label: 'Carga horária prevista está sendo cumprida', type: 'sim_nao', required: true },
  { id: 'observacoes_documentacao', label: 'Observações gerais sobre a documentação', type: 'texto' },
];

export const STAGE2_CLASSROOM_OBSERVATION_QUESTIONS: FormQuestion[] = [
  { id: 'pontualidade', label: 'Pontualidade e assiduidade do docente', type: 'sim_nao', required: true },
  { id: 'dominio_conteudo', label: 'Domínio do conteúdo ministrado', type: 'nota', scale: { min: 1, max: 5 }, required: true },
  { id: 'clareza_explicacao', label: 'Clareza na explicação e comunicação com a turma', type: 'nota', scale: { min: 1, max: 5 }, required: true },
  { id: 'metodologia_ativa', label: 'Uso de metodologias ativas/práticas adequadas ao curso', type: 'sim_nao', required: true },
  { id: 'gestao_sala', label: 'Boa gestão de sala de aula e disciplina', type: 'sim_nao', required: true },
  { id: 'recursos_didaticos', label: 'Uso adequado de equipamentos e recursos didáticos', type: 'sim_nao', required: true },
  { id: 'seguranca_trabalho', label: 'Cumprimento das normas de segurança do trabalho (EPIs, procedimentos)', type: 'sim_nao', required: true },
  { id: 'engajamento_alunos', label: 'Interação e engajamento dos alunos durante a aula', type: 'nota', scale: { min: 1, max: 5 }, required: true },
  { id: 'cumprimento_planejamento', label: 'Aula seguiu o planejamento previsto', type: 'sim_nao', required: true },
  { id: 'observacoes_aula', label: 'Observações gerais sobre a aula observada', type: 'texto' },
];

export interface QuestionAnswer {
  value: string | number;
  comment?: string;
}
export type FormAnswers = Record<string, QuestionAnswer>;

export function validateAnswers(questions: FormQuestion[], answers: FormAnswers): string[] {
  const errors: string[] = [];
  for (const q of questions) {
    if (q.required && (answers[q.id]?.value === undefined || answers[q.id]?.value === '')) {
      errors.push(`Pergunta obrigatória não respondida: ${q.label}`);
    }
  }
  return errors;
}
