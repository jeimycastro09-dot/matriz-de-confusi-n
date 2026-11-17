import { MatrixCounts, MetricKey, CellKey } from '../types/confusion';

export interface ComputedMetrics {
  total: number;
  actualPositives: number;
  actualNegatives: number;
  predictedPositives: number;
  predictedNegatives: number;
  accuracy: number;
  precision: number;
  recall: number;
  specificity: number;
  f1: number;
}

export function computeMetrics(counts: MatrixCounts): ComputedMetrics {
  const { vp, fn, fp, vn } = counts;
  const total = vp + fn + fp + vn;
  const actualPositives = vp + fn;
  const actualNegatives = fp + vn;
  const predictedPositives = vp + fp;
  const predictedNegatives = fn + vn;

  const accuracy = total > 0 ? (vp + vn) / total : 0;
  const precision = predictedPositives > 0 ? vp / predictedPositives : 0;
  const recall = actualPositives > 0 ? vp / actualPositives : 0;
  const specificity = actualNegatives > 0 ? vn / actualNegatives : 0;
  const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;

  return {
    total,
    actualPositives,
    actualNegatives,
    predictedPositives,
    predictedNegatives,
    accuracy,
    precision,
    recall,
    specificity,
    f1,
  };
}

export function formatPct(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function getMetricCellHighlight(metric: MetricKey): {
  numerator: CellKey[];
  denominator: CellKey[];
} {
  switch (metric) {
    case 'accuracy':
      return { numerator: ['vp', 'vn'], denominator: ['vp', 'fn', 'fp', 'vn'] };
    case 'precision':
      return { numerator: ['vp'], denominator: ['vp', 'fp'] };
    case 'recall':
      return { numerator: ['vp'], denominator: ['vp', 'fn'] };
    case 'specificity':
      return { numerator: ['vn'], denominator: ['vn', 'fp'] };
    case 'f1':
      return { numerator: ['vp'], denominator: ['vp', 'fp', 'fn'] };
  }
}
