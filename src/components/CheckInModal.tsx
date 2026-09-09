import React, { useState } from 'react';
import {
  X,
  Truck,
  PlusCircle,
  Warehouse,
  AlertTriangle,
  Clock,
  Shield,
  FileCheck,
} from 'lucide-react';
import { Dock, CargoType, OperationType, CurrentUser } from '../types';

interface CheckInModalProps {
  docks: Dock[];
  currentUser: CurrentUser;
  onClose: () => void;
  onSubmit: (data: {
    plate: string;
    model: string;
    capacityTons: number;
    capacityM3: number;
    cargoType: CargoType;
    carrier: string;
    driverName: string;
    driverDocument: string;
    operationType: OperationType;
    priority: 'normal' | 'alta' | 'urgente';
    assignedDockNumber?: number;
    operatorName: string;
    notes?: string;
  }) => Promise<void>;
}

export const CheckInModal: React.FC<CheckInModalProps> = ({
  docks,
  currentUser,
  onClose,
  onSubmit,
}) => {
  const [plate, setPlate] = useState('');
  const [model, setModel] = useState('Scania R450');
  const [capacityTons, setCapacityTons] = useState('32');
  const [capacityM3, setCapacityM3] = useState('90');
  const [cargoType, setCargoType] = useState<CargoType>('paletizada');
  const [carrier, setCarrier] = useState('TransBrasil Logística');
  const [driverName, setDriverName] = useState('');
  const [driverDocument, setDriverDocument] = useState('');
  const [operationType, setOperationType] = useState<OperationType>('descarregamento');
  const [priority, setPriority] = useState<'normal' | 'alta' | 'urgente'>('normal');
  const [assignedDockNumber, setAssignedDockNumber] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const freeDocks = docks.filter((d) => d.status === 'livre');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plate || !driverName) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        plate: plate.toUpperCase().trim(),
        model,
        capacityTons: Number(capacityTons) || 25,
        capacityM3: Number(capacityM3) || 70,
        cargoType,
        carrier,
        driverName,
        driverDocument: driverDocument || 'Não informado',
        operationType,
        priority,
        assignedDockNumber: assignedDockNumber ? Number(assignedDockNumber) : undefined,
        operatorName: `${currentUser.name} (${currentUser.role})`,
        notes,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white tracking-tight">
                Portaria: Registro de Chegada (Check-in)
              </h3>
              <p className="text-xs text-slate-400">
                Registro com data e hora automática de entrada no pátio do depósito
              </p>
            </div>
          </div>
          <button
            id="btn-close-checkin-modal"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Section 1: Vehicle & Driver */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center space-x-1.5">
              <span>1. Identificação do Veículo & Motorista</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Placa (Mercosul/Padrão) *</label>
                <input
                  type="text"
                  required
                  value={plate}
                  onChange={(e) => setPlate(e.target.value.toUpperCase())}
                  placeholder="Ex: BRA2E19"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono uppercase text-sm tracking-wider focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Modelo do Veículo</label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="Ex: Scania R450, Volvo FH"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Transportadora / Frota</label>
                <input
                  type="text"
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  placeholder="Ex: TransBrasil, Jamef"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Nome do Motorista *</label>
                <input
                  type="text"
                  required
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  placeholder="Nome completo do condutor"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Documento (CPF / CNH)</label>
                <input
                  type="text"
                  value={driverDocument}
                  onChange={(e) => setDriverDocument(e.target.value)}
                  placeholder="000.000.000-00"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Operacional & Carga */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center space-x-1.5">
              <span>2. Dados Operacionais da Carga</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Tipo de Operação</label>
                <select
                  value={operationType}
                  onChange={(e) => setOperationType(e.target.value as OperationType)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="descarregamento">Descarregamento (Entrada)</option>
                  <option value="carregamento">Carregamento (Expedição)</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Tipo de Carga</label>
                <select
                  value={cargoType}
                  onChange={(e) => setCargoType(e.target.value as CargoType)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="paletizada">Paletizada</option>
                  <option value="seca">Seca</option>
                  <option value="refrigerada">Refrigerada</option>
                  <option value="fracionada">Fracionada</option>
                  <option value="perigosa">Perigosa (Química)</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Capacidade (Toneladas)</label>
                <input
                  type="number"
                  min="1"
                  max="80"
                  value={capacityTons}
                  onChange={(e) => setCapacityTons(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Prioridade</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as 'normal' | 'alta' | 'urgente')}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="normal">Normal</option>
                  <option value="alta">Alta</option>
                  <option value="urgente">Urgente (Cadeia Fria)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Destinação & Doca */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center space-x-1.5">
              <span>3. Destinação Inicial</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">
                  Alocação de Doca (Opcional)
                </label>
                <select
                  value={assignedDockNumber}
                  onChange={(e) => setAssignedDockNumber(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="">Aguardar na Fila do Pátio (Triagem)</option>
                  {freeDocks.map((d) => (
                    <option key={d.id} value={d.number}>
                      {d.name} ({d.type} - Livre)
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Selecione uma doca livre para encaminhamento direto ou deixe vazio para aguardar no pátio.
                </p>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">
                  Notas / Documento Fiscal (NF-e)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: NF-e 88210, Danfe anexada"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Action button */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
            >
              Cancelar
            </button>
            <button
              id="btn-confirm-checkin"
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 shadow-md transition active:scale-95 flex items-center space-x-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Concluir Entrada & Check-in</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
