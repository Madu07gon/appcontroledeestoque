import React, { useState } from 'react';
import {
  Printer,
  FileText,
  Filter,
  Search,
  Calendar,
  Warehouse,
  Clock,
  TrendingUp,
  Download,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { MovementRecord, Dock, OperationalKPIs, CurrentUser } from '../types';

interface ReportsViewProps {
  movements: MovementRecord[];
  docks: Dock[];
  kpis: OperationalKPIs;
  currentUser: CurrentUser;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  movements,
  docks,
  kpis,
  currentUser,
}) => {
  const [reportType, setReportType] = useState<'diario' | 'performance_docas' | 'gargalos'>('diario');
  const [filterDock, setFilterDock] = useState<string>('todas');
  const [filterCargo, setFilterCargo] = useState<string>('todas');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const handlePrint = () => {
    window.print();
  };

  // Filter movements
  const filteredMovements = movements.filter((m) => {
    if (filterDock !== 'todas' && m.dockNumber?.toString() !== filterDock) return false;
    if (filterCargo !== 'todas' && m.cargoType !== filterCargo) return false;
    if (filterStatus !== 'todos' && m.status !== filterStatus) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchPlate = m.vehiclePlate.toLowerCase().includes(term);
      const matchDriver = m.driverName.toLowerCase().includes(term);
      const matchModel = m.vehicleModel.toLowerCase().includes(term);
      if (!matchPlate && !matchDriver && !matchModel) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Control bar (hidden during print) */}
      <div className="no-print bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white tracking-tight">
                Emissão de Relatórios Logísticos & Exportação
              </h2>
              <p className="text-xs text-slate-400">
                Gere demonstrativos operacionais e exporte em PDF otimizado para impressão
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              id="btn-print-report"
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-cyan-600 hover:bg-cyan-500 shadow-md transition flex items-center space-x-2 active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Relatório (PDF)</span>
            </button>
          </div>
        </div>

        {/* Report type selector tabs */}
        <div className="flex space-x-2 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setReportType('diario')}
            className={`px-3 py-1.5 rounded-lg transition ${
              reportType === 'diario'
                ? 'bg-cyan-600 text-white shadow'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Movimentação Diária ({filteredMovements.length})
          </button>
          <button
            onClick={() => setReportType('performance_docas')}
            className={`px-3 py-1.5 rounded-lg transition ${
              reportType === 'performance_docas'
                ? 'bg-cyan-600 text-white shadow'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Performance das 14 Docas
          </button>
          <button
            onClick={() => setReportType('gargalos')}
            className={`px-3 py-1.5 rounded-lg transition ${
              reportType === 'gargalos'
                ? 'bg-cyan-600 text-white shadow'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Congestionamentos & Picos
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs pt-1">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar placa, motorista..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Dock filter */}
          <div>
            <select
              value={filterDock}
              onChange={(e) => setFilterDock(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="todas">Todas as Docas (01 a 14)</option>
              {docks.map((d) => (
                <option key={d.id} value={d.number.toString()}>
                  {d.name} ({d.type})
                </option>
              ))}
            </select>
          </div>

          {/* Cargo type filter */}
          <div>
            <select
              value={filterCargo}
              onChange={(e) => setFilterCargo(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="todas">Todos os Tipos de Carga</option>
              <option value="paletizada">Paletizada</option>
              <option value="seca">Seca</option>
              <option value="refrigerada">Refrigerada</option>
              <option value="fracionada">Fracionada</option>
              <option value="perigosa">Perigosa</option>
            </select>
          </div>

          {/* Status filter */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="todos">Todos os Status</option>
              <option value="concluido">Concluídos</option>
              <option value="operando_doca">Em Atendimento na Doca</option>
              <option value="fila_espera">Na Fila do Pátio</option>
            </select>
          </div>
        </div>
      </div>

      {/* Printable Sheet Container */}
      <div className="printable-report bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-md">
        {/* Printable Header */}
        <div className="border-b-2 border-slate-700 pb-4 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-extrabold text-white tracking-tight uppercase">
                Transportadora Central & Centro de Distribuição
              </h1>
              <p className="text-xs text-slate-300 font-semibold mt-0.5">
                Relatório Operacional de Gestão de Docas, Pátio e Fluxo de Entrada/Saída
              </p>
              <div className="flex items-center space-x-4 text-xs text-slate-400 mt-2">
                <span>
                  Emissão: <strong>{new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</strong>
                </span>
                <span>•</span>
                <span>
                  Responsável: <strong>{currentUser.name} ({currentUser.role.toUpperCase()})</strong>
                </span>
              </div>
            </div>

            <div className="text-right hidden sm:block">
              <span className="inline-block px-3 py-1 rounded bg-slate-800 text-cyan-300 font-mono text-xs font-bold border border-slate-700">
                STATUS: SISTEMA EM OPERAÇÃO
              </span>
              <p className="text-[11px] text-slate-400 mt-1">14 Docas Industriais</p>
            </div>
          </div>

          {/* Executive Summary Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-800 text-xs">
            <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/60">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Taxa de Ocupação</span>
              <strong className="text-base text-white">{kpis.averageOccupancyRate}%</strong>
            </div>
            <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/60">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Throughput Total</span>
              <strong className="text-base text-cyan-300">{kpis.totalProcessedVehicles} veículos</strong>
            </div>
            <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/60">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Permanência Média</span>
              <strong className="text-base text-white">{kpis.averageDockStayMinutes} minutos</strong>
            </div>
            <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/60">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Eficiência Ativa</span>
              <strong className="text-base text-emerald-300">{kpis.operationalEfficiency}%</strong>
            </div>
          </div>
        </div>

        {/* Report Content based on selected type */}
        {reportType === 'diario' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Movimentação Detalhada de Veículos ({filteredMovements.length} registros)
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-800">
                <thead>
                  <tr className="bg-slate-800/90 text-slate-300 border-b border-slate-700">
                    <th className="py-2.5 px-3 font-bold">Placa</th>
                    <th className="py-2.5 px-3 font-bold">Veículo / Motorista</th>
                    <th className="py-2.5 px-3 font-bold">Operação / Carga</th>
                    <th className="py-2.5 px-3 font-bold text-center">Doca</th>
                    <th className="py-2.5 px-3 font-bold">Chegada</th>
                    <th className="py-2.5 px-3 font-bold">Saída</th>
                    <th className="py-2.5 px-3 font-bold text-center">Tempo Doca</th>
                    <th className="py-2.5 px-3 font-bold text-center">Tempo Total</th>
                    <th className="py-2.5 px-3 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {filteredMovements.map((m) => {
                    const formatTime = (iso?: string) => {
                      if (!iso) return '-';
                      return new Date(iso).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      });
                    };

                    return (
                      <tr key={m.id} className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-mono font-bold text-cyan-300">
                          {m.vehiclePlate}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-white">{m.vehicleModel}</div>
                          <div className="text-[11px] text-slate-400">{m.driverName}</div>
                        </td>
                        <td className="py-2.5 px-3 capitalize">
                          <span className="font-semibold text-slate-200">{m.operationType}</span>
                          <div className="text-[11px] text-slate-400">{m.cargoType}</div>
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold">
                          {m.dockNumber ? `Doca ${m.dockNumber.toString().padStart(2, '0')}` : 'Pátio'}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-300">
                          {formatTime(m.gateEntryTime)}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-300">
                          {formatTime(m.gateExitTime)}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono">
                          {m.totalDockMinutes > 0 ? `${m.totalDockMinutes} min` : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-white">
                          {m.totalYardMinutes} min
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              m.status === 'concluido'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : m.status === 'operando_doca'
                                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                                : 'bg-amber-950 text-amber-300 border border-amber-800'
                            }`}
                          >
                            {m.status.replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {reportType === 'performance_docas' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Relatório de Performance e Utilização das 14 Docas
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-800">
                <thead>
                  <tr className="bg-slate-800/90 text-slate-300 border-b border-slate-700">
                    <th className="py-2.5 px-3 font-bold">Doca</th>
                    <th className="py-2.5 px-3 font-bold">Tipo & Capacidade</th>
                    <th className="py-2.5 px-3 font-bold">Rampa Hidráulica</th>
                    <th className="py-2.5 px-3 font-bold text-center">Atendimentos</th>
                    <th className="py-2.5 px-3 font-bold">Tempo Produtivo</th>
                    <th className="py-2.5 px-3 font-bold">Tempo Ocioso</th>
                    <th className="py-2.5 px-3 font-bold">Aproveitamento</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {docks.map((d) => {
                    const total = Math.max(1, d.totalOccupiedMinutesToday + d.totalIdleMinutesToday);
                    const rate = Math.round((d.totalOccupiedMinutesToday / total) * 100);
                    return (
                      <tr key={d.id} className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-bold text-white">{d.name}</td>
                        <td className="py-2.5 px-3 capitalize">{d.type} ({d.maxWeightTons}t)</td>
                        <td className="py-2.5 px-3">{d.hasHydraulicRamp ? 'Sim' : 'Não'}</td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-cyan-300">
                          {d.totalOperationsToday}
                        </td>
                        <td className="py-2.5 px-3 font-mono">{d.totalOccupiedMinutesToday} min</td>
                        <td className="py-2.5 px-3 font-mono text-slate-400">{d.totalIdleMinutesToday} min</td>
                        <td className="py-2.5 px-3 font-mono font-bold">{rate}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {reportType === 'gargalos' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Análise de Congestionamentos e Horários de Pico
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-800">
                <thead>
                  <tr className="bg-slate-800/90 text-slate-300 border-b border-slate-700">
                    <th className="py-2.5 px-3 font-bold">Janela Horária</th>
                    <th className="py-2.5 px-3 font-bold text-center">Volume de Veículos</th>
                    <th className="py-2.5 px-3 font-bold text-center">Ocorrências de Atraso</th>
                    <th className="py-2.5 px-3 font-bold">Nível de Risco Operacional</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {kpis.bottlenecks.map((b) => (
                    <tr key={b.hour} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-bold text-white">{b.hour}</td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold">{b.count}</td>
                      <td className="py-2.5 px-3 text-center font-mono text-rose-400 font-bold">
                        {b.delayed}
                      </td>
                      <td className="py-2.5 px-3">
                        {b.count >= 12 ? (
                          <span className="text-rose-400 font-bold">Alto (Congestionamento)</span>
                        ) : b.count >= 8 ? (
                          <span className="text-amber-400 font-medium">Médio (Atenção)</span>
                        ) : (
                          <span className="text-emerald-400 font-medium">Baixo (Fluido)</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Printable Footer / Signatures */}
        <div className="mt-8 pt-6 border-t-2 border-slate-800 grid grid-cols-2 gap-8 text-center text-xs text-slate-400">
          <div>
            <div className="border-b border-slate-700 pb-1 mb-1 font-semibold text-slate-300">
              {currentUser.name}
            </div>
            <span>Supervisor de Operações / Portaria</span>
          </div>
          <div>
            <div className="border-b border-slate-700 pb-1 mb-1 font-semibold text-slate-300">
              Gerência Geral de Logística
            </div>
            <span>Validação de SLA & Qualidade</span>
          </div>
        </div>
      </div>
    </div>
  );
};
