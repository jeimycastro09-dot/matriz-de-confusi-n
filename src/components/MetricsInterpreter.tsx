import React from 'react';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { MatrixCounts, MetricKey, ScenarioConfig } from '../types/confusion';
import { ComputedMetrics, formatPct } from '../utils/metrics';

interface MetricsInterpreterProps {
  scenario: ScenarioConfig;
  counts: MatrixCounts;
  metrics: ComputedMetrics;
  activeMetric: MetricKey | null;
  onHoverMetric: (metric: MetricKey | null) => void;
  onToggleMetricLock: (metric: MetricKey) => void;
  lockedMetric: MetricKey | null;
}

interface MetricCardDef {
  key: MetricKey;
  title: string;
  englishName: string;
  question: string;
  formulaSymbolic: string;
  formulaPlugged: string;
  value: number;
  ringColor: string;
  interpretation: string;
}

const RadialGauge: React.FC<{ value: number; strokeClass: string }> = ({
  value,
  strokeClass,
}) => {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(1, value));
  const offset = circumference - clamped * circumference;

  return (
    <svg className="w-12 h-12 -rotate-90 shrink-0" viewBox="0 0 48 48" aria-hidden="true">
      <circle
        cx="24"
        cy="24"
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth="4.5"
        className="text-slate-200"
      />
      <circle
        cx="24"
        cy="24"
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className={`transition-all duration-300 ${strokeClass}`}
      />
    </svg>
  );
};

