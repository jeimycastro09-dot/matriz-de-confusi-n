export type CellKey = 'vp' | 'fn' | 'fp' | 'vn';

export type MetricKey = 'accuracy' | 'precision' | 'recall' | 'specificity' | 'f1';

export type SimulationMode = 'manual' | 'threshold';

export interface MatrixCounts {
  vp: number; // Verdaderos Positivos
  fn: number; // Falsos Negativos
  fp: number; // Falsos Positivos
  vn: number; // Verdaderos Negativos
}

export interface SampleCase {
  id: string;
  label: string;
  actualPositive: boolean;
  predictedProbability: number; // 0 to 1
}

export interface ScenarioCellCopy {
  title: string;
  shortTag: string;
  meaning: string;
  consequence: string;
}

export interface ScenarioConfig {
  id: 'fraud' | 'credit' | 'medical' | 'spam';
  name: string;
  domainLabel: string;
  questionPrompt: string;
  positiveLabel: string;
  negativeLabel: string;
  predictedPositiveLabel: string;
  predictedNegativeLabel: string;
  unitSingular: string;
  unitPlural: string;
  defaultCounts: MatrixCounts;
  criticalError: 'fn' | 'fp';
  criticalErrorSummary: string;
  cells: Record<CellKey, ScenarioCellCopy>;
  samples: SampleCase[];
}

export interface GuideStep {
  id: number;
  title: string;
  subtitle: string;
  explanation: string;
  keyTakeaway: string;
  highlightCells: CellKey[];
  dimUnselected: boolean;
  focusAxis?: 'both' | 'predicted-pos' | 'actual-pos' | 'actual-neg' | 'none';
  linkedMetric?: MetricKey;
}

export interface QuizQuestion {
  id: string;
  scenarioTitle: string;
  matrix: MatrixCounts;
  positiveName: string;
  negativeName: string;
  question: string;
  options: {
    id: string;
    label: string;
  }[];
  correctOptionId: string;
  explanation: string;
}
