import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowDown,
  CheckCircle2,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { GuidedWalkthrough } from './components/GuidedWalkthrough';
import { Header } from './components/Header';
import { MatrixStage } from './components/MatrixStage';
import { MetricsInterpreter } from './components/MetricsInterpreter';
import { PracticeQuiz } from './components/PracticeQuiz';
import { GUIDE_STEPS, SCENARIOS } from './data/scenarios';
import {
  CellKey,
  MatrixCounts,
  MetricKey,
  SimulationMode,
} from './types/confusion';
import { computeMetrics } from './utils/metrics';

export default function App() {
  const [scenarioId, setScenarioId] = useState<'fraud' | 'credit' | 'medical' | 'spam'>('fraud');
  const [mode, setMode] = useState<SimulationMode>('manual');
  const [manualCounts, setManualCounts] = useState<MatrixCounts>(
    SCENARIOS[0].defaultCounts
  );
  const [threshold, setThreshold] = useState<number>(0.5);
  const [selectedCell, setSelectedCell] = useState<CellKey | null>('vp');
  const [heroImgFailed, setHeroImgFailed] = useState<boolean>(false);

  // Walkthrough state
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isWalkthroughActive, setIsWalkthroughActive] = useState<boolean>(true);

  // Metric hover / lock state
  const [hoveredMetric, setHoveredMetric] = useState<MetricKey | null>(null);
  const [lockedMetric, setLockedMetric] = useState<MetricKey | null>(null);

  const simulatorRef = useRef<HTMLElement | null>(null);

  const scenario = useMemo(
    () => SCENARIOS.find((s) => s.id === scenarioId) ?? SCENARIOS[0],
    [scenarioId]
  );

  const activeCounts: MatrixCounts = useMemo(() => {
    if (mode === 'manual') {
      return manualCounts;
    }
    let vp = 0;
    let fn = 0;
    let fp = 0;
    let vn = 0;
    for (const sample of scenario.samples) {
      const predictedPos = sample.predictedProbability >= threshold;
      if (sample.actualPositive && predictedPos) vp += 1;
      else if (sample.actualPositive && !predictedPos) fn += 1;
      else if (!sample.actualPositive && predictedPos) fp += 1;
      else vn += 1;
    }
    return { vp, fn, fp, vn };
  }, [mode, manualCounts, scenario, threshold]);

  const metrics = useMemo(() => computeMetrics(activeCounts), [activeCounts]);

  const currentStep = GUIDE_STEPS[currentStepIndex];

  useEffect(() => {
    if (!isPlaying) return;
    const timer = window.setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev >= GUIDE_STEPS.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 5500);
    return () => window.clearInterval(timer);
  }, [isPlaying]);

  const handleSelectScenario = (id: 'fraud' | 'credit' | 'medical' | 'spam') => {
    const nextScenario = SCENARIOS.find((s) => s.id === id) ?? SCENARIOS[0];
    setScenarioId(id);
    setManualCounts(nextScenario.defaultCounts);
    setThreshold(0.5);
    setSelectedCell('vp');
  };

  const handleUpdateCount = (cell: CellKey, delta: number) => {
    setManualCounts((prev) => ({
      ...prev,
      [cell]: Math.max(0, prev[cell] + delta),
    }));
  };

  const handleApplyImbalanceTrap = () => {
    setMode('manual');
    setManualCounts({ vp: 1, fn: 9, fp: 0, vn: 90 });
    setCurrentStepIndex(1);
    setIsWalkthroughActive(true);
    simulatorRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleResetAll = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
    setIsWalkthroughActive(true);
    setManualCounts(scenario.defaultCounts);
    setThreshold(0.5);
    setLockedMetric(null);
    setSelectedCell('vp');
  };

  const handleJumpToSimulator = () => {
    simulatorRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleToggleMetricLock = (metric: MetricKey) => {
    setLockedMetric((prev) => (prev === metric ? null : metric));
  };

  const effectiveMetricHighlight =
    hoveredMetric ??
    lockedMetric ??
    (isWalkthroughActive ? currentStep.linkedMetric ?? null : null);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header onJumpToSimulator={handleJumpToSimulator} />

      {/* Section 1: Striking Obsidian Navy Hero + 4-Quadrant Anatomy Strip */}
      <section
        id="introduccion"
        className="scroll-mt-16 bg-slate-950 text-white border-b border-slate-800 relative overflow-hidden"
      >
        {/* Subtle Architectural Grid Texture */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #94a3b8 1px, transparent 1px), linear-gradient(to bottom, #94a3b8 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12 sm:pt-14 sm:pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
            {/* Hero Left Copy */}
            <div className="lg:col-span-7 flex flex-col justify-center space-y-5">
              <p className="text-xs font-semibold tracking-wide text-emerald-400">
                Banca y Ciencia de Datos · Evaluación de Modelos
              </p>
              <h1
                className="font-display font-bold tracking-tight text-white leading-[1.1]"
                style={{
                  fontSize: 'clamp(2.25rem, 4vw, 3.35rem)',
                  textWrap: 'balance',
                }}
              >
                Aprende a leer e interpretar la matriz de confusión paso a paso
              </h1>
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
                Una matriz de confusión compara lo que realmente ocurrió frente a lo que predijo tu modelo. Descubre con ejemplos bancarios reales cuántos fraudes bloquea un sistema, cuántos deja escapar y cómo equilibrar cada decisión.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleJumpToSimulator}
                  className="inline-flex items-center gap-2 px-5 py-3 min-h-[44px] rounded-xl bg-emerald-400 text-slate-950 font-semibold text-sm hover:bg-emerald-300 transition-colors cursor-pointer"
                >
                  <span>Iniciar simulación</span>
                  <ArrowDown className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleApplyImbalanceTrap}
                  className="inline-flex items-center gap-2 px-5 py-3 min-h-[44px] rounded-xl border border-slate-700 bg-slate-900/80 text-slate-200 font-medium text-sm hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
                >
                  <span>Probar trampa de exactitud</span>
                </button>
              </div>
            </div>

            {/* Hero Right Visual Frame */}
            <div className="lg:col-span-5">
              <div className="relative h-64 sm:h-80 lg:h-full min-h-[260px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl">
                {!heroImgFailed ? (
                  <img
                    src="/src/assets/images/hero_banking_matrix_1794940684108.jpg"
                    alt="Visualización arquitectónica de flujos financieros pasando por una matriz de decisión 2 por 2"
                    referrerPolicy="no-referrer"
                    onError={() => setHeroImgFailed(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 text-center">
                    <ShieldCheck className="w-12 h-12 text-emerald-400 mb-3" />
                    <p className="font-display text-lg font-semibold text-white">
                      Evaluación Bancaria 2×2
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Clasificación de riesgo y fraude en tiempo real
                    </p>
                  </div>
                )}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent"
                />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3 text-xs text-slate-200">
                  <span className="font-medium">
                    Flujo de decisiones · Realidad vs. Predicción
                  </span>
                  <span className="font-mono text-emerald-300 tabular-nums">
                    2 × 2
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 4-column Anatomy Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
            <div className="relative overflow-hidden bg-slate-900/90 border border-slate-800 rounded-xl p-4">
              <div className="absolute top-0 inset-x-0 h-1 bg-emerald-500" aria-hidden="true" />
              <div className="flex items-center justify-between gap-2 mb-1.5 pt-0.5">
                <span className="font-mono text-xs font-semibold text-slate-400">VP</span>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Acierto
                </span>
              </div>
              <h2 className="text-sm font-semibold text-white">Verdadero Positivo</h2>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Era positivo y acertó. En un banco: un fraude real bloqueado a tiempo.
              </p>
            </div>

            <div className="relative overflow-hidden bg-slate-900/90 border border-slate-800 rounded-xl p-4">
              <div className="absolute top-0 inset-x-0 h-1 bg-teal-500" aria-hidden="true" />
              <div className="flex items-center justify-between gap-2 mb-1.5 pt-0.5">
                <span className="font-mono text-xs font-semibold text-slate-400">VN</span>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-teal-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                  Acierto
                </span>
              </div>
              <h2 className="text-sm font-semibold text-white">Verdadero Negativo</h2>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Era negativo y acertó. En un banco: un pago legítimo aprobado sin fricción.
              </p>
            </div>

            <div className="relative overflow-hidden bg-slate-900/90 border border-slate-800 rounded-xl p-4">
              <div className="absolute top-0 inset-x-0 h-1 bg-amber-500" aria-hidden="true" />
              <div className="flex items-center justify-between gap-2 mb-1.5 pt-0.5">
                <span className="font-mono text-xs font-semibold text-slate-400">FP</span>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-300">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  Falsa alarma
                </span>
              </div>
              <h2 className="text-sm font-semibold text-white">Falso Positivo</h2>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Error Tipo I: predijo positivo sin serlo. Ej.: bloquear la tarjeta a un cliente honesto.
              </p>
            </div>

            <div className="relative overflow-hidden bg-slate-900/90 border border-slate-800 rounded-xl p-4">
              <div className="absolute top-0 inset-x-0 h-1 bg-rose-500" aria-hidden="true" />
              <div className="flex items-center justify-between gap-2 mb-1.5 pt-0.5">
                <span className="font-mono text-xs font-semibold text-slate-400">FN</span>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-300">
                  <XCircle className="w-3.5 h-3.5 text-rose-400" />
                  Omisión
                </span>
              </div>
              <h2 className="text-sm font-semibold text-white">Falso Negativo</h2>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Error Tipo II: dejó pasar un positivo real. Ej.: aprobar una compra fraudulenta.
              </p>
            </div>
          </div>
        </div>
      </section>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-14">
        {/* Section 2: Interactive Two-Zone Sandbox */}
        <section
          id="simulador"
          ref={simulatorRef}
          className="scroll-mt-24 space-y-5"
        >
          {/* Workspace Control Toolbar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
            {/* Scenario Selector */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-semibold text-slate-600">
                Escenario:
              </span>
              <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg">
                {SCENARIOS.map((item) => {
                  const active = item.id === scenarioId;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectScenario(item.id)}
                      className={`px-3 py-1.5 min-h-[36px] text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                        active
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {item.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mode Switcher & Quick Experiment */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => setMode('manual')}
                  className={`px-3 py-1.5 min-h-[36px] text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    mode === 'manual'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Editar conteos
                </button>
                <button
                  type="button"
                  onClick={() => setMode('threshold')}
                  className={`px-3 py-1.5 min-h-[36px] text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    mode === 'threshold'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Probar umbral
                </button>
              </div>

              <button
                type="button"
                onClick={handleApplyImbalanceTrap}
                className="px-3 py-1.5 min-h-[36px] text-xs font-semibold text-amber-900 bg-amber-50 border border-amber-300 rounded-lg hover:bg-amber-100 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                Ver trampa de exactitud
              </button>
            </div>
          </div>

          {/* Two-Zone Split: Interactive Matrix Stage (Left 7 cols) + Dark Executive Guide Deck (Right 5 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-7">
              <MatrixStage
                scenario={scenario}
                counts={activeCounts}
                metrics={metrics}
                mode={mode}
                threshold={threshold}
                selectedCell={selectedCell}
                highlightedCells={
                  isWalkthroughActive
                    ? currentStep.highlightCells
                    : ['vp', 'fn', 'fp', 'vn']
                }
                dimUnselected={
                  isWalkthroughActive ? currentStep.dimUnselected : false
                }
                activeMetricHover={effectiveMetricHighlight}
                focusAxis={
                  isWalkthroughActive ? currentStep.focusAxis : 'none'
                }
                onSelectCell={setSelectedCell}
                onUpdateCount={handleUpdateCount}
                onChangeThreshold={setThreshold}
              />
            </div>

            <div className="lg:col-span-5">
              <GuidedWalkthrough
                steps={GUIDE_STEPS}
                currentStepIndex={currentStepIndex}
                isPlaying={isPlaying}
                isWalkthroughActive={isWalkthroughActive}
                scenario={scenario}
                onSelectStep={(idx) => {
                  setIsPlaying(false);
                  setIsWalkthroughActive(true);
                  setCurrentStepIndex(idx);
                }}
                onTogglePlay={() => {
                  setIsWalkthroughActive(true);
                  setIsPlaying((prev) => !prev);
                }}
                onReset={handleResetAll}
                onToggleActive={() => setIsWalkthroughActive((prev) => !prev)}
              />
            </div>
          </div>
        </section>

        {/* Section 3: Live Metrics & Natural-Language Interpretation */}
        <MetricsInterpreter
          scenario={scenario}
          counts={activeCounts}
          metrics={metrics}
          activeMetric={effectiveMetricHighlight}
          onHoverMetric={setHoveredMetric}
          onToggleMetricLock={handleToggleMetricLock}
          lockedMetric={lockedMetric}
        />

        {/* Section 4: Practice Quiz */}
        <PracticeQuiz />
      </main>

      <footer className="mt-16 border-t border-slate-800 bg-slate-950 text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-wrap items-center justify-between gap-4 text-xs">
          <span className="text-slate-300 font-medium">
            Laboratorio interactivo de Matriz de Confusión
          </span>
          <div className="flex items-center gap-4">
            <a href="#introduccion" className="hover:text-white transition-colors">
              Introducción
            </a>
            <span aria-hidden="true">·</span>
            <a href="#simulador" className="hover:text-white transition-colors">
              Simulador
            </a>
            <span aria-hidden="true">·</span>
            <a href="#metricas" className="hover:text-white transition-colors">
              Métricas
            </a>
            <span aria-hidden="true">·</span>
            <a href="#practica" className="hover:text-white transition-colors">
              Práctica
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
