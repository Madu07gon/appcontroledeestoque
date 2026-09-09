import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Warehouse,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Activity,
  Calendar,
  Layers,
} from 'lucide-react';
import { OperationalKPIs, Dock } from '../types';

interface KpiDashboardProps {
  kpis: OperationalKPIs;
  docks: Dock[];
}

export const KpiDashboard: React.FC<KpiDashboardProps> = ({ kpis, docks }) => {
  return (
    <div className="space-y-6">
      {/* Top row of summary metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Taxa de Ocupação Média */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Taxa de Ocupação
            </span>
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {kpis.averageOccupancyRate}%
            </span>
            <span className="text-xs text-slate-400 font-medium">
              ({kpis.activeDocksCount} de {14 - kpis.maintenanceDocksCount} operacionais)
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center space-x-1">
            <span className="text-emerald-400 font-semibold">
              Meta: 70% - 85%
            </span>
            <span>• {kpis.idleDocksCount} docas livres</span>
          </div>
        </div>

        {/* Metric 2: Tempo Médio de Permanência */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Tempo Médio em Doca
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {kpis.averageDockStayMinutes}
            </span>
            <span className="text-sm text-slate-400 font-medium">minutos</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center space-x-1">
            <span className="text-cyan-400 font-semibold">SLA Meta: &le; 45 min</span>
            <span>• Carga/Descarga</span>
          </div>
        </div>

        {/* Metric 3: Throughput Total */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Throughput de Veículos
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {kpis.totalProcessedVehicles}
            </span>
            <span className="text-xs text-slate-400 font-medium">veículos hoje</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center space-x-1">
            <span className="text-emerald-400 font-semibold">+18% vs ontem</span>
            <span>• Ritmo contínuo</span>
          </div>
        </div>

        {/* Metric 4: Eficiência Operacional */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Disponibilidade Ativa
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-950 border border-amber-800 flex items-center justify-center text-amber-400">
              <Warehouse className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {kpis.operationalEfficiency}%
            </span>
            <span className="text-xs text-slate-400 font-medium">das 14 docas</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center space-x-1">
            <span className="text-amber-400 font-semibold">
              {kpis.maintenanceDocksCount} em manutenção
            </span>
            <span>• 1 doca interditada</span>
          </div>
        </div>
      </div>

      {/* Second row: Bottlenecks by Hour & Cargo Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bottleneck by Hour Chart */}
        <div className="lg:col-span-2 bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Flame className="w-5 h-5 text-rose-400" />
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Mapeamento de Gargalos & Horários de Pico
                </h3>
                <p className="text-xs text-slate-400">
                  Volume de operações processadas e ocorrências de atraso por faixa horária
                </p>
              </div>
            </div>
          </div>

          {/* Custom high-density responsive bar chart */}
          <div className="space-y-3 pt-2">
            {kpis.bottlenecks.map((item) => {
              const maxCount = 16;
              const barWidth = Math.round((item.count / maxCount) * 100);
              const isPeak = item.count >= 12;

              return (
                <div key={item.hour} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300 flex items-center space-x-1.5">
                      <span>{item.hour}</span>
                      {isPeak && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-extrabold bg-rose-950 text-rose-300 border border-rose-800">
                          PICO CRÍTICO
                        </span>
                      )}
                    </span>
                    <div className="flex items-center space-x-3 text-slate-400 font-mono text-[11px]">
                      <span>{item.count} caminhões</span>
                      {item.delayed > 0 && (
                        <span className="text-rose-400 font-bold">
                          ({item.delayed} atrasos)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Visual dual bar */}
                  <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden flex">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        isPeak ? 'bg-rose-500' : 'bg-cyan-500'
                      }`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-xs text-slate-400 pt-2 border-t border-slate-800 flex items-center justify-between">
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded bg-rose-500 inline-block" />
              <span>Picos principais identificados: 08:00 - 10:00 e 14:00 - 16:00</span>
            </span>
            <span className="text-cyan-400 font-medium">Recomenda-se escalonamento de janelas</span>
          </div>
        </div>

        {/* Cargo Type Distribution & Turn Performance */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
            <Layers className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Distribuição por Carga
            </h3>
          </div>

          <div className="space-y-3">
            {kpis.cargoDistribution.map((cargo) => (
              <div key={cargo.type} className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="capitalize font-semibold text-slate-200">
                    {cargo.type}
                  </span>
                  <span className="text-slate-400 font-mono font-medium">
                    {cargo.count} veíc. ({cargo.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-cyan-500 rounded-full"
                    style={{ width: `${cargo.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Performance por Turno
            </h4>
            <div className="space-y-2 text-xs">
              {kpis.turnPerformance.map((t) => (
                <div
                  key={t.turn}
                  className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-center justify-between"
                >
                  <span className="text-slate-300 font-medium">{t.turn}</span>
                  <span className="font-mono text-cyan-300 font-bold">
                    {t.vehicles} veíc. • {t.avgTimeMinutes}m méd.
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Third row: Individual Dock Efficiency Table (Productive vs Idle Minutes) */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Balanço Individual das 14 Docas (Tempo Produtivo vs. Ocioso)
            </h3>
            <p className="text-xs text-slate-400">
              Acompanhamento de eficiência e utilização acumulada no dia de hoje
            </p>
          </div>
          <div className="flex items-center space-x-3 text-xs text-slate-400">
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block" />
              <span>Produtivo</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-700 inline-block" />
              <span>Ocioso</span>
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2.5 px-3 font-semibold">Doca</th>
                <th className="py-2.5 px-3 font-semibold">Especialidade</th>
                <th className="py-2.5 px-3 font-semibold">Status Atual</th>
                <th className="py-2.5 px-3 font-semibold text-center">Operações Hoje</th>
                <th className="py-2.5 px-3 font-semibold">Tempo Produtivo</th>
                <th className="py-2.5 px-3 font-semibold">Tempo Ocioso</th>
                <th className="py-2.5 px-3 font-semibold">Aproveitamento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {docks.map((dock) => {
                const total = Math.max(1, dock.totalOccupiedMinutesToday + dock.totalIdleMinutesToday);
                const efficiencyRate = Math.round((dock.totalOccupiedMinutesToday / total) * 100);

                return (
                  <tr key={dock.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-2.5 px-3 font-bold text-white flex items-center space-x-2">
                      <span>{dock.name}</span>
                    </td>
                    <td className="py-2.5 px-3 capitalize text-slate-300">
                      {dock.type} ({dock.maxWeightTons}t)
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          dock.status === 'livre'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : dock.status === 'manutencao'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                        }`}
                      >
                        {dock.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-cyan-300">
                      {dock.totalOperationsToday}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 font-mono">
                      {dock.totalOccupiedMinutesToday} min
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 font-mono">
                      {dock.totalIdleMinutesToday} min
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full ${
                              efficiencyRate >= 70 ? 'bg-emerald-500' : 'bg-cyan-500'
                            }`}
                            style={{ width: `${efficiencyRate}%` }}
                          />
                        </div>
                        <span className="font-mono text-[11px] text-slate-300">
                          {efficiencyRate}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