export const MetricsInterpreter: React.FC<MetricsInterpreterProps> = ({
  scenario,
  counts,
  metrics,
  activeMetric,
  onHoverMetric,
  onToggleMetricLock,
  lockedMetric,
}) => {
  const { vp, fn, fp, vn } = counts;
  const { total, accuracy, precision, recall, specificity, f1 } = metrics;

  const cards: MetricCardDef[] = [
    {
      key: 'accuracy',
      title: 'Exactitud',
      englishName: 'Accuracy',
      question: '¿Qué porcentaje del total clasificó bien?',
      formulaSymbolic: '(VP + VN) / Total',
      formulaPlugged: `(${vp} + ${vn}) / ${total}`,
      value: accuracy,
      ringColor: 'text-slate-800',
      interpretation:
        total > 0
          ? `Acertó en ${vp + vn} de ${total} ${scenario.unitPlural}. Útil cuando las clases están equilibradas.`
          : 'Sin casos registrados.',
    },
    {
      key: 'precision',
      title: 'Precisión',
      englishName: 'Precision',
      question: 'Cuando predice Positivo, ¿qué tanto acierta?',
      formulaSymbolic: 'VP / (VP + FP)',
      formulaPlugged: `${vp} / (${vp} + ${fp})`,
      value: precision,
      ringColor: 'text-amber-600',
      interpretation:
        metrics.predictedPositives > 0
          ? `De ${metrics.predictedPositives} alertas positivas, ${vp} eran reales y ${fp} fueron falsas alarmas.`
          : 'El modelo no emitió predicciones positivas.',
    },
    {
      key: 'recall',
      title: 'Sensibilidad',
      englishName: 'Recall / TPR',
      question: 'De todos los Positivos reales, ¿cuántos atrapó?',
      formulaSymbolic: 'VP / (VP + FN)',
      formulaPlugged: `${vp} / (${vp} + ${fn})`,
      value: recall,
      ringColor: 'text-emerald-600',
      interpretation:
        metrics.actualPositives > 0
          ? `Detectó ${vp} de ${metrics.actualPositives} casos reales de ${scenario.positiveLabel.toLowerCase()}.`
          : 'No hay casos positivos reales en la muestra.',
    },
    {
      key: 'specificity',
      title: 'Especificidad',
      englishName: 'Specificity / TNR',
      question: 'De todos los Negativos reales, ¿cuántos descartó bien?',
      formulaSymbolic: 'VN / (VN + FP)',
      formulaPlugged: `${vn} / (${vn} + ${fp})`,
      value: specificity,
      ringColor: 'text-teal-600',
      interpretation:
        metrics.actualNegatives > 0
          ? `Identificó correctamente ${vn} de ${metrics.actualNegatives} casos negativos reales.`
          : 'No hay casos negativos reales en la muestra.',
    },
    {
      key: 'f1',
      title: 'Puntaje F1',
      englishName: 'F1-Score',
      question: '¿Qué tan equilibrados están Precisión y Sensibilidad?',
      formulaSymbolic: '2 · (P · S) / (P + S)',
      formulaPlugged: `2 · (${(precision * 100).toFixed(0)}% · ${(recall * 100).toFixed(0)}%) / (${(precision * 100).toFixed(0)}% + ${(recall * 100).toFixed(0)}%)`,
      value: f1,
      ringColor: 'text-sky-600',
      interpretation:
        'Media armónica entre Precisión y Sensibilidad. Penaliza fuertemente si alguna de las dos cae cerca de cero.',
    },
  ];

  const buildDiagnosis = () => {
    const notes: { type: 'ok' | 'warn' | 'info'; title: string; detail: string }[] = [];

    if (total === 0) {
      return [
        {
          type: 'info' as const,
          title: 'Sin datos para diagnosticar',
          detail: 'Agrega al menos un caso en la matriz para calcular e interpretar las métricas.',
        },
      ];
    }

    const posShare = metrics.actualPositives / total;
    if (posShare <= 0.25 && accuracy >= 0.8 && recall < 0.65) {
      notes.push({
        type: 'warn',
        title: 'Alerta: Paradoja de la Exactitud por clases desbalanceadas',
        detail: `Aunque la Exactitud parece alta (${formatPct(accuracy)}), solo el ${formatPct(posShare)} de los datos son positivos reales y la Sensibilidad es baja (${formatPct(recall)}). El modelo está dejando escapar demasiados casos positivos.`,
      });
    }

    if (scenario.criticalError === 'fn' && recall < 0.75) {
      notes.push({
        type: 'warn',
        title: `Riesgo en ${scenario.name}: Falsos Negativos elevados`,
        detail: `Se escaparon ${fn} de ${metrics.actualPositives} casos positivos reales (Sensibilidad: ${formatPct(recall)}). En este dominio conviene bajar el umbral de decisión para capturar más casos aunque suban un poco las falsas alarmas.`,
      });
    } else if (scenario.criticalError === 'fp' && precision < 0.8) {
      notes.push({
        type: 'warn',
        title: `Riesgo en ${scenario.name}: Demasiadas falsas alarmas`,
        detail: `La Precisión es ${formatPct(precision)} (${fp} falsos positivos). En este contexto conviene subir el umbral de exigencia para no bloquear o etiquetar erróneamente casos legítimos.`,
      });
    }

    if (f1 >= 0.8) {
      notes.push({
        type: 'ok',
        title: 'Buen equilibrio general (F1 sólido)',
        detail: `Con un Puntaje F1 de ${formatPct(f1)}, el modelo logra detectar casos positivos (${formatPct(recall)}) sin generar un exceso descontrolado de falsas alarmas (Precisión ${formatPct(precision)}).`,
      });
    } else if (notes.length === 0) {
      notes.push({
        type: 'info',
        title: 'Modelo en punto intermedio de desempeño',
        detail: `La Precisión es ${formatPct(precision)} y la Sensibilidad es ${formatPct(recall)} (F1: ${formatPct(f1)}). Prueba ajustar el umbral o modificar VP/FP/FN para observar cómo se compensan.`,
      });
    }

    return notes;
  };

  const diagnosisNotes = buildDiagnosis();

  return (
    <section id="metricas" className="scroll-mt-24 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-slate-900">
            Métricas e interpretación en vivo
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-1 max-w-2xl">
            Pasa el cursor o haz clic sobre cualquier métrica para resaltar en la matriz las celdas que entran en su fórmula.
          </p>
        </div>
        {lockedMetric && (
          <button
            type="button"
            onClick={() => onToggleMetricLock(lockedMetric)}
            className="text-xs font-semibold text-sky-800 hover:text-sky-950 underline underline-offset-4 cursor-pointer"
          >
            Quitar selección fija de métrica
          </button>
        )}
      </div>

      {/* 5 Metric Cards with SVG Radial Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((card) => {
          const isHighlighted = activeMetric === card.key;
          const isLocked = lockedMetric === card.key;
          return (
            <button
              key={card.key}
              type="button"
              onMouseEnter={() => onHoverMetric(card.key)}
              onMouseLeave={() => onHoverMetric(null)}
              onFocus={() => onHoverMetric(card.key)}
              onBlur={() => onHoverMetric(null)}
              onClick={() => onToggleMetricLock(card.key)}
              aria-pressed={isLocked}
              className={`text-left p-4 rounded-xl border transition-all duration-150 cursor-pointer flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 ${
                isHighlighted || isLocked
                  ? 'bg-sky-50/80 border-sky-600 ring-2 ring-sky-600/20 shadow-md'
                  : 'bg-white border-slate-200 shadow-xs hover:border-slate-300 hover:shadow-sm'
              }`}
            >
              <div>
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="text-sm font-semibold text-slate-900">{card.title}</h3>
                  <span className="text-[11px] text-slate-500">{card.englishName}</span>
                </div>

                <div className="flex items-center justify-between gap-2 mt-3">
                  <div className="font-display text-3xl font-bold text-slate-900 tabular-nums">
                    {formatPct(card.value)}
                  </div>
                  <RadialGauge value={card.value} strokeClass={card.ringColor} />
                </div>

                <p className="text-xs font-medium text-slate-700 mt-2 leading-snug">
                  {card.question}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/80 space-y-1.5">
                <div className="font-mono text-[11px] text-slate-500 truncate" title={card.formulaSymbolic}>
                  {card.formulaSymbolic}
                </div>
                <div className="font-mono text-xs font-semibold text-sky-900 bg-slate-100 px-2 py-1 rounded truncate tabular-nums" title={card.formulaPlugged}>
                  {card.formulaPlugged}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pt-1">
                  {card.interpretation}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Automatic Natural-Language Interpretation */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs">
        <h3 className="text-base font-semibold text-slate-900 mb-3">
          Diagnóstico automático del escenario actual ({scenario.name})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {diagnosisNotes.map((note, idx) => {
            const Icon =
              note.type === 'ok'
                ? CheckCircle2
                : note.type === 'warn'
                ? AlertTriangle
                : Info;
            const boxStyle =
              note.type === 'ok'
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                : note.type === 'warn'
                ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                : 'bg-slate-50 border-slate-200 text-slate-900';
            const iconColor =
              note.type === 'ok'
                ? 'text-emerald-700'
                : note.type === 'warn'
                ? 'text-amber-700'
                : 'text-sky-700';

            return (
              <div key={idx} className={`p-4 rounded-xl border ${boxStyle}`}>
                <div className="flex items-start gap-2.5">
                  <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} aria-hidden="true" />
                  <div>
                    <h4 className="text-sm font-semibold">{note.title}</h4>
                    <p className="text-sm opacity-90 mt-1 leading-relaxed">{note.detail}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
