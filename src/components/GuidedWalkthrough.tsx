import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  RotateCcw,
} from 'lucide-react';
import { GuideStep, ScenarioConfig } from '../types/confusion';

interface GuidedWalkthroughProps {
  steps: GuideStep[];
  currentStepIndex: number;
  isPlaying: boolean;
  isWalkthroughActive: boolean;
  scenario: ScenarioConfig;
  onSelectStep: (index: number) => void;
  onTogglePlay: () => void;
  onReset: () => void;
  onToggleActive: () => void;
}

export const GuidedWalkthrough: React.FC<GuidedWalkthroughProps> = ({
  steps,
  currentStepIndex,
  isPlaying,
  isWalkthroughActive,
  scenario,
  onSelectStep,
  onTogglePlay,
  onReset,
  onToggleActive,
}) => {
  const step = steps[currentStepIndex];

  return (
    <aside className="bg-slate-900 text-slate-100 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between h-full">
      <div>
        {/* Header & Mode Control */}
        <div className="flex items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-800">
          <div>
            <p className="text-xs text-emerald-400 font-medium">
              Guía interactiva · Paso {currentStepIndex + 1} de {steps.length}
            </p>
            <h3 className="text-lg font-semibold text-white mt-0.5">
              Cómo interpretar la matriz
            </h3>
          </div>
          <button
            type="button"
            onClick={onToggleActive}
            className={`px-3 py-1.5 min-h-[36px] text-xs font-medium rounded-lg border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              isWalkthroughActive
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {isWalkthroughActive ? 'Foco activo' : 'Activar foco'}
          </button>
        </div>

        {/* Stepper Progress Tabs */}
        <div className="grid grid-cols-6 gap-1.5 mb-6" role="tablist" aria-label="Pasos de la guía">
          {steps.map((s, idx) => {
            const active = idx === currentStepIndex;
            const visited = idx < currentStepIndex;
            return (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={active}
                aria-label={`Ir al paso ${idx + 1}: ${s.title}`}
                onClick={() => onSelectStep(idx)}
                className={`h-9 rounded-lg font-mono text-xs font-semibold transition-colors cursor-pointer ${
                  active
                    ? 'bg-emerald-400 text-slate-950'
                    : visited
                    ? 'bg-slate-800 text-emerald-300 border border-emerald-500/30 hover:bg-slate-700'
                    : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium text-sky-300 mb-1 tracking-wide">
              {step.subtitle}
            </p>
            <h4 className="font-display text-xl font-semibold text-white leading-snug">
              {step.title}
            </h4>
          </div>

          <p className="text-[15px] text-slate-200 leading-relaxed tracking-[0.01em]">
            {step.explanation}
          </p>

          {/* Key Takeaway Box */}
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
            <p className="text-xs font-semibold text-emerald-300 mb-1">
              Idea clave para recordar
            </p>
            <p className="text-sm text-slate-200 leading-relaxed">
              {step.keyTakeaway}
            </p>
          </div>

          {/* Contextual Scenario Note on Step 3 */}
          {step.id === 3 && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-400/30">
              <p className="text-xs font-semibold text-amber-300 mb-1">
                En el escenario «{scenario.name}»
              </p>
              <p className="text-sm text-amber-100 leading-relaxed">
                {scenario.criticalErrorSummary}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Playback Controls */}
      <div className="pt-5 mt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onSelectStep(Math.max(0, currentStepIndex - 1))}
            disabled={currentStepIndex === 0}
            className="inline-flex items-center gap-1 px-3 py-2 min-h-[40px] rounded-lg border border-slate-700 bg-slate-800 text-sm font-medium text-slate-200 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Anterior</span>
          </button>
          <button
            type="button"
            onClick={() => onSelectStep(Math.min(steps.length - 1, currentStepIndex + 1))}
            disabled={currentStepIndex === steps.length - 1}
            className="inline-flex items-center gap-1 px-3.5 py-2 min-h-[40px] rounded-lg bg-emerald-400 text-sm font-semibold text-slate-950 hover:bg-emerald-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <span>Siguiente</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onTogglePlay}
            aria-label={isPlaying ? 'Pausar guía automática' : 'Reproducir guía automática'}
            className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-lg border border-slate-700 bg-slate-800 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Pausar' : 'Auto'}</span>
          </button>
          <button
            type="button"
            onClick={onReset}
            aria-label="Reiniciar guía y valores"
            className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-lg border border-slate-700 bg-slate-800 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reiniciar</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
