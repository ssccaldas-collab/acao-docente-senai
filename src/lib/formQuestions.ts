export type QuestionType = 'sim_nao' | 'nota' | 'texto' | 'texto_curto' | 'data' | 'escolha_unica' | 'escolha_multipla';

export interface QuestionAnalysis {
  category: string;
  improvementTip: string;
  negativeOptions?: string[];
  positiveOptions?: string[];
  lowThreshold?: number;
  highThreshold?: number;
}

export interface FormQuestion {
  id: string;
  label: string;
  type: QuestionType;
  required?: boolean;
  helpText?: string;
  scale?: { min: number; max: number };
  options?: string[];
  analysis?: QuestionAnalysis;
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
  { id: 'estrategia_contextualizada', label: 'A Estratégia Desafiadora possui contextualização de acordo com o Perfil Profissional do curso?', type: 'sim_nao', required: true,
    analysis: { category: 'Planejamento e Documentação', improvementTip: 'Orientar o(a) docente a contextualizar a Estratégia Desafiadora com o Perfil Profissional do curso.' } },
  { id: 'carga_horaria_distribuida', label: 'A carga horária da UC está distribuída corretamente conforme Cronograma ou Planejamento de Ensino?', type: 'sim_nao', required: true,
    analysis: { category: 'Planejamento e Documentação', improvementTip: 'Revisar com o(a) docente a distribuição da carga horária da UC conforme o Cronograma/Planejamento de Ensino.' } },
  { id: 'tabela_criterios_criada', label: 'O(A) Docente criou a Tabela de Critérios?', type: 'sim_nao', required: true,
    analysis: { category: 'Planejamento e Documentação', improvementTip: 'Apoiar o(a) docente na criação da Tabela de Critérios de avaliação da UC.' } },
  { id: 'criterios_de_acordo', label: 'Os critérios estão de acordo com a Capacidade a ser avaliada?', type: 'sim_nao', required: true,
    analysis: { category: 'Planejamento e Documentação', improvementTip: 'Ajustar os critérios de avaliação para que fiquem de acordo com a Capacidade a ser avaliada.' } },
  { id: 'tabela_niveis_criada', label: 'O(A) Docente criou a Tabela de Níveis de Desempenho?', type: 'sim_nao', required: true,
    analysis: { category: 'Planejamento e Documentação', improvementTip: 'Apoiar o(a) docente na criação da Tabela de Níveis de Desempenho.' } },
  { id: 'conclusao', label: 'Conclusão', type: 'texto', required: true },
  { id: 'acao_satisfatoria', label: 'A ação docente é satisfatória?', type: 'sim_nao', required: true,
    analysis: { category: 'Planejamento e Documentação', improvementTip: 'A ação docente foi considerada não satisfatória nesta etapa — recomenda-se um plano de acompanhamento próximo com o(a) docente.' } },
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
  { id: 'aguardando_alunos', label: 'O(A) Docente estava aguardando os alunos para o início da aula?', type: 'sim_nao', required: true,
    analysis: { category: 'Condução da Aula', improvementTip: 'Orientar o(a) docente a estar pronto(a) e aguardando os alunos antes do início da aula.' } },
  { id: 'comentario_aguardando_alunos', label: 'Comentário', type: 'texto_curto' },
  { id: 'chamada_realizada', label: 'O(A) Docente realizou a chamada no início da aula?', type: 'sim_nao', required: true,
    analysis: { category: 'Condução da Aula', improvementTip: 'Reforçar a importância de realizar a chamada no início de cada aula para controle de frequência.' } },
  { id: 'comentario_chamada', label: 'Comentário', type: 'texto_curto' },
  { id: 'capacidade_relacionada', label: 'O(A) Docente relacionou a Capacidade que iria ser desenvolvida na aula?', type: 'sim_nao', required: true,
    analysis: { category: 'Condução da Aula', improvementTip: 'Orientar o(a) docente a apresentar a Capacidade que será desenvolvida logo no início da aula, dando clareza ao objetivo aos alunos.' } },
  { id: 'comentario_capacidade', label: 'Comentário', type: 'texto_curto' },
  { id: 'ambiente_utilizado', label: 'Ambiente utilizado', type: 'escolha_multipla', required: true, options: ['Sala de Aula', 'Laboratório', 'Oficina', 'Outra'] },
  { id: 'condicoes_local', label: 'Condições do local utilizado', type: 'escolha_multipla', required: true, options: ['Adequado', 'Necessidade de modificação', 'Equipamentos ou recursos em manutenção', 'Outra'] },
  { id: 'comentario_condicoes_local', label: 'Comentário', type: 'texto_curto' },
  { id: 'recursos_utilizados', label: 'A Estratégia desenvolvida pelo(a) Docente contou com a utilização dos recursos', type: 'escolha_multipla', required: true, options: ['Lousa', 'Projetor', 'Tablet', 'Celular', 'Máquinas e/ou Equipamentos', 'Outra'] },
  { id: 'comentario_recursos', label: 'Comentário', type: 'texto_curto' },
  { id: 'epi_docente', label: 'O(a) Docente está utilizando corretamente os EPIs?', type: 'escolha_unica', required: true, options: ['SIM', 'NÃO', 'N/A'],
    analysis: { category: 'Condução da Aula', positiveOptions: ['SIM'], negativeOptions: ['NÃO'], improvementTip: 'Reforçar com o(a) docente o uso correto dos Equipamentos de Proteção Individual (EPIs).' } },
  { id: 'epi_alunos', label: 'Os alunos estão utilizando corretamente os EPIs?', type: 'escolha_unica', required: true, options: ['SIM', 'NÃO', 'N/A'],
    analysis: { category: 'Condução da Aula', positiveOptions: ['SIM'], negativeOptions: ['NÃO'], improvementTip: 'Orientar o(a) docente a cobrar e supervisionar o uso correto dos EPIs pelos alunos.' } },
  { id: 'comentario_epi', label: 'Comentário', type: 'texto_curto' },
  { id: 'aluno_atrasado', label: 'Chegou algum aluno atrasado?', type: 'sim_nao', required: true },
  { id: 'engajamento_docente', label: 'Engajamento do Docente no desenvolvimento da aula', type: 'nota', scale: { min: 1, max: 5 }, required: true,
    analysis: { category: 'Engajamento e Participação dos Alunos', lowThreshold: 2, highThreshold: 4, improvementTip: 'Nota baixa de engajamento do(a) docente durante a aula — considerar apoio pedagógico para dinâmicas mais participativas.' } },
  { id: 'comentario_engajamento', label: 'Comentário', type: 'texto_curto' },
  { id: 'participacao_alunos', label: 'Participação dos alunos durante as atividades da aula', type: 'nota', scale: { min: 1, max: 5 }, required: true,
    analysis: { category: 'Engajamento e Participação dos Alunos', lowThreshold: 2, highThreshold: 4, improvementTip: 'Baixa participação dos alunos durante a aula — orientar o(a) docente a adotar estratégias que incentivem mais a participação ativa da turma.' } },
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
  { id: 'plano_ensino_msep', label: 'O Plano de Ensino foi elaborado de acordo com as diretrizes da MSEP?', type: 'sim_nao', required: true,
    analysis: { category: 'Planejamento e Documentação', improvementTip: 'Orientar o(a) docente a elaborar o Plano de Ensino de acordo com as diretrizes da MSEP.' } },
  { id: 'comentario_plano_ensino_msep', label: 'Comentários', type: 'texto' },
  { id: 'estrategia_desafiadora_uc', label: 'Qual foi a Estratégia Desafiadora utilizada para o desenvolvimento da UC', type: 'escolha_multipla', required: true, options: ['Situação Problema', 'Estudo de Caso', 'Pesquisa Aplicada', 'Projeto', 'Projeto Integrador', 'N/A'] },
  { id: 'conteudo_conforme_planejamento', label: 'O conteúdo desenvolvido na aula está de acordo com o Planejamento ou Cronograma?', type: 'sim_nao', required: true,
    analysis: { category: 'Condução da Aula', improvementTip: 'Alinhar com o(a) docente o conteúdo desenvolvido em aula ao Planejamento/Cronograma definido.' } },
  { id: 'comentario_conteudo_planejamento', label: 'Comentários', type: 'texto' },
  { id: 'plano_ensino_capacidades', label: 'O Plano de Ensino contempla todas as Capacidades da UC?', type: 'sim_nao', required: true,
    analysis: { category: 'Planejamento e Documentação', improvementTip: 'Revisar o Plano de Ensino para que contemple todas as Capacidades da UC.' } },
  { id: 'comentario_plano_ensino_capacidades', label: 'Comentários', type: 'texto' },
  { id: 'controles_frequencia', label: 'O Docente possui controles de acompanhamento de Frequência / Compensação / Recuperação', type: 'sim_nao', required: true,
    analysis: { category: 'Planejamento e Documentação', improvementTip: 'Apoiar o(a) docente na implementação de controles de Frequência/Compensação/Recuperação.' } },
  { id: 'evidencias_dds', label: 'O Docente possui evidências da realização do DDS', type: 'sim_nao', required: true,
    analysis: { category: 'Planejamento e Documentação', improvementTip: 'Orientar o(a) docente a registrar evidências da realização do DDS.' } },
  { id: 'estrategias_ensino_adequadas', label: 'As estratégias de ensino aplicadas são adequadas?', type: 'sim_nao', required: true,
    analysis: { category: 'Metodologia e Recursos Didáticos', improvementTip: 'Rever com o(a) docente as estratégias de ensino aplicadas, buscando maior adequação ao perfil da turma.' } },
  { id: 'comentario_estrategias_ensino', label: 'Comentários', type: 'texto' },
  { id: 'recursos_didaticos_adequados', label: 'Os recursos didáticos utilizados são adequados?', type: 'sim_nao', required: true,
    analysis: { category: 'Metodologia e Recursos Didáticos', improvementTip: 'Orientar o(a) docente na escolha de recursos didáticos mais adequados ao conteúdo da aula.' } },
  { id: 'comentario_recursos_didaticos', label: 'Comentários', type: 'texto' },
  { id: 'incentivo_posturas_proativas', label: 'Há incentivos a posturas pró-ativas dos alunos?', type: 'sim_nao', required: true,
    analysis: { category: 'Engajamento e Participação dos Alunos', improvementTip: 'Estimular o(a) docente a incentivar posturas mais pró-ativas dos alunos em sala.' } },
  { id: 'comentario_incentivo_alunos', label: 'Comentários', type: 'texto' },
  { id: 'reforco_fixacao_aprendizagem', label: 'Há momentos de reforço e/ou fixação da aprendizagem (teoria ou prática)?', type: 'sim_nao', required: true,
    analysis: { category: 'Engajamento e Participação dos Alunos', improvementTip: 'Orientar o(a) docente a incluir momentos de reforço e fixação da aprendizagem (teoria e/ou prática).' } },
  { id: 'comentario_reforco_aprendizagem', label: 'Comentários', type: 'texto' },
  { id: 'avaliacao_recuperacao_analisada', label: 'O processo de avaliação e recuperação (teoria ou prática) são analisados pelo(a) Docente?', type: 'sim_nao', required: true,
    analysis: { category: 'Avaliação e Acompanhamento da Aprendizagem', improvementTip: 'Reforçar a importância de o(a) docente analisar o processo de avaliação e recuperação dos alunos.' } },
  { id: 'comentario_avaliacao_recuperacao', label: 'Comentários', type: 'texto' },
  { id: 'autoavaliacao_alunos', label: 'O Docente aplica a Auto-avaliação dos alunos?', type: 'sim_nao', required: true,
    analysis: { category: 'Avaliação e Acompanhamento da Aprendizagem', improvementTip: 'Orientar o(a) docente a aplicar a Auto-avaliação dos alunos como prática pedagógica.' } },
  { id: 'comentario_autoavaliacao', label: 'Comentários', type: 'texto' },
  { id: 'docente_referencial_turma', label: 'O Docente é Referencial de alguma turma?', type: 'sim_nao', required: true },
  { id: 'evidencias_acoes_referencial', label: 'O Docente, enquanto Referencial, possui evidências de ações com a sua turma?', type: 'escolha_unica', required: true, options: ['SIM', 'NÃO', 'N/A'],
    analysis: { category: 'Atuação como Referencial de Turma', positiveOptions: ['SIM'], negativeOptions: ['NÃO'], improvementTip: 'Como Referencial da turma, orientar o(a) docente a registrar evidências das ações realizadas com a turma.' } },
  { id: 'assuntos_tratados_turma', label: 'Especifique os assuntos tratados com a turma?', type: 'escolha_unica', required: true, options: ['Cidadania', 'Disciplina', 'Frequência Escolar', 'Rendimento Escolar', 'Mercado de Trabalho', 'Normas de conduta', 'N/A', 'Outra'] },
  { id: 'perfil_profissional_evidenciado', label: 'O Perfil Profissional foi evidenciado na contextualização da Estratégia Desafiadora?', type: 'sim_nao', required: true,
    analysis: { category: 'Perfil Profissional', improvementTip: 'Reforçar a contextualização da Estratégia Desafiadora com o Perfil Profissional do curso.' } },
  { id: 'comentario_perfil_profissional', label: 'Comentários', type: 'texto' },
  { id: 'competencias_perfil_fixadas', label: 'As competências do perfil profissional estão sendo fixadas pelas ações didático-pedagógicas?', type: 'sim_nao', required: true,
    analysis: { category: 'Perfil Profissional', improvementTip: 'Orientar o(a) docente a fixar as competências do perfil profissional por meio das ações didático-pedagógicas.' } },
  { id: 'comentario_competencias_perfil', label: 'Comentários', type: 'texto' },
  { id: 'dificuldades_aprendizagem_tratadas', label: 'As dificuldades relativas a aprendizagem e/ou a frequência, estão sendo adequadamente tratadas?', type: 'sim_nao', required: true,
    analysis: { category: 'Avaliação e Acompanhamento da Aprendizagem', improvementTip: 'Definir com o(a) docente um plano para tratar adequadamente as dificuldades de aprendizagem e/ou frequência identificadas.' } },
  { id: 'comentario_dificuldades_aprendizagem', label: 'Comentários', type: 'texto' },
  { id: 'mdis_atendem_ementas', label: "Os MDI's utilizados atendem as ementas dos conteúdos do curso?", type: 'sim_nao', required: true,
    analysis: { category: 'Metodologia e Recursos Didáticos', improvementTip: "Revisar os MDI's utilizados para que atendam às ementas dos conteúdos do curso." } },
  { id: 'acompanha_metas_referencial', label: 'O Docente acompanha as metas estabelecidas da turma que é o Referencial? (Evasão; Frequência; AE; etc.)', type: 'escolha_unica', required: true, options: ['SIM', 'NÃO', 'N/A'],
    analysis: { category: 'Atuação como Referencial de Turma', positiveOptions: ['SIM'], negativeOptions: ['NÃO'], improvementTip: 'Como Referencial da turma, orientar o(a) docente a acompanhar as metas estabelecidas (Evasão, Frequência, AE etc.).' } },
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