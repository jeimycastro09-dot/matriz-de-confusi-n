import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Minus,
  Plus,
  XCircle,
} from 'lucide-react';
import {
  CellKey,
  MatrixCounts,
  MetricKey,
  ScenarioConfig,
  SimulationMode,
} from '../types/confusion';
import { ComputedMetrics, getMetricCellHighlight } from '../utils/metrics';

interface MatrixStageProps {
  scenario: ScenarioConfig;
  counts: MatrixCounts;
  metrics: ComputedMetrics;
  mode: SimulationMode;
  threshold: number;
  selectedCell: CellKey | null;
  highlightedCells: CellKey[];
  dimUnselected: boolean;
  activeMetricHover: MetricKey | null;
  focusAxis?: 'both' | 'predicted-pos' | 'actual-pos' | 'actual-neg' | 'none';
  onSelectCell: (cell: CellKey) => void;
  onUpdateCount: (cell: CellKey, delta: number) => void;
  onChangeThreshold: (value: number) => void;
}

interface CellVisualConfig {
  key: CellKey;
  abbr: string;
  name: string;
  statusText: string;
  baseBg: string;
  topAccent: string;
  barFill: string;
  dotColor: string;
  activeBorder: string;
  iconColor: string;
  badgeTextColor: string;
  Icon: React.ComponentType<{ className?: string }>;
}

const CELL_VISUALS: Record<CellKey, CellVisualConfig> = {
  vp: {
    key: 'vp',
    abbr: 'VP',
    name: 'Verdadero Positivo',
    statusText: 'Acierto',
    baseBg: 'bg-emerald-50/75 hover:bg-emerald-50',
    topAccent: 'bg-emerald-600',
    barFill: 'bg-emerald-600',
    dotColor: 'bg-emerald-600',
    activeBorder: 'border-emerald-600 ring-2 ring-emerald-600/20 shadow-md',
    iconColor: 'text-emerald-700',
    badgeTextColor: 'text-emerald-800',
    Icon: CheckCircle2,
  },
  fn: {
    key: 'fn',
    abbr: 'FN',
    name: 'Falso Negativo',
    statusText: 'Omisión (Error II)',
    baseBg: 'bg-rose-50/75 hover:bg-rose-50',
    topAccent: 'bg-rose-600',
    barFill: 'bg-rose-600',
    dotColor: 'bg-rose-600',
    activeBorder: 'border-rose-600 ring-2 ring-rose-600/20 shadow-md',
    iconColor: 'text-rose-700',
    badgeTextColor: 'text-rose-800',
    Icon: XCircle,
  },
  fp: {
    key: 'fp',
    abbr: 'FP',
    name: 'Falso Positivo',
    statusText: 'Falsa alarma (Error I)',
    baseBg: 'bg-amber-50/75 hover:bg-amber-50',
    topAccent: 'bg-amber-500',
    barFill: 'bg-amber-500',
    dotColor: 'bg-amber-500',
    activeBorder: 'border-amber-600 ring-2 ring-amber-600/20 shadow-md',
    iconColor: 'text-amber-700',
    badgeTextColor: 'text-amber-800',
    Icon: AlertTriangle,
  },
  vn: {
    key: 'vn',
    abbr: 'VN',
    name: 'Verdadero Negativo',
    statusText: 'Acierto',
    baseBg: 'bg-teal-50/60 hover:bg-teal-50',
    topAccent: 'bg-teal-600',
    barFill: 'bg-teal-600',
    dotColor: 'bg-teal-600',
    activeBorder: 'border-teal-600 ring-2 ring-teal-600/20 shadow-md',
    iconColor: 'text-teal-700',
    badgeTextColor: 'text-teal-800',
    Icon: CheckCircle2,
  },
};

