import React, { useState } from 'react';
import { CheckCircle2, RotateCcw, XCircle } from 'lucide-react';
import { QUIZ_QUESTIONS } from '../data/scenarios';

export const PracticeQuiz: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});

  const question = QUIZ_QUESTIONS[currentIndex];
  const selectedOptionId = selectedAnswers[question.id];
  const isAnswered = Boolean(selectedOptionId);
  const isCorrect = selectedOptionId === question.correctOptionId;

  const totalAnswered = Object.keys(selectedAnswers).length;
  const totalCorrect = QUIZ_QUESTIONS.filter(
    (q) => selectedAnswers[q.id] === q.correctOptionId
  ).length;

  const handleSelectOption = (optionId: string) => {
    if (isAnswered) return;
    setSelectedAnswers((prev) => ({ ...prev, [question.id]: optionId }));
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setCurrentIndex(0);
  };

  return (
    <section id="practica" className="scroll-mt-24">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-slate-900">
            Pon a prueba lo aprendido
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-1 max-w-2xl">
            Practica leyendo matrices reales e interpretando métricas antes de aplicarlas en tus propios modelos.
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm text-slate-600">
          <span className="font-mono tabular-nums">
            Aciertos: <strong className="text-slate-900">{totalCorrect}</strong> / {QUIZ_QUESTIONS.length}
          </span>
          {totalAnswered > 0 && (
            <button
              type="button"
              onClick={handleResetQuiz}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-800 hover:text-sky-950 underline underline-offset-4 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reiniciar práctica</span>
            </button>
          )}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-8">
        {/* Question selector tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 mb-6 border-b border-slate-200">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
            {QUIZ_QUESTIONS.map((q, idx) => {
              const answered = selectedAnswers[q.id];
              const correct = answered === q.correctOptionId;
              const active = idx === currentIndex;

              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-white text-slate-900 shadow-sm'
                      : answered
                      ? correct
                        ? 'text-emerald-800 hover:bg-emerald-100/60'
                        : 'text-rose-800 hover:bg-rose-100/60'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Caso {idx + 1}
                </button>
              );
            })}
          </div>
          <span className="text-xs text-slate-500">
            {question.scenarioTitle}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Mini Reference Matrix */}
          <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5">
            <h3 className="text-xs font-semibold text-slate-500 mb-3">
              Matriz de referencia del caso
            </h3>
            <div className="grid grid-cols-[95px_1fr_1fr] gap-2 text-center text-xs">
              <div />
              <div className="py-1.5 px-2 font-semibold text-slate-700 bg-white border border-slate-200 rounded">
                Predijo {question.positiveName}
              </div>
              <div className="py-1.5 px-2 font-semibold text-slate-700 bg-white border border-slate-200 rounded">
                Predijo {question.negativeName}
              </div>

              <div className="flex items-center justify-end pr-2 font-semibold text-slate-700 text-right">
                Real: {question.positiveName}
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <div className="text-[11px] text-emerald-800 font-medium">VP</div>
                <div className="font-mono text-xl font-bold text-slate-900 tabular-nums">
                  {question.matrix.vp}
                </div>
              </div>
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
                <div className="text-[11px] text-rose-800 font-medium">FN</div>
                <div className="font-mono text-xl font-bold text-slate-900 tabular-nums">
                  {question.matrix.fn}
                </div>
              </div>

              <div className="flex items-center justify-end pr-2 font-semibold text-slate-700 text-right">
                Real: {question.negativeName}
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="text-[11px] text-amber-800 font-medium">FP</div>
                <div className="font-mono text-xl font-bold text-slate-900 tabular-nums">
                  {question.matrix.fp}
                </div>
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <div className="text-[11px] text-emerald-800 font-medium">VN</div>
                <div className="font-mono text-xl font-bold text-slate-900 tabular-nums">
                  {question.matrix.vn}
                </div>
              </div>
            </div>
          </div>

          {/* Question & Options */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="font-display text-lg sm:text-xl font-semibold text-slate-900 leading-snug">
              {question.question}
            </h3>

            <div className="space-y-2.5">
              {question.options.map((opt) => {
                const chosen = selectedOptionId === opt.id;
                const isRightOption = opt.id === question.correctOptionId;

                let style =
                  'bg-white border-slate-200 hover:border-sky-400 hover:bg-sky-50/40 text-slate-800';
                if (isAnswered) {
                  if (isRightOption) {
                    style = 'bg-emerald-50 border-emerald-600 text-emerald-950';
                  } else if (chosen && !isRightOption) {
                    style = 'bg-rose-50 border-rose-500 text-rose-950';
                  } else {
                    style = 'bg-slate-50 border-slate-200 text-slate-500 opacity-70';
                  }
                }

                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={isAnswered}
                    onClick={() => handleSelectOption(opt.id)}
                    className={`w-full text-left px-4 py-3 min-h-[44px] rounded-xl border text-sm font-medium transition-colors flex items-center justify-between gap-3 cursor-pointer disabled:cursor-default ${style}`}
                  >
                    <span>{opt.label}</span>
                    {isAnswered && isRightOption && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    )}
                    {isAnswered && chosen && !isRightOption && (
                      <XCircle className="w-4 h-4 text-rose-700 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {isAnswered && (
              <div
                className={`p-4 rounded-xl border ${
                  isCorrect
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                    : 'bg-amber-50/70 border-amber-200 text-amber-950'
                }`}
              >
                <p className="text-xs font-semibold mb-1">
                  {isCorrect ? 'Respuesta correcta' : 'Revisa la explicación'}
                </p>
                <p className="text-sm leading-relaxed">{question.explanation}</p>
                {currentIndex < QUIZ_QUESTIONS.length - 1 && (
                  <button
                    type="button"
                    onClick={() => setCurrentIndex((prev) => prev + 1)}
                    className="mt-3 px-4 py-2 min-h-[40px] rounded-lg bg-sky-700 text-white text-xs font-semibold hover:bg-sky-800 transition-colors cursor-pointer"
                  >
                    Siguiente caso
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
