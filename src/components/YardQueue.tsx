import React from 'react';
import {
  Truck,
  Clock,
  ArrowDownToLine,
  ArrowUpFromLine,
  AlertTriangle,
  ChevronRight,
  Warehouse,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { QueueItem, Dock } from '../types';

interface YardQueueProps {
  queue: QueueItem[];
  docks: Dock[];
  onAssignToDock: (queueItem: QueueItem) => void;
  onCheckOut: (plate: string) => void;
}

export const YardQueue: React.FC<YardQueueProps> = ({
  queue,
  docks,
  onAssignToDock,
  onCheckOut,
}) => {
  const getPriorityBadge = (priority: QueueItem['priority']) => {
    switch (priority) {
      case 'urgente':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-950 text-rose-300 border border-rose-800 animate-pulse">
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            <span>URGENTE</span>
          </span>
        );
      case 'alta':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
            ALTA
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
            NORMAL
          </span>
        );
    }
  };

  const getWaitMinutes = (arrivalTime: string) => {
    const diff = Date.now() - new Date(arrivalTime).getTime();
    return Math.max(1, Math.round(diff / 60000));
  };

  const freeDocks = docks.filter((d) => d.status === 'livre');

  return (
    <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Truck className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Fila de Espera no Pátio (Triagem)
          </h3>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
            {queue.length} {queue.length === 1 ? 'veículo' : 'veículos'}
          </span>
        </div>

        <div className="text-xs text-slate-400 flex items-center space-x-2">
          <Warehouse className="w-3.5 h-3.5 text-emerald-400" />
          <span>
            <strong className="text-emerald-400">{freeDocks.length}</strong> docas livres no momento
          </span>
        </div>
      </div>

      {queue.length === 0 ? (
        <div className="py-8 text-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-500/50 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-300">Pátio Desafogado</p>
          <p className="text-xs text-slate-400">
            Nenhum veículo aguardando triagem no pátio externo.
          </p>
        </div>
      ) : (
        <div className="mt-3 divide-y divide-slate-800/80">
          {queue.map((item) => {
            const waitTime = getWaitMinutes(item.arrivalTime);
            const recommended = docks.find(
              (d) => d.number === item.recommendedDockNumber && d.status === 'livre',
            );

            return (
              <div
                id={`queue-item-${item.id}`}
                key={item.id}
                className="py-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 hover:bg-slate-800/40 px-2 rounded-lg transition"
              >
                {/* Vehicle identification */}
                <div className="flex items-start space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 border border-slate-700 shrink-0">
                    <Truck className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700 tracking-wider">
                        {item.vehiclePlate}
                      </span>
                      {getPriorityBadge(item.priority)}
                      <span className="text-xs text-slate-300 font-medium">
                        {item.vehicleModel}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
                      <span>Mot: <strong className="text-slate-300">{item.driverName}</strong></span>
                      <span className="flex items-center space-x-1">
                        {item.operationType === 'carregamento' ? (
                          <ArrowUpFromLine className="w-3.5 h-3.5 text-cyan-400" />
                        ) : (
                          <ArrowDownToLine className="w-3.5 h-3.5 text-purple-400" />
                        )}
                        <span className="capitalize">{item.operationType} ({item.cargoType})</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Waiting time & recommendation */}
                <div className="flex items-center space-x-4 w-full md:w-auto justify-between md:justify-end">
                  <div className="text-right">
                    <div className="flex items-center space-x-1 text-xs text-slate-300 justify-end">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span className="font-semibold">{waitTime} min no pátio</span>
                    </div>
                    {item.recommendedDockNumber && (
                      <div className="flex items-center space-x-1 text-[11px] text-cyan-300 font-medium mt-0.5">
                        <Sparkles className="w-3 h-3 text-cyan-400" />
                        <span>Sugerida: Doca {item.recommendedDockNumber.toString().padStart(2, '0')}</span>
                        {recommended && (
                          <span className="text-emerald-400 font-bold">(Livre)</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <button
                      id={`btn-assign-queue-${item.id}`}
                      onClick={() => onAssignToDock(item)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 shadow flex items-center space-x-1 transition active:scale-95"
                    >
                      <span>Alocar em Doca</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      id={`btn-cancel-queue-${item.id}`}
                      onClick={() => onCheckOut(item.vehiclePlate)}
                      className="px-2 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                      title="Registrar saída sem operação"
                    >
                      Liberar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
