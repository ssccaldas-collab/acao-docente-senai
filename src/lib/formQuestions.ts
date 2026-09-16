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

// Migrado do formulário "AÇÃO DOCENTE - FASE 1_v2" (acompanhamento da aula).
export const STAGE2_CLASSROOM_OBSERVATION_QUESTIONS: FormQuestion[] = [
  { id: 'nome_gestor', label: 'Nome do(a) Gestor(a) responsável', type: 'texto_curto', required: true },
  { id: 'cargo', label: 'Cargo', type: 'escolha_unica', required: true, options: ['OPP', 'CT', 'CTP'] },
  { id: 'unidade_senai', label: 'Unidade SENAI', type: 'escolha_unica', required: true, options: ['CFP 1.22', 'CFP 1.28'] },
  { id: 'nome_docente', label: 'Nome do(a) Docente', type: 'texto_curto', required: true },
  { id: 'data_aula', label: 'Data da aula', type: 'data', required: true },
  { id: 'modalidade_curso', label: 'Modalidade do curso', type: 'escolha_unica', required: true, options: ['CAI', 'CT', 'CST', 'FIC'] },
  { id: 'periodo', label: 'Período', type: 'escolha_unica', required: true, options: ['Manhã', 'Tarde', 'Integral', 'Noite'] },
  { id: 'titulo_curso', label: 'Título do curso', type: 'texto_curto', required: true },
  { id: 'turma', label: 'Turma', type: 'texto_curto', required: true },
  { id: 'unidade_curricular', label: 'Unidade Curricular (UC)', type: 'texto_curto', required: true },
  { id: 'aguardando_alunos', label: 'O(A) Docente estava aguardando os alunos para o início da aula?', type: 'sim_nao', required: true },
  { id: 'comentario_aguardando_alunos', label: 'Comentário', type: 'texto_curto' },
  { id: 'chamada_realizada', label: 'O(A) Docente realizou a chamada no início da aula?', type: 'sim_nao', required: true },
  { id: 'comentario_chamada', label: 'Comentário', type: 'texto_curto' },
  { id: 'capacidade_relacionada', label: 'O(A) Docente relacionou a Capacidade que iria ser desenvolvida na aula?', type: 'sim_nao', required: true },
  { id: 'comentario_capacidade', label: 'Comentário', type: 'texto_curto' },
  { id: 'ambiente_utilizado', label: 'Ambiente utilizado', type: 'escolha_multipla', required: true, options: ['Sala de Aula', 'Laboratório', 'Oficina', 'Outra'] },
  { id: 'condicoes_local', label: 'Condições do local utilizado', type: 'escolha_multipla', required: true, options: ['Adequado', 'Necessidade de modificação', 'Equipamentos ou recursos em manutenção', 'Outra'] },
  { id: 'comentario_condicoes_local', label: 'Comentário', type: 'texto_curto' },
  { id: 'recursos_utilizados', label: 'A Estratégia desenvolvida pelo(a) Docente contou com a utilização dos recursos', type: 'escolha_multipla', required: true, options: ['Lousa', 'Projetor', 'Tablet', 'Celular', 'Máquinas e/ou Equipamentos', 'Outra'] },
  { id: 'comentario_recursos', label: 'Comentário', type: 'texto_curto' },
  { id: 'epi_docente', label: 'O(a) Docente está utilizando corretamente os EPIs?', type: 'escolha_unica', required: true, options: ['SIM', 'NÃO', 'N/A'] },
  { id: 'epi_alunos', label: 'Os alunos estão utilizando corretamente os EPIs?', type: 'escolha_unica', required: true, options: ['SIM', 'NÃO', 'N/A'] },
  { id: 'comentario_epi', label: 'Comentário', type: 'texto_curto' },
  { id: 'aluno_atrasado', label: 'Chegou algum aluno atrasado?', type: 'sim_nao', required: true },
  { id: 'engajamento_docente', label: 'Engajamento do Docente no desenvolvimento da aula', type: 'nota', scale: { min: 1, max: 5 }, required: true },
  { id: 'comentario_engajamento', label: 'Comentário', type: 'texto_curto' },
  { id: 'participacao_alunos', label: 'Participação dos alunos durante as atividades da aula', type: 'nota', scale: { min: 1, max: 5 }, required: true },
  { id: 'comentario_participacao', label: 'Comentário', type: 'texto_curto' },
  { id: 'resumo_aula', label: 'Resumo da aula e comentários finais', type: 'texto', required: true },
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