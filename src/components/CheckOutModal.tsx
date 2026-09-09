import React, { useState } from 'react';
import { X, LogOut, Truck, Clock, CheckCircle2 } from 'lucide-react';
import { MovementRecord, Dock } from '../types';

interface CheckOutModalProps {
  movements: MovementRecord[];
  docks: Dock[];
  onClose: () => void;
  onConfirmCheckOut: (plate: string) => Promise<void>;
}

export const CheckOutModal: React.FC<CheckOutModalProps> = ({
  movements,
  docks,
  onClose,
  onConfirmCheckOut,
}) => {
  const [plate, setPlate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active movements (in yard or operating in dock)
  const activeMovements = movements.filter(
    (m) => m.status === 'operando_doca' || m.status === 'fila_espera',
  );

  const handleSubmit = async (selectedPlate: string) => {
    if (!selectedPlate) return;
    setIsSubmitting(true);
    try {
      await onConfirmCheckOut(selectedPlate);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-800/80 flex items-center justify-center text-amber-400">
              <LogOut className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white tracking-tight">
                Portaria: Saída de Veículo (Check-out)
              </h3>
              <p className="text-xs text-slate-400">
                Registra a saída definitiva do pátio e encerra o ciclo de permanência
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Quick manual plate form */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Digitar Placa do Veículo:
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={plate}
                onChange={(e) => setPlate(e.target.value.toUpperCase())}
                placeholder="Ex: BRA2E19"
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono uppercase text-sm tracking-wider focus:outline-none focus:border-cyan-500"
              />
              <button
                id="btn-confirm-checkout-plate"
                onClick={() => handleSubmit(plate)}
                disabled={!plate || isSubmitting}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Dar Saída</span>
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Veículos Atualmente no Depósito ({activeMovements.length})
            </h4>

            {activeMovements.length === 0 ? (
              <div className="p-4 text-center border border-dashed border-slate-800 rounded-xl text-xs text-slate-400">
                Nenhum veículo ativo no pátio ou nas docas neste instante.
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {activeMovements.map((m) => {
                  const dock = docks.find((d) => d.id === m.dockId);
                  const entryTime = new Date(m.gateEntryTime);
                  const elapsedMin = Math.max(1, Math.round((Date.now() - entryTime.getTime()) / 60000));

                  return (
                    <div
                      key={m.id}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 hover:border-amber-500/50 transition text-xs"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-extrabold text-cyan-300 px-1.5 py-0.5 bg-slate-900 rounded">
                            {m.vehiclePlate}
                          </span>
                          <span className="font-semibold text-slate-200">{m.driverName}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {m.status === 'operando_doca'
                            ? `Atendimento na ${dock?.name || 'Doca'}`
                            : 'Fila de espera no pátio'}{' '}
                          • {elapsedMin} min de permanência
                        </p>
                      </div>

                      <button
                        onClick={() => handleSubmit(m.vehiclePlate)}
                        disabled={isSubmitting}
                        className="px-3 py-1.5 rounded bg-slate-700 hover:bg-amber-600 text-slate-200 hover:text-white text-xs font-bold transition flex items-center space-x-1"
                      >
                        <LogOut className="w-3 h-3" />
                        <span>Liberar</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
