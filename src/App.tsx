/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  SystemState,
  Dock,
  QueueItem,
  CurrentUser,
  OperationType,
  CargoType,
  Recommendation,
  Vehicle,
  DriverOrUser,
} from './types';
import { Navbar } from './components/Navbar';
import { DockGrid } from './components/DockGrid';
import { YardQueue } from './components/YardQueue';
import { DockDetailModal } from './components/DockDetailModal';
import { CheckInModal } from './components/CheckInModal';
import { CheckOutModal } from './components/CheckOutModal';
import { KpiDashboard } from './components/KpiDashboard';
import { RecommendationsPanel } from './components/RecommendationsPanel';
import { ReportsView } from './components/ReportsView';
import { VehiclesAndDriversView } from './components/VehiclesAndDriversView';
import { BackupModal } from './components/BackupModal';
import {
  Activity,
  AlertTriangle,
  Clock,
  Warehouse,
  Truck,
  CheckCircle2,
  X,
} from 'lucide-react';

export default function App() {
  const [state, setState] = useState<SystemState | null>(null);
  const [currentTab, setCurrentTab] = useState<
    'docas' | 'kpis' | 'recomendacoes' | 'relatorios' | 'cadastros'
  >('docas');
  const [currentUser, setCurrentUser] = useState<CurrentUser>({
    id: 'usr-admin',
    name: 'Ricardo Duarte',
    role: 'admin',
    badgeCode: 'ADM-01',
  });

  // Modal states
  const [selectedDock, setSelectedDock] = useState<Dock | null>(null);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isCheckOutOpen, setIsCheckOutOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);

  // Sync state & Notification toast
  const [isSyncing, setIsSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.text === text ? null : prev));
    }, 4500);
  };

  // Fetch state from server
  const fetchState = useCallback(async (quiet = false) => {
    if (!quiet) setIsSyncing(true);
    try {
      const res = await fetch('/api/state');
      if (res.ok) {
        const data: SystemState = await res.json();
        setState(data);
        // If a dock modal is open, keep it updated with fresh dock data
        if (selectedDock) {
          const freshDock = data.docks.find((d) => d.id === selectedDock.id);
          if (freshDock) setSelectedDock(freshDock);
        }
      }
    } catch (err) {
      console.error('Error fetching logistics state:', err);
    } finally {
      if (!quiet) setIsSyncing(false);
    }
  }, [selectedDock]);

  // Polling every 6 seconds for live telemetry
  useEffect(() => {
    fetchState();
    const interval = setInterval(() => {
      fetchState(true);
    }, 6000);
    return () => clearInterval(interval);
  }, [fetchState]);

  // Handle dock operations
  const handleReleaseDock = async (dockId: string, notes?: string) => {
    try {
      const res = await fetch(`/api/docas/${dockId}/release`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
      const data = await res.json();
      if (res.ok && data.state) {
        setState(data.state);
        showToast(data.message || 'Doca liberada com sucesso!', 'success');
      } else {
        showToast(data.error || 'Erro ao liberar doca', 'error');
      }
    } catch {
      showToast('Falha na comunicação com o servidor', 'error');
    }
  };

  const handleAssignDock = async (params: {
    dockId: string;
    plate: string;
    driverName: string;
    operationType: OperationType;
    cargoType: CargoType;
    estimatedDurationMinutes: number;
    notes?: string;
    operatorName: string;
  }) => {
    try {
      const res = await fetch(`/api/docas/${params.dockId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (res.ok && data.state) {
        setState(data.state);
        showToast(data.message || 'Veículo alocado na doca com sucesso!', 'success');
      } else {
        showToast(data.error || 'Erro ao alocar veículo', 'error');
      }
    } catch {
      showToast('Falha na comunicação com o servidor', 'error');
    }
  };

  const handleMaintenance = async (dockId: string, reason: string, active: boolean) => {
    try {
      const res = await fetch(`/api/docas/${dockId}/maintenance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, active }),
      });
      const data = await res.json();
      if (res.ok && data.state) {
        setState(data.state);
        showToast(data.message || 'Status de manutenção atualizado!', 'success');
      } else {
        showToast(data.error || 'Erro ao atualizar manutenção', 'error');
      }
    } catch {
      showToast('Falha na comunicação com o servidor', 'error');
    }
  };

  // Handle gate check-in
  const handleCheckInSubmit = async (data: {
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
  }) => {
    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (res.ok && resData.state) {
        setState(resData.state);
        showToast(resData.message || 'Check-in realizado com sucesso!', 'success');
      } else {
        showToast(resData.error || 'Erro ao realizar check-in', 'error');
      }
    } catch {
      showToast('Falha ao registrar check-in', 'error');
    }
  };

  // Handle gate check-out
  const handleCheckOutSubmit = async (plate: string) => {
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plate }),
      });
      const resData = await res.json();
      if (res.ok && resData.state) {
        setState(resData.state);
        showToast(resData.message || 'Saída registrada com sucesso!', 'success');
      } else {
        showToast(resData.error || 'Erro ao registrar saída', 'error');
      }
    } catch {
      showToast('Falha ao registrar saída', 'error');
    }
  };

  // Quick assign from queue to recommended or open dock
  const handleAssignFromQueue = (queueItem: QueueItem) => {
    // Look for recommended dock or any free dock
    let targetDock = state?.docks.find(
      (d) => d.number === queueItem.recommendedDockNumber && d.status === 'livre',
    );
    if (!targetDock) {
      targetDock = state?.docks.find((d) => d.status === 'livre');
    }

    if (targetDock) {
      setSelectedDock(targetDock);
    } else {
      showToast('Não há docas livres no momento. Aguarde liberação.', 'info');
    }
  };

  // Handle recommendation action
  const handleApplyRecommendation = (rec: Recommendation) => {
    if (rec.targetDockNumber && state) {
      const dock = state.docks.find((d) => d.number === rec.targetDockNumber);
      if (dock) {
        setSelectedDock(dock);
        return;
      }
    }
    showToast(`Orientação acionada: ${rec.suggestedAction}`, 'info');
  };

  // Handle add vehicle / driver
  const handleAddVehicle = async (v: Omit<Vehicle, 'id' | 'createdAt'>) => {
    try {
      const res = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(v),
      });
      const data = await res.json();
      if (res.ok && data.state) {
        setState(data.state);
        showToast(`Veículo ${v.plate} cadastrado com sucesso!`, 'success');
      }
    } catch {
      showToast('Erro ao cadastrar veículo', 'error');
    }
  };

  const handleAddDriver = async (d: Omit<DriverOrUser, 'id'>) => {
    try {
      const res = await fetch('/api/drivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(d),
      });
      const data = await res.json();
      if (res.ok && data.state) {
        setState(data.state);
        showToast(`Operador ${d.name} cadastrado com sucesso!`, 'success');
      }
    } catch {
      showToast('Erro ao cadastrar operador', 'error');
    }
  };

  // Restore & Reset
  const handleRestoreState = async (importedState: SystemState) => {
    const res = await fetch('/api/backup/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(importedState),
    });
    const data = await res.json();
    if (res.ok && data.state) {
      setState(data.state);
      showToast('Base de dados restaurada com sucesso!', 'success');
    } else {
      throw new Error(data.error || 'Erro na importação');
    }
  };

  const handleResetSeed = async () => {
    const res = await fetch('/api/backup/reset', { method: 'POST' });
    const data = await res.json();
    if (res.ok && data.state) {
      setState(data.state);
      showToast('Base restaurada para os parâmetros iniciais.', 'success');
    }
  };

  if (!state) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-200">
        <div className="w-12 h-12 rounded-xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-4 animate-pulse">
          <Warehouse className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold tracking-tight">Carregando LogiDocas...</h2>
        <p className="text-xs text-slate-400 mt-1">Conectando ao terminal de 14 docas em tempo real</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-white">
      {/* Navigation & Header */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        onOpenCheckIn={() => setIsCheckInOpen(true)}
        onOpenCheckOut={() => setIsCheckOutOpen(true)}
        onOpenBackup={() => setIsBackupOpen(true)}
        isSyncing={isSyncing}
        onManualRefresh={() => fetchState(false)}
        queueCount={state.queue.length}
        alertsCount={state.kpis.delayedOperationsCount}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold border ${
              toastMessage.type === 'error'
                ? 'bg-rose-950/90 text-rose-200 border-rose-800'
                : toastMessage.type === 'info'
                ? 'bg-cyan-950/90 text-cyan-200 border-cyan-800'
                : 'bg-emerald-950/90 text-emerald-200 border-emerald-800'
            }`}
          >
            {toastMessage.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="ml-2 text-slate-400 hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* TAB 1: DOCAS & PATIO */}
        {currentTab === 'docas' && (
          <div className="space-y-6">
            {/* Quick KPI Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-3 flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg bg-cyan-950 border border-cyan-800/80 flex items-center justify-center text-cyan-400 shrink-0">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase">
                    Ocupação Média
                  </span>
                  <p className="text-lg font-extrabold text-white">
                    {state.kpis.averageOccupancyRate}%
                  </p>
                </div>
              </div>

              <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-3 flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-950 border border-emerald-800/80 flex items-center justify-center text-emerald-400 shrink-0">
                  <Warehouse className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase">
                    Docas Operando
                  </span>
                  <p className="text-lg font-extrabold text-white">
                    {state.kpis.activeDocksCount} / 14
                  </p>
                </div>
              </div>

              <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-3 flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg bg-amber-950 border border-amber-800/80 flex items-center justify-center text-amber-400 shrink-0">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase">
                    Fila no Pátio
                  </span>
                  <p className="text-lg font-extrabold text-amber-300">
                    {state.queue.length} caminhões
                  </p>
                </div>
              </div>

              <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-3 flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg bg-purple-950 border border-purple-800/80 flex items-center justify-center text-purple-400 shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase">
                    Tempo Médio
                  </span>
                  <p className="text-lg font-extrabold text-white">
                    {state.kpis.averageDockStayMinutes} min
                  </p>
                </div>
              </div>
            </div>

            {/* Visual 14 Docks Grid */}
            <DockGrid
              docks={state.docks}
              queue={state.queue}
              onSelectDock={(dock) => setSelectedDock(dock)}
            />

            {/* Waiting Yard Queue */}
            <YardQueue
              queue={state.queue}
              docks={state.docks}
              onAssignToDock={handleAssignFromQueue}
              onCheckOut={handleCheckOutSubmit}
            />
          </div>
        )}

        {/* TAB 2: INDICADORES (KPIS) */}
        {currentTab === 'kpis' && (
          <KpiDashboard kpis={state.kpis} docks={state.docks} />
        )}

        {/* TAB 3: RECOMENDACOES & IA */}
        {currentTab === 'recomendacoes' && (
          <RecommendationsPanel
            recommendations={state.recommendations}
            docks={state.docks}
            queue={state.queue}
            onApplyAction={handleApplyRecommendation}
          />
        )}

        {/* TAB 4: RELATORIOS & IMPRESSAO */}
        {currentTab === 'relatorios' && (
          <ReportsView
            movements={state.movements}
            docks={state.docks}
            kpis={state.kpis}
            currentUser={currentUser}
          />
        )}

        {/* TAB 5: CADASTROS */}
        {currentTab === 'cadastros' && (
          <VehiclesAndDriversView
            vehicles={state.vehicles}
            drivers={state.drivers}
            onAddVehicle={handleAddVehicle}
            onAddDriver={handleAddDriver}
          />
        )}
      </main>

      {/* Dock Detail & Action Modal */}
      {selectedDock && (
        <DockDetailModal
          dock={selectedDock}
          queue={state.queue}
          currentUser={currentUser}
          onClose={() => setSelectedDock(null)}
          onReleaseDock={handleReleaseDock}
          onAssignDock={handleAssignDock}
          onMaintenance={handleMaintenance}
        />
      )}

      {/* Check-In Gate Modal */}
      {isCheckInOpen && (
        <CheckInModal
          docks={state.docks}
          currentUser={currentUser}
          onClose={() => setIsCheckInOpen(false)}
          onSubmit={handleCheckInSubmit}
        />
      )}

      {/* Check-Out Gate Modal */}
      {isCheckOutOpen && (
        <CheckOutModal
          movements={state.movements}
          docks={state.docks}
          onClose={() => setIsCheckOutOpen(false)}
          onConfirmCheckOut={handleCheckOutSubmit}
        />
      )}

      {/* Backup & Google Drive Modal */}
      {isBackupOpen && (
        <BackupModal
          lastBackupAt={state.lastBackupAt}
          onClose={() => setIsBackupOpen(false)}
          onRestoreState={handleRestoreState}
          onResetSeed={handleResetSeed}
        />
      )}
    </div>
  );
}
