import React, { useState } from 'react';
import {
  X,
  Warehouse,
  Truck,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Wrench,
  ArrowDownToLine,
  ArrowUpFromLine,
  User,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Dock, QueueItem, OperationType, CargoType, CurrentUser } from '../types';

interface DockDetailModalProps {
  dock: Dock | null;
  queue: QueueItem[];
  currentUser: CurrentUser;
  onClose: () => void;
  onReleaseDock: (dockId: string, notes?: string) => Promise<void>;
  onAssignDock: (params: {
    dockId: string;
    plate: string;
    driverName: string;
    operationType: OperationType;
    cargoType: CargoType;
    estimatedDurationMinutes: number;
    notes?: string;
    operatorName: string;
  }) => Promise<void>;
  onMaintenance: (dockId: string, reason: string, active: boolean) => Promise<void>;
}

export const DockDetailModal: React.FC<DockDetailModalProps> = ({
  dock,
  queue,
  currentUser,
  onClose,
  onReleaseDock,
  onAssignDock,
  onMaintenance,
}) => {
  if (!dock) return null;

  const [activeTab, setActiveTab] = useState<'info' | 'alocar' | 'manutencao'>('info');
  const [releaseNotes, setReleaseNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Manual assign form state
  const [formPlate, setFormPlate] = useState('');
  const [formDriver, setFormDriver] = useState('');
  const [formOp, setFormOp] = useState<OperationType>('descarregamento');
  const [formCargo, setFormCargo] = useState<CargoType>('paletizada');
  const [formDuration, setFormDuration] = useState('45');
  const [formNotes, setFormNotes] = useState('');

  // Maintenance reason
  const [maintReason, setMaintReason] = useState('Manutenção preventiva de rotina');

  const op = dock.currentOperation;

  // Calculate elapsed time
  let elapsedMinutes = 0;
  let isDelayed = false;
  if (op) {
    elapsedMinutes = Math.max(1, Math.round((Date.now() - new Date(op.startedAt).getTime()) / 60000));
    isDelayed = elapsedMinutes > op.estimatedDurationMinutes;
  }

  const handleRelease = async () => {
    setIsSubmitting(true);
    try {
      await onReleaseDock(dock.id, releaseNotes);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPlate || !formDriver) return;
    setIsSubmitting(true);
    try {
      await onAssignDock({
        dockId: dock.id,
        plate: formPlate,
        driverName: formDriver,
        operationType: formOp,
        cargoType: formCargo,
        estimatedDurationMinutes: Number(formDuration) || 45,
        notes: formNotes,
        operatorName: `${currentUser.name} (${currentUser.role})`,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignFromQueue = async (qItem: QueueItem) => {
    setIsSubmitting(true);
    try {
      await onAssignDock({
        dockId: dock.id,
        plate: qItem.vehiclePlate,
        driverName: qItem.driverName,
        operationType: qItem.operationType,
        cargoType: qItem.cargoType,
        estimatedDurationMinutes: qItem.operationType === 'carregamento' ? 45 : 35,
        notes: `Alocado da fila de espera do pátio`,
        operatorName: `${currentUser.name} (${currentUser.role})`,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleMaintenance = async (active: boolean) => {
    setIsSubmitting(true);
    try {
      await onMaintenance(dock.id, maintReason, active);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-700/60 flex items-center justify-center text-cyan-400">
              <Warehouse className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-extrabold text-white tracking-tight">
                  {dock.name}
                </h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded uppercase bg-slate-800 text-slate-300 border border-slate-700">
                  {dock.type}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Capacidade: {dock.maxWeightTons}t {dock.hasHydraulicRamp ? '• Rampa Hidráulica Ativa' : ''}
              </p>
            </div>
          </div>
          <button
            id="btn-close-dock-modal"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status bar */}
        <div className="px-6 py-2.5 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Status Operacional:</span>
            <span
              className={`font-bold px-2 py-0.5 rounded uppercase ${
                dock.status === 'livre'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : dock.status === 'manutencao'
                  ? 'bg-rose-950 text-rose-300 border border-rose-800'
                  : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
              }`}
            >
              {dock.status.replace('_', ' ')}
            </span>
          </div>
          <span className="text-slate-400">
            {dock.totalOperationsToday} operações realizadas hoje
          </span>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Active Operation Details */}
          {op ? (
            <div className="space-y-4">
              <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Veículo em Atendimento
                  </span>
                  <span className="font-mono text-sm font-extrabold px-3 py-1 rounded bg-slate-900 text-cyan-300 border border-cyan-700/60 tracking-wider">
                    {op.plate}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                  <div>
                    <span className="text-slate-400">Motorista:</span>
                    <p className="text-slate-200 font-semibold">{op.driverName}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Operação:</span>
                    <p className="text-slate-200 font-semibold capitalize flex items-center space-x-1">
                      {op.operationType === 'carregamento' ? (
                        <ArrowUpFromLine className="w-3.5 h-3.5 text-cyan-400 inline" />
                      ) : (
                        <ArrowDownToLine className="w-3.5 h-3.5 text-purple-400 inline" />
                      )}
                      <span>{op.operationType}</span>
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">Tipo de Carga:</span>
                    <p className="text-slate-200 font-semibold capitalize">{op.cargoType}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Início da Operação:</span>
                    <p className="text-slate-200 font-mono">
                      {new Date(op.startedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                {op.notes && (
                  <div className="text-xs bg-slate-900/80 p-2.5 rounded border border-slate-700 text-slate-300">
                    <strong className="text-slate-400 block mb-0.5">Observações:</strong>
                    {op.notes}
                  </div>
                )}

                {/* Live timer & delay badge */}
                <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1.5 text-slate-300">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    <span>Tempo em Doca: <strong>{elapsedMinutes} min</strong></span>
                    <span className="text-slate-500">/ {op.estimatedDurationMinutes} min previstos</span>
                  </div>

                  {isDelayed && (
                    <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 text-xs font-bold flex items-center space-x-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                      <span>Atraso: +{elapsedMinutes - op.estimatedDurationMinutes} min</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Complete & Release Action Box */}
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Finalizar Atendimento na Doca
                </h4>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Anotação de Saída / Checklist (Opcional):
                  </label>
                  <input
                    type="text"
                    value={releaseNotes}
                    onChange={(e) => setReleaseNotes(e.target.value)}
                    placeholder="Ex: Carga conferida e liberada sem avarias"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <button
                  id="btn-confirm-release-dock"
                  onClick={handleRelease}
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-500 shadow-md transition flex items-center justify-center space-x-2 active:scale-98"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Concluir Operação & Liberar Doca</span>
                </button>
              </div>
            </div>
          ) : dock.status === 'manutencao' ? (
            <div className="space-y-4">
              <div className="bg-rose-950/40 border border-rose-800/80 p-4 rounded-xl text-center space-y-2">
                <Wrench className="w-8 h-8 text-rose-400 mx-auto" />
                <h4 className="text-sm font-bold text-rose-200">Doca em Manutenção</h4>
                <p className="text-xs text-rose-300">{dock.equipmentAlert || 'Interditada para reparos prediais/mecânicos'}</p>
              </div>

              <button
                id="btn-finish-maintenance"
                onClick={() => handleToggleMaintenance(false)}
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-500 shadow transition flex items-center justify-center space-x-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Finalizar Manutenção e Reativar Doca</span>
              </button>
            </div>
          ) : (
            /* Free Dock Actions: Assign from Queue or Manual Entry */
            <div className="space-y-4">
              <div className="flex border-b border-slate-800 pb-2 space-x-2">
                <button
                  onClick={() => setActiveTab('info')}
                  className={`px-3 py-1 rounded text-xs font-semibold ${
                    activeTab === 'info'
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Fila do Pátio ({queue.length})
                </button>
                <button
                  onClick={() => setActiveTab('alocar')}
                  className={`px-3 py-1 rounded text-xs font-semibold ${
                    activeTab === 'alocar'
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Alocação Manual
                </button>
                <button
                  onClick={() => setActiveTab('manutencao')}
                  className={`px-3 py-1 rounded text-xs font-semibold ${
                    activeTab === 'manutencao'
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Interditar Doca
                </button>
              </div>

              {activeTab === 'info' && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-400">
                    Selecione um veículo aguardando no pátio para alocar imediatamente nesta doca:
                  </p>

                  {queue.length === 0 ? (
                    <div className="p-6 text-center border border-dashed border-slate-800 rounded-xl">
                      <Truck className="w-7 h-7 text-slate-600 mx-auto mb-1" />
                      <p className="text-xs text-slate-400">Nenhum veículo aguardando na fila.</p>
                      <button
                        onClick={() => setActiveTab('alocar')}
                        className="mt-2 text-xs font-semibold text-cyan-400 hover:underline"
                      >
                        Alocar veículo avulso &rarr;
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {queue.map((q) => (
                        <div
                          key={q.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-slate-800/80 border border-slate-700 hover:border-cyan-500/50 transition"
                        >
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-mono text-xs font-extrabold text-cyan-300 px-1.5 py-0.5 bg-slate-900 rounded">
                                {q.vehiclePlate}
                              </span>
                              <span className="text-xs text-slate-300 font-medium">
                                {q.driverName}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5 capitalize">
                              {q.operationType} • {q.cargoType} • {q.vehicleModel}
                            </p>
                          </div>
                          <button
                            onClick={() => handleAssignFromQueue(q)}
                            disabled={isSubmitting}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 shadow"
                          >
                            Alocar Aqui
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'alocar' && (
                <form onSubmit={handleAssignManual} className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">Placa do Veículo *</label>
                      <input
                        type="text"
                        required
                        value={formPlate}
                        onChange={(e) => setFormPlate(e.target.value.toUpperCase())}
                        placeholder="Ex: ABC1D23"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Nome do Motorista *</label>
                      <input
                        type="text"
                        required
                        value={formDriver}
                        onChange={(e) => setFormDriver(e.target.value)}
                        placeholder="Nome completo"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-slate-400 mb-1">Operação</label>
                      <select
                        value={formOp}
                        onChange={(e) => setFormOp(e.target.value as OperationType)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-2 text-white"
                      >
                        <option value="descarregamento">Descarregamento</option>
                        <option value="carregamento">Carregamento</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Tipo de Carga</label>
                      <select
                        value={formCargo}
                        onChange={(e) => setFormCargo(e.target.value as CargoType)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-2 text-white"
                      >
                        <option value="paletizada">Paletizada</option>
                        <option value="seca">Seca</option>
                        <option value="refrigerada">Refrigerada</option>
                        <option value="fracionada">Fracionada</option>
                        <option value="perigosa">Perigosa</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Tempo Estimado (min)</label>
                      <input
                        type="number"
                        min="10"
                        max="240"
                        value={formDuration}
                        onChange={(e) => setFormDuration(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-2 text-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Instruções / NF-e</label>
                    <input
                      type="text"
                      value={formNotes}
                      onChange={(e) => setFormNotes(e.target.value)}
                      placeholder="Ex: Conferência cega, NF 49120"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-cyan-600 hover:bg-cyan-500 shadow"
                  >
                    Confirmar e Iniciar Operação
                  </button>
                </form>
              )}

              {activeTab === 'manutencao' && (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Motivo da Interdição / Manutenção:</label>
                    <input
                      type="text"
                      value={maintReason}
                      onChange={(e) => setMaintReason(e.target.value)}
                      placeholder="Ex: Calibração da balança ou ajuste na rampa hidráulica"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                  <button
                    onClick={() => handleToggleMaintenance(true)}
                    disabled={isSubmitting}
                    className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-rose-600 hover:bg-rose-500 shadow"
                  >
                    Interditar Doca para Manutenção
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
