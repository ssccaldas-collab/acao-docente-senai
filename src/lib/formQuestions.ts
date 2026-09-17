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

// Migrado do formulário "AÇÃO DOCENTE - FASE 2_v2" (devolutiva / feedback referente ao acompanhamento da aula).
export const STAGE3_FEEDBACK_QUESTIONS: FormQuestion[] = [
  { id: 'nome_responsavel', label: 'Nome do responsável', type: 'texto_curto', required: true },
  { id: 'cargo', label: 'Cargo', type: 'escolha_unica', required: true, options: ['OPP', 'CT', 'CTP'] },
  { id: 'nome_docente', label: 'Nome do Docente', type: 'texto_curto', required: true },
  { id: 'data', label: 'Data', type: 'data', required: true },
  { id: 'curso', label: 'Curso', type: 'texto_curto', required: true },
  { id: 'turma', label: 'Turma', type: 'texto_curto', required: true },
  { id: 'unidade_curricular', label: 'Unidade Curricular (UC)', type: 'texto_curto', required: true },
  { id: 'documentos_norteadores', label: 'O Docente apresentou os documentos norteadores:', type: 'escolha_multipla', required: true, options: ['Proposta Pedagógica', 'Calendário Escolar', 'Plano de Curso', 'Plano de Ensino', 'Cronograma de aula', 'Tabela de Critérios', 'Tabela de Níveis de Desempenho', 'Matriz SAEP', 'DDS', 'Plano de Demonstração', 'Outra'] },
  { id: 'plano_ensino_msep', label: 'O Plano de Ensino foi elaborado de acordo com as diretrizes da MSEP?', type: 'sim_nao', required: true },
  { id: 'comentario_plano_ensino_msep', label: 'Comentários', type: 'texto' },
  { id: 'estrategia_desafiadora_uc', label: 'Qual foi a Estratégia Desafiadora utilizada para o desenvolvimento da UC', type: 'escolha_multipla', required: true, options: ['Situação Problema', 'Estudo de Caso', 'Pesquisa Aplicada', 'Projeto', 'Projeto Integrador', 'N/A'] },
  { id: 'conteudo_conforme_planejamento', label: 'O conteúdo desenvolvido na aula está de acordo com o Planejamento ou Cronograma?', type: 'sim_nao', required: true },
  { id: 'comentario_conteudo_planejamento', label: 'Comentários', type: 'texto' },
  { id: 'plano_ensino_capacidades', label: 'O Plano de Ensino contempla todas as Capacidades da UC?', type: 'sim_nao', required: true },
  { id: 'comentario_plano_ensino_capacidades', label: 'Comentários', type: 'texto' },
  { id: 'controles_frequencia', label: 'O Docente possui controles de acompanhamento de Frequência / Compensação / Recuperação', type: 'sim_nao', required: true },
  { id: 'evidencias_dds', label: 'O Docente possui evidências da realização do DDS', type: 'sim_nao', required: true },
  { id: 'estrategias_ensino_adequadas', label: 'As estratégias de ensino aplicadas são adequadas?', type: 'sim_nao', required: true },
  { id: 'comentario_estrategias_ensino', label: 'Comentários', type: 'texto' },
  { id: 'recursos_didaticos_adequados', label: 'Os recursos didáticos utilizados são adequados?', type: 'sim_nao', required: true },
  { id: 'comentario_recursos_didaticos', label: 'Comentários', type: 'texto' },
  { id: 'incentivo_posturas_proativas', label: 'Há incentivos a posturas pró-ativas dos alunos?', type: 'sim_nao', required: true },
  { id: 'comentario_incentivo_alunos', label: 'Comentários', type: 'texto' },
  { id: 'reforco_fixacao_aprendizagem', label: 'Há momentos de reforço e/ou fixação da aprendizagem (teoria ou prática)?', type: 'sim_nao', required: true },
  { id: 'comentario_reforco_aprendizagem', label: 'Comentários', type: 'texto' },
  { id: 'avaliacao_recuperacao_analisada', label: 'O processo de avaliação e recuperação (teoria ou prática) são analisados pelo(a) Docente?', type: 'sim_nao', required: true },
  { id: 'comentario_avaliacao_recuperacao', label: 'Comentários', type: 'texto' },
  { id: 'autoavaliacao_alunos', label: 'O Docente aplica a Auto-avaliação dos alunos?', type: 'sim_nao', required: true },
  { id: 'comentario_autoavaliacao', label: 'Comentários', type: 'texto' },
  { id: 'docente_referencial_turma', label: 'O Docente é Referencial de alguma turma?', type: 'sim_nao', required: true },
  { id: 'evidencias_acoes_referencial', label: 'O Docente, enquanto Referencial, possui evidências de ações com a sua turma?', type: 'escolha_unica', required: true, options: ['SIM', 'NÃO', 'N/A'] },
  { id: 'assuntos_tratados_turma', label: 'Especifique os assuntos tratados com a turma?', type: 'escolha_unica', required: true, options: ['Cidadania', 'Disciplina', 'Frequência Escolar', 'Rendimento Escolar', 'Mercado de Trabalho', 'Normas de conduta', 'N/A', 'Outra'] },
  { id: 'perfil_profissional_evidenciado', label: 'O Perfil Profissional foi evidenciado na contextualização da Estratégia Desafiadora?', type: 'sim_nao', required: true },
  { id: 'comentario_perfil_profissional', label: 'Comentários', type: 'texto' },
  { id: 'competencias_perfil_fixadas', label: 'As competências do perfil profissional estão sendo fixadas pelas ações didático-pedagógicas?', type: 'sim_nao', required: true },
  { id: 'comentario_competencias_perfil', label: 'Comentários', type: 'texto' },
  { id: 'dificuldades_aprendizagem_tratadas', label: 'As dificuldades relativas a aprendizagem e/ou a frequência, estão sendo adequadamente tratadas?', type: 'sim_nao', required: true },
  { id: 'comentario_dificuldades_aprendizagem', label: 'Comentários', type: 'texto' },
  { id: 'mdis_atendem_ementas', label: "Os MDI's utilizados atendem as ementas dos conteúdos do curso?", type: 'sim_nao', required: true },
  { id: 'acompanha_metas_referencial', label: 'O Docente acompanha as metas estabelecidas da turma que é o Referencial? (Evasão; Frequência; AE; etc.)', type: 'escolha_unica', required: true, options: ['SIM', 'NÃO', 'N/A'] },
  { id: 'fator_sucesso', label: 'Fator de Sucesso', type: 'texto_curto', required: true },
  { id: 'fator_restritivo', label: 'Fator Restritivo', type: 'texto', required: true },
  { id: 'conclusao', label: 'Conclusão', type: 'texto', required: true },
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