export const MatrixStage: React.FC<MatrixStageProps> = ({
  scenario,
  counts,
  metrics,
  mode,
  threshold,
  selectedCell,
  highlightedCells,
  dimUnselected,
  activeMetricHover,
  focusAxis = 'none',
  onSelectCell,
  onUpdateCount,
  onChangeThreshold,
}) => {
  const metricHighlight = activeMetricHover
    ? getMetricCellHighlight(activeMetricHover)
    : null;

  const isCellIlluminated = (cell: CellKey): boolean => {
    if (metricHighlight) {
      return metricHighlight.denominator.includes(cell);
    }
    if (!dimUnselected) return true;
    return highlightedCells.includes(cell);
  };

  const getMetricRoleLabel = (cell: CellKey): string | null => {
    if (!metricHighlight) return null;
    if (metricHighlight.numerator.includes(cell)) return 'Numerador y Denominador';
    if (metricHighlight.denominator.includes(cell)) return 'Solo Denominador';
    return null;
  };

  const renderCell = (cellKey: CellKey) => {
    const visual = CELL_VISUALS[cellKey];
    const Icon = visual.Icon;
    const count = counts[cellKey];
    const pctNum = metrics.total > 0 ? (count / metrics.total) * 100 : 0;
    const pct = pctNum.toFixed(1);
    const isSelected = selectedCell === cellKey;
    const illuminated = isCellIlluminated(cellKey);
    const metricRole = getMetricRoleLabel(cellKey);
    const isNumerator = metricHighlight?.numerator.includes(cellKey);
    const visibleUnitBlocks = Math.min(count, 40);

    return (
      <div
        key={cellKey}
        role="button"
        tabIndex={0}
        aria-pressed={isSelected}
        onClick={() => onSelectCell(cellKey)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelectCell(cellKey);
          }
        }}
        className={`relative overflow-hidden flex flex-col justify-between p-4 sm:p-5 rounded-xl border transition-all duration-150 cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 ${
          visual.baseBg
        } ${
          isSelected
            ? visual.activeBorder
            : isNumerator
            ? 'border-sky-600 ring-2 ring-sky-600/20 shadow-md'
            : 'border-slate-200 shadow-xs hover:shadow-sm'
        } ${illuminated ? 'opacity-100' : 'opacity-25'}`}
      >
        {/* Crisp Top Color Accent Bar */}
        <div className={`absolute top-0 inset-x-0 h-1 ${visual.topAccent}`} aria-hidden="true" />

        {/* Top row: Acronym + Semantic status with icon + text */}
        <div className="flex items-start justify-between gap-2 pt-0.5">
          <div>
            <span className="font-mono text-xs font-semibold tracking-wider text-slate-500">
              {visual.abbr}
            </span>
            <h4 className="text-sm sm:text-base font-semibold text-slate-900 leading-snug">
              {visual.name}
            </h4>
          </div>
          <div className={`flex items-center gap-1 text-xs font-medium shrink-0 ${visual.badgeTextColor}`}>
            <Icon className={`w-4 h-4 ${visual.iconColor}`} aria-hidden="true" />
            <span className="hidden sm:inline">{visual.statusText}</span>
          </div>
        </div>

        {/* Center: Tabular Count, Share & Proportion Bar */}
        <div className="my-3 space-y-2">
          <div className="flex items-baseline justify-between gap-3">
            <div className="flex items-baseline gap-2">
              <span className="font-display text-3xl sm:text-4xl font-bold text-slate-900 tabular-nums">
                {count}
              </span>
              <span className="text-xs text-slate-600">
                {count === 1 ? scenario.unitSingular : scenario.unitPlural}
              </span>
            </div>
            <span className="font-mono text-xs font-semibold text-slate-700 tabular-nums">
              {pct}%
            </span>
          </div>

          {/* Proportion Meter */}
          <div className="w-full h-1.5 rounded-full bg-slate-900/10 overflow-hidden" aria-hidden="true">
            <div
              className={`h-full rounded-full transition-all duration-200 ${visual.barFill}`}
              style={{ width: `${Math.min(100, pctNum)}%` }}
            />
          </div>

          {/* Visual Population Mini-Blocks */}
          <div className="flex flex-wrap gap-1 min-h-[14px]" aria-hidden="true">
            {Array.from({ length: visibleUnitBlocks }).map((_, idx) => (
              <span
                key={idx}
                className={`w-1.5 h-1.5 rounded-[2px] opacity-75 ${visual.dotColor}`}
              />
            ))}
            {count > 40 && (
              <span className="font-mono text-[10px] leading-none text-slate-500 ml-0.5">
                +{count - 40}
              </span>
            )}
          </div>
        </div>

        {/* Bottom: Context or Stepper Controls */}
        <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-slate-900/10">
          {metricRole ? (
            <span className="text-xs font-semibold text-sky-800">{metricRole}</span>
          ) : (
            <span className="text-xs font-medium text-slate-700 truncate">
              {scenario.cells[cellKey].shortTag}
            </span>
          )}

          {mode === 'manual' && (
            <div
              className="flex items-center gap-1 shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                aria-label={`Disminuir ${visual.name}`}
                onClick={() => onUpdateCount(cellKey, -1)}
                disabled={count <= 0}
                className="w-8 h-8 flex items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                aria-label={`Aumentar ${visual.name}`}
                onClick={() => onUpdateCount(cellKey, 1)}
                className="w-8 h-8 flex items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm h-full flex flex-col justify-between">
      <div>
        {/* Stage Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-200">
          <div>
            <p className="text-xs text-slate-500">
              {scenario.domainLabel} · Total analizado:{' '}
              <span className="font-mono font-semibold text-slate-900 tabular-nums">
                {metrics.total}
              </span>{' '}
              {scenario.unitPlural}
            </p>
            <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mt-0.5">
              {scenario.questionPrompt}
            </h3>
          </div>
          <div className="text-xs text-slate-500">
            Haz clic en una celda para inspeccionarla
          </div>
        </div>

        {/* 2x2 Confusion Matrix Grid */}
        <div className="overflow-x-auto">
          <div className="min-w-[520px]">
            {/* Top Axis Title */}
            <div className="grid grid-cols-[132px_1fr_1fr] gap-3 mb-2">
              <div />
              <div
                className={`col-span-2 text-center py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-colors ${
                  focusAxis === 'both' || focusAxis === 'predicted-pos'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                Predicción del Modelo (¿Qué decidió el sistema?)
              </div>
            </div>

            {/* Column Headers */}
            <div className="grid grid-cols-[132px_1fr_1fr] gap-3 mb-3 items-center">
              <div className="text-right pr-2 text-xs font-semibold text-slate-500">
                Realidad ↓ / Predicción →
              </div>
              <div
                className={`text-center py-2 px-3 rounded-lg border text-xs sm:text-sm font-semibold transition-colors ${
                  focusAxis === 'predicted-pos'
                    ? 'bg-sky-700 text-white border-sky-700'
                    : 'bg-slate-50 text-slate-800 border-slate-200'
                }`}
              >
                <div>{scenario.predictedPositiveLabel}</div>
                <div
                  className={`font-mono text-xs mt-0.5 tabular-nums ${
                    focusAxis === 'predicted-pos' ? 'text-sky-100' : 'text-slate-500'
                  }`}
                >
                  Subtotal: {metrics.predictedPositives}
                </div>
              </div>
              <div className="text-center py-2 px-3 rounded-lg border bg-slate-50 text-slate-800 border-slate-200 text-xs sm:text-sm font-semibold">
                <div>{scenario.predictedNegativeLabel}</div>
                <div className="font-mono text-xs text-slate-500 mt-0.5 tabular-nums">
                  Subtotal: {metrics.predictedNegatives}
                </div>
              </div>
            </div>

            {/* Row 1: Positivo Real */}
            <div className="grid grid-cols-[132px_1fr_1fr] gap-3 mb-3 items-stretch">
              <div
                className={`flex flex-col justify-center px-3 py-3 rounded-lg border text-right transition-colors ${
                  focusAxis === 'actual-pos' || focusAxis === 'both'
                    ? 'bg-sky-700 border-sky-700 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <span
                  className={`text-[11px] font-medium ${
                    focusAxis === 'actual-pos' || focusAxis === 'both'
                      ? 'text-sky-100'
                      : 'text-slate-500'
                  }`}
                >
                  Valor Real
                </span>
                <span className="text-xs sm:text-sm font-semibold leading-tight mt-0.5">
                  {scenario.positiveLabel}
                </span>
                <span
                  className={`font-mono text-xs mt-1 tabular-nums ${
                    focusAxis === 'actual-pos' || focusAxis === 'both'
                      ? 'text-sky-100'
                      : 'text-slate-500'
                  }`}
                >
                  {metrics.actualPositives} reales
                </span>
              </div>
              {renderCell('vp')}
              {renderCell('fn')}
            </div>

            {/* Row 2: Negativo Real */}
            <div className="grid grid-cols-[132px_1fr_1fr] gap-3 items-stretch">
              <div
                className={`flex flex-col justify-center px-3 py-3 rounded-lg border text-right transition-colors ${
                  focusAxis === 'actual-neg' || focusAxis === 'both'
                    ? 'bg-slate-800 border-slate-800 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <span
                  className={`text-[11px] font-medium ${
                    focusAxis === 'actual-neg' || focusAxis === 'both'
                      ? 'text-slate-300'
                      : 'text-slate-500'
                  }`}
                >
                  Valor Real
                </span>
                <span className="text-xs sm:text-sm font-semibold leading-tight mt-0.5">
                  {scenario.negativeLabel}
                </span>
                <span
                  className={`font-mono text-xs mt-1 tabular-nums ${
                    focusAxis === 'actual-neg' || focusAxis === 'both'
                      ? 'text-slate-300'
                      : 'text-slate-500'
                  }`}
                >
                  {metrics.actualNegatives} reales
                </span>
              </div>
              {renderCell('fp')}
              {renderCell('vn')}
            </div>
          </div>
        </div>

        {/* Mode 2: Interactive Probability Threshold Explorer */}
        {mode === 'threshold' && (
          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
              <div>
                <h4 className="text-sm font-semibold text-slate-900">
                  Simulador de Umbral de Decisión (Threshold)
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Cada punto representa un caso ordenado por probabilidad estimada. Mueve el umbral para ver cómo cambian VP, FP, FN y VN en tiempo real.
                </p>
              </div>
              <div className="font-mono text-sm font-semibold text-white bg-slate-900 px-3 py-1.5 rounded-lg tabular-nums">
                Umbral: {(threshold * 100).toFixed(0)}%
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="threshold-slider" className="sr-only">
                Umbral de probabilidad para clasificar como positivo
              </label>
              <input
                id="threshold-slider"
                type="range"
                min={0.1}
                max={0.9}
                step={0.05}
                value={threshold}
                onChange={(e) => onChangeThreshold(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-700"
              />
              <div className="flex justify-between font-mono text-[11px] text-slate-500 mt-1.5 tabular-nums">
                <span>10% (Más sensible)</span>
                <span>30%</span>
                <span>50% (Estándar)</span>
                <span>70%</span>
                <span>90% (Más estricto)</span>
              </div>
            </div>

            <div className="relative bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between text-xs text-slate-600 mb-3">
                <span>← Clasificado como Negativo (&lt; {(threshold * 100).toFixed(0)}%)</span>
                <span>Clasificado como Positivo (≥ {(threshold * 100).toFixed(0)}%) →</span>
              </div>

              <div className="space-y-2.5">
                <div>
                  <div className="text-xs font-medium text-slate-700 mb-1.5">
                    Casos realmente Positivos ({scenario.positiveLabel}):
                  </div>
                  <div className="relative h-8 bg-white border border-slate-200 rounded-lg">
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-sky-700 z-10 transition-all duration-150"
                      style={{ left: `${threshold * 100}%` }}
                    />
                    {scenario.samples
                      .filter((s) => s.actualPositive)
                      .map((sample) => {
                        const isPos = sample.predictedProbability >= threshold;
                        return (
                          <div
                            key={sample.id}
                            title={`${sample.label}: prob. ${(sample.predictedProbability * 100).toFixed(0)}% → ${isPos ? 'VP' : 'FN'}`}
                            style={{ left: `calc(${sample.predictedProbability * 100}% - 7px)` }}
                            className={`absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 transition-colors ${
                              isPos
                                ? 'bg-emerald-500 border-emerald-800'
                                : 'bg-rose-500 border-rose-800'
                            }`}
                          />
                        );
                      })}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-medium text-slate-700 mb-1.5">
                    Casos realmente Negativos ({scenario.negativeLabel}):
                  </div>
                  <div className="relative h-8 bg-white border border-slate-200 rounded-lg">
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-sky-700 z-10 transition-all duration-150"
                      style={{ left: `${threshold * 100}%` }}
                    />
                    {scenario.samples
                      .filter((s) => !s.actualPositive)
                      .map((sample) => {
                        const isPos = sample.predictedProbability >= threshold;
                        return (
                          <div
                            key={sample.id}
                            title={`${sample.label}: prob. ${(sample.predictedProbability * 100).toFixed(0)}% → ${isPos ? 'FP' : 'VN'}`}
                            style={{ left: `calc(${sample.predictedProbability * 100}% - 7px)` }}
                            className={`absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 transition-colors ${
                              isPos
                                ? 'bg-amber-400 border-amber-800'
                                : 'bg-teal-500 border-teal-800'
                            }`}
                          />
                        );
                      })}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-3 text-xs text-slate-600">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  Verde: Acierto (VP / VN)
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5 text-rose-700" />
                  Rojo: Falso Negativo (FN)
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                  Ámbar: Falso Positivo (FP)
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Selected Cell Deep-Dive Inspector */}
      {selectedCell && (
        <div className="mt-5 p-4 rounded-xl bg-slate-900 text-slate-100">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
            <h4 className="text-sm font-semibold text-white">
              Inspección: {scenario.cells[selectedCell].title}
            </h4>
            <span className="font-mono text-xs font-medium text-emerald-300 tabular-nums">
              {counts[selectedCell]} de {metrics.total} {scenario.unitPlural}
            </span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            {scenario.cells[selectedCell].meaning}{' '}
            <span className="font-semibold text-white">
              Impacto: {scenario.cells[selectedCell].consequence}
            </span>
          </p>
        </div>
      )}
    </div>
  );
};
