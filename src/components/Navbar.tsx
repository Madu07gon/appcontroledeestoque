import React from 'react';
import {
  Truck,
  Warehouse,
  BarChart3,
  Lightbulb,
  FileText,
  Users,
  Shield,
  RefreshCw,
  Download,
  PlusCircle,
  LogOut,
} from 'lucide-react';
import { UserRole, CurrentUser } from '../types';

interface NavbarProps {
  currentTab: 'docas' | 'kpis' | 'recomendacoes' | 'relatorios' | 'cadastros';
  setCurrentTab: (tab: 'docas' | 'kpis' | 'recomendacoes' | 'relatorios' | 'cadastros') => void;
  currentUser: CurrentUser;
  setCurrentUser: (user: CurrentUser) => void;
  onOpenCheckIn: () => void;
  onOpenCheckOut: () => void;
  onOpenBackup: () => void;
  isSyncing: boolean;
  onManualRefresh: () => void;
  queueCount: number;
  alertsCount: number;
}

const AVAILABLE_USERS: CurrentUser[] = [
  { id: 'usr-admin', name: 'Ricardo Duarte', role: 'admin', badgeCode: 'ADM-01' },
  { id: 'usr-gerente', name: 'Ana Cláudia Fontes', role: 'gerente', badgeCode: 'MGR-01' },
  { id: 'usr-operador', name: 'Carlos Silva', role: 'operador', badgeCode: 'OP-101' },
];

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  setCurrentUser,
  onOpenCheckIn,
  onOpenCheckOut,
  onOpenBackup,
  isSyncing,
  onManualRefresh,
  queueCount,
  alertsCount,
}) => {
  return (
    <header className="no-print bg-slate-900 border-b border-slate-800 sticky top-0 z-30 shadow-md">
      {/* Top utility row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-600 flex items-center justify-center text-white shadow-sm ring-1 ring-cyan-400/30">
              <Warehouse className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-extrabold tracking-tight text-white">LogiDocas</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                  14 Docas Ativas
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">
                Gestão Operacional de Pátio, Fluxo de Cargas & Triagem
              </p>
            </div>
          </div>

          {/* Action buttons & user profile */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Sync status button */}
            <button
              id="btn-sync-refresh"
              onClick={onManualRefresh}
              title="Sincronização em tempo real (atualiza a cada 6s)"
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">Sincronizado</span>
            </button>

            {/* Backup / Drive */}
            <button
              id="btn-open-backup"
              onClick={onOpenBackup}
              title="Backup e Persistência em Nuvem / Google Drive"
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden lg:inline">Backup / Nuvem</span>
            </button>

            {/* Quick Check-in Button */}
            <button
              id="btn-nav-checkin"
              onClick={onOpenCheckIn}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 shadow transition active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Entrada (Pátio)</span>
            </button>

            {/* Quick Check-out Button */}
            <button
              id="btn-nav-checkout"
              onClick={onOpenCheckOut}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition active:scale-95"
            >
              <LogOut className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Saída</span>
            </button>

            {/* Profile selector dropdown */}
            <div className="relative flex items-center pl-2 border-l border-slate-800">
              <div className="flex items-center space-x-2 bg-slate-800/90 py-1 px-2.5 rounded-md border border-slate-700">
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                <select
                  id="select-user-role"
                  value={currentUser.id}
                  onChange={(e) => {
                    const found = AVAILABLE_USERS.find((u) => u.id === e.target.value);
                    if (found) setCurrentUser(found);
                  }}
                  className="bg-transparent text-xs font-semibold text-slate-200 focus:outline-none cursor-pointer pr-1"
                >
                  {AVAILABLE_USERS.map((u) => (
                    <option key={u.id} value={u.id} className="bg-slate-900 text-slate-100">
                      {u.name} ({u.role.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 sm:space-x-4 overflow-x-auto py-2 no-scrollbar border-t border-slate-800/60">
          <button
            id="tab-docas"
            onClick={() => setCurrentTab('docas')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-md text-sm font-semibold transition whitespace-nowrap ${
              currentTab === 'docas'
                ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Warehouse className="w-4 h-4" />
            <span>Controle das 14 Docas</span>
            {queueCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {queueCount} na fila
              </span>
            )}
          </button>

          <button
            id="tab-kpis"
            onClick={() => setCurrentTab('kpis')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-md text-sm font-semibold transition whitespace-nowrap ${
              currentTab === 'kpis'
                ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Indicadores & Gargalos</span>
          </button>

          <button
            id="tab-recomendacoes"
            onClick={() => setCurrentTab('recomendacoes')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-md text-sm font-semibold transition whitespace-nowrap ${
              currentTab === 'recomendacoes'
                ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            <span>Boas Práticas & IA</span>
            {alertsCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse">
                {alertsCount}
              </span>
            )}
          </button>

          <button
            id="tab-relatorios"
            onClick={() => setCurrentTab('relatorios')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-md text-sm font-semibold transition whitespace-nowrap ${
              currentTab === 'relatorios'
                ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Relatórios & Impressão</span>
          </button>

          <button
            id="tab-cadastros"
            onClick={() => setCurrentTab('cadastros')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-md text-sm font-semibold transition whitespace-nowrap ${
              currentTab === 'cadastros'
                ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Veículos & Motoristas</span>
          </button>
        </div>
      </div>
    </header>
  );
};
