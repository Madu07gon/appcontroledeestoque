import React, { useState, useEffect } from 'react';
import {
  Warehouse,
  Truck,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Wrench,
  ArrowDownToLine,
  ArrowUpFromLine,
  ThermometerSnowflake,
  Zap,
  Weight,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Dock, DockStatus, QueueItem } from '../types';

interface DockGridProps {
  docks: Dock[];
  queue: QueueItem[];
  onSelectDock: (dock: Dock) => void;
  onQuickAssignFromQueue?: (dock: Dock, queueItem: QueueItem) => void;
}

export const DockGrid: React.FC<DockGridProps> = ({
  docks,
  queue,
  onSelectDock,
}) => {
  const [filter, setFilter] = useState<'todos' | 'livres' | 'ocupadas' | 'manutencao'>('todos');
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  // Update clock every 10 seconds for real-time elapsed minutes
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 10000);
    return () => clearInterval(timer);
  }, []);

  const filteredDocks = docks.filter((dock) => {
    if (filter === 'livres') return dock.status === 'livre';
    if (filter === 'ocupadas') return dock.status !== 'livre' && dock.status !== 'manutencao';
    if (filter === 'manutencao') return dock.status === 'manutencao';
    return true;
  });

  const getStatusStyle = (status: DockStatus) => {
    switch (status) {
      case 'livre':
        return {
          badgeBg: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60',
          border: 'border-emerald-500/30 hover:border-emerald-500/70',
          indicator: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]',
          label: 'LIVRE',
          headerBg: 'bg-emerald-950/40',
        };
      case 'em_carregamento':
        return {
          badgeBg: 'bg-cyan-950/80 text-cyan-300 border-cyan-700/60',
          border: 'border-cyan-500/40 hover:border-cyan-400',
          indicator: 'bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]',
          label: 'CARREGAMENTO',
          headerBg: 'bg-cyan-950/40',
        };
      case 'em_descarregamento':
        return {
          badgeBg: 'bg-purple-950/80 text-purple-300 border-purple-700/60',
          border: 'border-purple-500/40 hover:border-purple-400',
          indicator: 'bg-purple-400 animate-pulse shadow-[0_0_8px_rgba(192,132,252,0.8)]',
          label: 'DESCARREGAMENTO',
          headerBg: 'bg-purple-950/40',
        };
      case 'ocupada':
        return {
          badgeBg: 'bg-amber-950/80 text-amber-300 border-amber-700/60',
          border: 'border-amber-500/40 hover:border-amber-400',
          indicator: 'bg-amber-400',
          label: 'OCUPADA',
          headerBg: 'bg-amber-950/40',
        };
      case 'manutencao':
        return {
          badgeBg: 'bg-rose-950/80 text-rose-300 border-rose-700/60',
          border: 'border-rose-500/40 hover:border-rose-400',
          indicator: 'bg-rose-500',
          label: 'MANUTENÇÃO',
          headerBg: 'bg-rose-950/40',
        };
    }
  };

  const getTypeIcon = (type: Dock['type']) => {
    switch (type) {
      case 'refrigerada':
        return <ThermometerSnowflake className="w-3.5 h-3.5 text-cyan-300" title="Doca Refrigerada" />;
      case 'expresso':
        return <Zap className="w-3.5 h-3.5 text-amber-300" title="Doca Expressa" />;
      case 'pesada':
        return <Weight className="w-3.5 h-3.5 text-orange-300" title="Cargas Pesadas (até 60T)" />;
      default:
        return <Layers className="w-3.5 h-3.5 text-slate-400" title="Doca Geral" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Top filter toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900/90 p-3.5 rounded-xl border border-slate-800">
        <div className="flex items-center space-x-2">
          <Warehouse className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-bold text-slate-100 tracking-tight">
            Mapa Operacional das 14 Docas
          </h2>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            {docks.filter((d) => d.status !== 'livre' && d.status !== 'manutencao').length}/14 em operação
          </span>
        </div>

        {/* Status filters */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto">
          <button
            id="filter-docks-all"
            onClick={() => setFilter('todos')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
              filter === 'todos'
                ? 'bg-cyan-600 text-white shadow'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Todas (14)
          </button>
          <button
            id="filter-docks-free"
            onClick={() => setFilter('livres')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
              filter === 'livres'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Livres ({docks.filter((d) => d.status === 'livre').length})
          </button>
          <button
            id="filter-docks-active"
            onClick={() => setFilter('ocupadas')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
              filter === 'ocupadas'
                ? 'bg-purple-600 text-white shadow'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Ocupadas ({docks.filter((d) => d.status !== 'livre' && d.status !== 'manutencao').length})
          </button>
          <button
            id="filter-docks-maint"
            onClick={() => setFilter('manutencao')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
              filter === 'manutencao'
                ? 'bg-rose-600 text-white shadow'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Manutenção ({docks.filter((d) => d.status === 'manutencao').length})
          </button>
        </div>
      </div>

      {/* Grid of the 14 Docks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        {filteredDocks.map((dock) => {
          const style = getStatusStyle(dock.status);
          const op = dock.currentOperation;

          // Calculate elapsed time and progress
          let elapsedMinutes = 0;
          let progressPercent = 0;
          let isDelayed = false;

          if (op) {
            const start = new Date(op.startedAt).getTime();
            elapsedMinutes = Math.max(1, Math.round((currentTime - start) / 60000));
            progressPercent = Math.min(100, Math.round((elapsedMinutes / op.estimatedDurationMinutes) * 100));
            isDelayed = elapsedMinutes > op.estimatedDurationMinutes;
          }

          // Idle warning: dock is free, queue has vehicles, and dock free for > 20 min
          const dockFreeMinutes = Math.round(
            (currentTime - new Date(dock.lastStatusChange).getTime()) / 60000,
          );
          const showIdleAlert = dock.status === 'livre' && queue.length > 0 && dockFreeMinutes > 15;

          return (
            <div
              id={`dock-card-${dock.id}`}
              key={dock.id}
              onClick={() => onSelectDock(dock)}
              className={`group relative bg-slate-900 rounded-xl border p-3 flex flex-col justify-between transition-all duration-200 cursor-pointer shadow hover:shadow-lg hover:-translate-y-0.5 ${style.border}`}
            >
              {/* Card Header: Dock number and live indicator */}
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center space-x-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${style.indicator}`} />
                    <span className="text-base font-extrabold text-white tracking-tight">
                      {dock.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {getTypeIcon(dock.type)}
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase ${style.badgeBg}`}>
                      {style.label}
                    </span>
                  </div>
                </div>

                {/* Sub-header specs */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1.5">
                  <span className="capitalize">{dock.type}</span>
                  <span>Cap: {dock.maxWeightTons}t</span>
                </div>

                {/* Operation Content or Idle State */}
                <div className="mt-3 min-h-[95px] flex flex-col justify-center">
                  {dock.status === 'livre' ? (
                    <div className="text-center py-2">
                      <CheckCircle2 className="w-7 h-7 text-emerald-500/60 mx-auto mb-1" />
                      <p className="text-xs font-semibold text-emerald-400">Pronta para Uso</p>
                      <p className="text-[11px] text-slate-400">
                        Ociosa há {dockFreeMinutes} min
                      </p>
                      {showIdleAlert && (
                        <div className="mt-1.5 flex items-center justify-center space-x-1 text-[10px] font-bold text-amber-400 bg-amber-950/60 py-0.5 px-1 rounded border border-amber-800/80 animate-pulse">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Fila aguardando</span>
                        </div>
                      )}
                    </div>
                  ) : dock.status === 'manutencao' ? (
                    <div className="text-center py-2">
                      <Wrench className="w-7 h-7 text-rose-500/70 mx-auto mb-1 animate-spin-slow" />
                      <p className="text-xs font-semibold text-rose-300">Interditada</p>
                      <p className="text-[11px] text-slate-400 truncate px-1" title={dock.equipmentAlert}>
                        {dock.equipmentAlert || 'Manutenção'}
                      </p>
                    </div>
                  ) : op ? (
                    <div className="space-y-1.5">
                      {/* Vehicle plate badge */}
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700 tracking-wider">
                          {op.plate}
                        </span>
                        <div className="flex items-center space-x-1 text-[11px]">
                          {op.operationType === 'carregamento' ? (
                            <ArrowUpFromLine className="w-3.5 h-3.5 text-cyan-400" />
                          ) : (
                            <ArrowDownToLine className="w-3.5 h-3.5 text-purple-400" />
                          )}
                          <span className="capitalize text-slate-300 text-[10px] font-medium">
                            {op.cargoType}
                          </span>
                        </div>
                      </div>

                      {/* Driver info */}
                      <div className="text-[11px] text-slate-400 truncate font-medium">
                        Mot: <span className="text-slate-200">{op.driverName}</span>
                      </div>

                      {/* Time & Progress Bar */}
                      <div className="space-y-1 pt-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="flex items-center text-slate-400 space-x-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>
                              {elapsedMinutes}m / {op.estimatedDurationMinutes}m
                            </span>
                          </span>
                          {isDelayed ? (
                            <span className="text-[10px] font-bold text-rose-400 flex items-center space-x-0.5">
                              <AlertTriangle className="w-3 h-3 text-rose-400 animate-bounce" />
                              <span>+ {elapsedMinutes - op.estimatedDurationMinutes}m</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium text-cyan-400">
                              {progressPercent}%
                            </span>
                          )}
                        </div>

                        {/* Visual progress bar */}
                        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              isDelayed ? 'bg-rose-500' : 'bg-cyan-500'
                            }`}
                            style={{ width: `${Math.min(100, progressPercent)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Card Footer: Quick action prompt */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 group-hover:text-cyan-400 transition">
                <span>{dock.totalOperationsToday} ops hoje</span>
                <span className="font-semibold text-xs text-slate-300 group-hover:text-cyan-300 flex items-center space-x-0.5">
                  <span>Detalhes</span>
                  <span>&rarr;</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
