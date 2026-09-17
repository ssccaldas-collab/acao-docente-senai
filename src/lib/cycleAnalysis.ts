import { STAGE1_DOCUMENTATION_QUESTIONS, STAGE2_CLASSROOM_OBSERVATION_QUESTIONS, STAGE3_FEEDBACK_QUESTIONS, type FormQuestion, type FormAnswers, type QuestionAnswer } from './formQuestions';

export interface AnalysisPoint {
  stage: number;
  questionId: string;
  label: string;
}

export interface ImprovementPoint extends AnalysisPoint {
  tip: string;
}

export interface CategoryScore {
  category: string;
  positive: number;
  negative: number;
  total: number;
  percent: number;
}

export interface CycleAnalysis {
  categories: CategoryScore[];
  strengths: AnalysisPoint[];
  improvements: ImprovementPoint[];
}

type Classification = 'positive' | 'negative' | 'skip';

function classify(q: FormQuestion, value: QuestionAnswer['value'] | undefined): Classification {
  if (!q.analysis || value === undefined || value === '') return 'skip';
  const { negativeOptions, positiveOptions, lowThreshold, highThreshold } = q.analysis;

  if (q.type === 'sim_nao') {
    if (value === 'ok') return 'positive';
    if (value === 'nao_ok') return 'negative';
    return 'skip';
  }
  if (q.type === 'escolha_unica') {
    if (typeof value !== 'string') return 'skip';
    if (negativeOptions?.includes(value)) return 'negative';
    if (positiveOptions?.includes(value)) return 'positive';
    return 'skip';
  }
  if (q.type === 'nota') {
    if (typeof value !== 'number') return 'skip';
    if (lowThreshold !== undefined && value <= lowThreshold) return 'negative';
    if (highThreshold !== undefined && value >= highThreshold) return 'positive';
    return 'skip';
  }
  return 'skip';
}

interface Accumulator {
  categories: Map<string, { positive: number; negative: number }>;
  strengths: AnalysisPoint[];
  improvements: ImprovementPoint[];
}

function analyzeStage(questions: FormQuestion[], answers: FormAnswers | null | undefined, stage: number, acc: Accumulator) {
  if (!answers) return;
  for (const q of questions) {
    if (!q.analysis) continue;
    const result = classify(q, answers[q.id]?.value);
    if (result === 'skip') continue;

    const cat = acc.categories.get(q.analysis.category) ?? { positive: 0, negative: 0 };
    if (result === 'positive') {
      cat.positive++;
      acc.strengths.push({ stage, questionId: q.id, label: q.label });
    } else {
      cat.negative++;
      acc.improvements.push({ stage, questionId: q.id, label: q.label, tip: q.analysis.improvementTip });
    }
    acc.categories.set(q.analysis.category, cat);
  }
}

export function buildCycleAnalysis(
  stage1Answers: FormAnswers | null | undefined,
  stage2Answers: FormAnswers | null | undefined,
  stage3Answers: FormAnswers | null | undefined,
): CycleAnalysis {
  const acc: Accumulator = { categories: new Map(), strengths: [], improvements: [] };

  analyzeStage(STAGE1_DOCUMENTATION_QUESTIONS, stage1Answers, 1, acc);
  analyzeStage(STAGE2_CLASSROOM_OBSERVATION_QUESTIONS, stage2Answers, 2, acc);
  analyzeStage(STAGE3_FEEDBACK_QUESTIONS, stage3Answers, 3, acc);

  const categories: CategoryScore[] = Array.from(acc.categories.entries()).map(([category, { positive, negative }]) => {
    const total = positive + negative;
    return { category, positive, negative, total, percent: total > 0 ? Math.round((positive / total) * 100) : 0 };
  });

  return { categories, strengths: acc.strengths, improvements: acc.improvements };
}