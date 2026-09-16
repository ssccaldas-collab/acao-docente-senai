export type QuestionType = 'sim_nao' | 'nota' | 'texto' | 'texto_curto' | 'data' | 'escolha_unica' | 'escolha_multipla';

export interface FormQuestion {
  id: string;
  label: string;
  type: QuestionType;
  required?: boolean;
  helpText?: string;
  scale?: { min: number; max: number };
  options?: string[];
}

// Migrado do formulário "AÇÃO DOCENTE - PRÉVIA DO PLANO DE ENSINO_v2".
export const STAGE1_DOCUMENTATION_QUESTIONS: FormQuestion[] = [
  { id: 'nome_gestor', label: 'Nome do(a) Gestor(a) responsável', type: 'texto_curto', required: true },
  { id: 'cargo', label: 'Cargo', type: 'escolha_unica', required: true, options: ['Orientador de Prática Profissional', 'Coordenador de Atividade Técnica e Pedagógica'] },
  { id: 'data_acao_docente', label: 'Data da Ação docente', type: 'data', required: true },
  { id: 'nome_docente', label: 'Nome do(a) Docente', type: 'texto_curto', required: true },
  { id: 'modalidades_curso', label: 'Em quais modalidades de curso o(a) Docente leciona?', type: 'escolha_multipla', required: true, options: ['CAI', 'CT', 'CST', 'FIC'] },
  { id: 'quantidade_uc', label: 'Quantas UC o(a) Docente leciona?', type: 'escolha_unica', required: true, options: ['01', '02', '03', '04', '05', '06'] },
  { id: 'curso_analise', label: 'Qual foi o curso escolhido para a análise?', type: 'texto_curto', required: true },
  { id: 'turma_analise', label: 'Qual foi a turma escolhida para a análise?', type: 'texto_curto', required: true },
  { id: 'uc_analise', label: 'Qual foi a UC escolhida para a análise?', type: 'texto_curto', required: true },
  { id: 'estrategia_desafiadora', label: 'Qual a Estratégia Desafiadora definida para avaliação da UC?', type: 'escolha_unica', required: true, options: ['Situação Problema', 'Estudo de Caso', 'Projeto', 'Projeto Integrador', 'Pesquisa Aplicada'] },
  { id: 'estrategia_contextualizada', label: 'A Estratégia Desafiadora possui contextualização de acordo com o Perfil Profissional do curso?', type: 'sim_nao', required: true },
  { id: 'carga_horaria_distribuida', label: 'A carga horária da UC está distribuída corretamente conforme Cronograma ou Planejamento de Ensino?', type: 'sim_nao', required: true },
  { id: 'tabela_criterios_criada', label: 'O(A) Docente criou a Tabela de Critérios?', type: 'sim_nao', required: true },
  { id: 'criterios_de_acordo', label: 'Os critérios estão de acordo com a Capacidade a ser avaliada?', type: 'sim_nao', required: true },
  { id: 'tabela_niveis_criada', label: 'O(A) Docente criou a Tabela de Níveis de Desempenho?', type: 'sim_nao', required: true },
  { id: 'conclusao', label: 'Conclusão', type: 'texto', required: true },
  { id: 'acao_satisfatoria', label: 'A ação docente é satisfatória?', type: 'sim_nao', required: true },
  { id: 'acompanhamento_continuo', label: 'Há necessidade de adotar um acompanhamento contínuo?', type: 'sim_nao', required: true },
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
  value: string | number | string[];
  comment?: string;
}
export type FormAnswers = Record<string, QuestionAnswer>;

function isEmptyValue(value: QuestionAnswer['value'] | undefined): boolean {
  if (value === undefined || value === '') return true;
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

export function getMissingRequiredIds(questions: FormQuestion[], answers: FormAnswers): string[] {
  return questions.filter(q => q.required && isEmptyValue(answers[q.id]?.value)).map(q => q.id);
}

export function validateAnswers(questions: FormQuestion[], answers: FormAnswers): string[] {
  const missingIds = new Set(getMissingRequiredIds(questions, answers));
  return questions
    .filter(q => missingIds.has(q.id))
    .map(q => `Pergunta obrigatória não respondida: ${q.label}`);
}