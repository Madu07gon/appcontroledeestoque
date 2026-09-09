import React, { useState } from 'react';
import {
  Lightbulb,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  Warehouse,
  ShieldCheck,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { Recommendation, Dock, QueueItem } from '../types';

interface RecommendationsPanelProps {
  recommendations: Recommendation[];
  docks: Dock[];
  queue: QueueItem[];
  onApplyAction?: (rec: Recommendation) => void;
}

export const RecommendationsPanel: React.FC<RecommendationsPanelProps> = ({
  recommendations,
  docks,
  queue,
  onApplyAction,
}) => {
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [aiProvider, setAiProvider] = useState<'gemini' | 'heuristic' | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  const fetchAiDiagnostics = async () => {
    setIsLoadingAi(true);
    try {
      const res = await fetch('/api/ai-diagnostics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data && data.analysis) {
        setAiAnalysis(data.analysis);
        setAiProvider(data.provider);
      }
    } catch (err) {
      console.error('Error fetching AI diagnostics:', err);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const getSeverityStyle = (severity: Recommendation['severity']) => {
    switch (severity) {
      case 'alta':
        return {
          badge: 'bg-rose-950 text-rose-300 border-rose-800',
          border: 'border-rose-500/40',
          icon: <AlertTriangle className="w-4 h-4 text-rose-400" />,
        };
      case 'media':
        return {
          badge: 'bg-amber-950 text-amber-300 border-amber-800',
          border: 'border-amber-500/40',
          icon: <Clock className="w-4 h-4 text-amber-400" />,
        };
      default:
        return {
          badge: 'bg-cyan-950 text-cyan-300 border-cyan-800',
          border: 'border-cyan-500/40',
          icon: <Lightbulb className="w-4 h-4 text-cyan-400" />,
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top AI Strategic Analysis Trigger */}
      <div className="bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 rounded-2xl border border-cyan-500/30 p-6 shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
              <h3 className="text-base font-extrabold text-white tracking-tight">
                Assistente de Otimização Logística & IA
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-900/60 text-cyan-300 border border-cyan-700">
                Gemini 2.5 Flash / Algoritmo Preditivo
              </span>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl">
              Gera diagnóstico imediato cruzando ocupação das 14 docas, tamanho da fila no pátio, desvio de tempo padrão e janelas de tráfego.
            </p>
          </div>

          <button
            id="btn-run-ai-diagnostics"
            onClick={fetchAiDiagnostics}
            disabled={isLoadingAi}
            className="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 shadow-md transition flex items-center space-x-2 shrink-0 active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingAi ? 'animate-spin' : ''}`} />
            <span>{isLoadingAi ? 'Analisando Operação...' : 'Gerar Diagnóstico Estratégico'}</span>
          </button>
        </div>

        {/* AI Output Card if generated */}
        {aiAnalysis && (
          <div className="mt-5 p-4 rounded-xl bg-slate-950/80 border border-cyan-500/40 text-xs text-slate-200 space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-bold text-cyan-300 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Parecer Técnico do Especialista ({aiProvider === 'gemini' ? 'Gemini AI' : 'Motor Heurístico WMS'})</span>
              </span>
              <span className="text-[10px] text-slate-400">
                Atualizado em tempo real
              </span>
            </div>
            <div className="whitespace-pre-line leading-relaxed text-slate-300 font-sans">
              {aiAnalysis}
            </div>
          </div>
        )}
      </div>

      {/* Grid of Automatic Best Practice Recommendations */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Lightbulb className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Recomendações Automáticas Ativas ({recommendations.length})
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Baseado em normas operacionais e boas práticas de armazenagem
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec) => {
            const style = getSeverityStyle(rec.severity);
            return (
              <div
                key={rec.id}
                className={`bg-slate-900/90 rounded-2xl border p-5 shadow-sm flex flex-col justify-between space-y-4 hover:border-cyan-500/50 transition ${style.border}`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {style.icon}
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border uppercase ${style.badge}`}>
                        Prioridade {rec.severity}
                      </span>
                    </div>
                    {rec.targetDockNumber && (
                      <span className="text-xs font-mono font-bold text-cyan-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                        Doca {rec.targetDockNumber.toString().padStart(2, '0')}
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-white tracking-tight">
                    {rec.title}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {rec.description}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-800/80 text-xs">
                  <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                    <strong className="text-cyan-400 block mb-1">Ação Recomendada:</strong>
                    <span className="text-slate-200">{rec.suggestedAction}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center space-x-1">
                      <Zap className="w-3 h-3 text-emerald-400" />
                      <span>Impacto: <strong className="text-emerald-400">{rec.impact}</strong></span>
                    </span>
                    {onApplyAction && (
                      <button
                        onClick={() => onApplyAction(rec)}
                        className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
                      >
                        <span>Aplicar &rarr;</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
