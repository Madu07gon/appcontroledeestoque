import React, { useState } from 'react';
import {
  Truck,
  Users,
  PlusCircle,
  Shield,
  Phone,
  FileCheck,
  Search,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { Vehicle, DriverOrUser, CargoType, UserRole } from '../types';

interface VehiclesAndDriversViewProps {
  vehicles: Vehicle[];
  drivers: DriverOrUser[];
  onAddVehicle: (v: Omit<Vehicle, 'id' | 'createdAt'>) => Promise<void>;
  onAddDriver: (d: Omit<DriverOrUser, 'id'>) => Promise<void>;
}

export const VehiclesAndDriversView: React.FC<VehiclesAndDriversViewProps> = ({
  vehicles,
  drivers,
  onAddVehicle,
  onAddDriver,
}) => {
  const [subTab, setSubTab] = useState<'veiculos' | 'motoristas'>('veiculos');
  const [search, setSearch] = useState('');
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showDriverModal, setShowDriverModal] = useState(false);

  // New vehicle form
  const [vPlate, setVPlate] = useState('');
  const [vModel, setVModel] = useState('Scania R450');
  const [vTons, setVTons] = useState('32');
  const [vM3, setVM3] = useState('90');
  const [vCargo, setVCargo] = useState<CargoType>('paletizada');
  const [vCarrier, setVCarrier] = useState('TransBrasil');
  const [vDriver, setVDriver] = useState('');

  // New driver form
  const [dName, setDName] = useState('');
  const [dDoc, setDDoc] = useState('');
  const [dPhone, setDPhone] = useState('');
  const [dRole, setDRole] = useState<UserRole>('operador');
  const [dBadge, setDBadge] = useState('');

  const handleCreateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vPlate) return;
    await onAddVehicle({
      plate: vPlate.toUpperCase().trim(),
      model: vModel,
      capacityTons: Number(vTons) || 25,
      capacityM3: Number(vM3) || 70,
      cargoType: vCargo,
      carrier: vCarrier,
      status: 'liberado',
      driverName: vDriver || 'Não alocado',
      driverDocument: '',
    });
    setVPlate('');
    setVDriver('');
    setShowVehicleModal(false);
  };

  const handleCreateDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dName) return;
    await onAddDriver({
      name: dName,
      document: dDoc || '000.000.000-00',
      phone: dPhone || '(11) 90000-0000',
      role: dRole,
      badgeCode: dBadge || `OP-${Math.floor(100 + Math.random() * 900)}`,
      status: 'ativo',
    });
    setDName('');
    setDDoc('');
    setDPhone('');
    setDBadge('');
    setShowDriverModal(false);
  };

  const filteredVehicles = vehicles.filter(
    (v) =>
      v.plate.toLowerCase().includes(search.toLowerCase()) ||
      v.model.toLowerCase().includes(search.toLowerCase()) ||
      v.carrier.toLowerCase().includes(search.toLowerCase()),
  );

  const filteredDrivers = drivers.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.badgeCode.toLowerCase().includes(search.toLowerCase()) ||
      d.role.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white tracking-tight">
              Gestão de Frota, Acessos & Operadores
            </h2>
            <p className="text-xs text-slate-400">
              Controle cadastral de caminhões autorizados, motoristas parceiros e níveis de permissão
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {subTab === 'veiculos' ? (
            <button
              id="btn-add-vehicle"
              onClick={() => setShowVehicleModal(true)}
              className="px-3.5 py-2 rounded-xl font-bold text-xs text-white bg-cyan-600 hover:bg-cyan-500 shadow transition flex items-center space-x-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Novo Veículo</span>
            </button>
          ) : (
            <button
              id="btn-add-driver"
              onClick={() => setShowDriverModal(true)}
              className="px-3.5 py-2 rounded-xl font-bold text-xs text-white bg-cyan-600 hover:bg-cyan-500 shadow transition flex items-center space-x-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Novo Operador/Motorista</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex space-x-2 text-xs font-semibold">
          <button
            onClick={() => setSubTab('veiculos')}
            className={`px-4 py-2 rounded-xl transition flex items-center space-x-2 ${
              subTab === 'veiculos'
                ? 'bg-cyan-600 text-white shadow'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Veículos Cadastrados ({vehicles.length})</span>
          </button>
          <button
            onClick={() => setSubTab('motoristas')}
            className={`px-4 py-2 rounded-xl transition flex items-center space-x-2 ${
              subTab === 'motoristas'
                ? 'bg-cyan-600 text-white shadow'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Motoristas & Operadores ({drivers.length})</span>
          </button>
        </div>

        <div className="relative w-full sm:w-64 text-xs">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-white focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Tables */}
      {subTab === 'veiculos' ? (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-800/80 text-slate-400 border-b border-slate-700/80">
                  <th className="py-3 px-4 font-bold">Placa</th>
                  <th className="py-3 px-4 font-bold">Modelo</th>
                  <th className="py-3 px-4 font-bold">Capacidade (Tons / M³)</th>
                  <th className="py-3 px-4 font-bold">Tipo de Carga</th>
                  <th className="py-3 px-4 font-bold">Transportadora</th>
                  <th className="py-3 px-4 font-bold">Motorista Vinculado</th>
                  <th className="py-3 px-4 font-bold">Status Atual</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {filteredVehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono font-bold text-cyan-300">
                      {v.plate}
                    </td>
                    <td className="py-3 px-4 font-semibold text-white">{v.model}</td>
                    <td className="py-3 px-4 font-mono">
                      {v.capacityTons}t / {v.capacityM3}m³
                    </td>
                    <td className="py-3 px-4 capitalize">{v.cargoType}</td>
                    <td className="py-3 px-4">{v.carrier}</td>
                    <td className="py-3 px-4">{v.driverName || 'Avulso'}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          v.status === 'em_doca'
                            ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                            : v.status === 'no_patio'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {v.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-800/80 text-slate-400 border-b border-slate-700/80">
                  <th className="py-3 px-4 font-bold">Crachá / Matrícula</th>
                  <th className="py-3 px-4 font-bold">Nome Completo</th>
                  <th className="py-3 px-4 font-bold">Documento (CPF)</th>
                  <th className="py-3 px-4 font-bold">Telefone</th>
                  <th className="py-3 px-4 font-bold">Perfil de Acesso</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {filteredDrivers.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono font-bold text-cyan-300">
                      {d.badgeCode}
                    </td>
                    <td className="py-3 px-4 font-semibold text-white">{d.name}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">{d.document}</td>
                    <td className="py-3 px-4 text-slate-400">{d.phone}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          d.role === 'admin'
                            ? 'bg-purple-950 text-purple-300 border border-purple-800'
                            : d.role === 'gerente'
                            ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {d.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 uppercase">
                        {d.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Vehicle Modal */}
      {showVehicleModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Cadastrar Novo Veículo</h3>
              <button onClick={() => setShowVehicleModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateVehicle} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Placa *</label>
                <input
                  type="text"
                  required
                  value={vPlate}
                  onChange={(e) => setVPlate(e.target.value.toUpperCase())}
                  placeholder="Ex: BRA2E19"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono uppercase"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1">Modelo</label>
                  <input
                    type="text"
                    value={vModel}
                    onChange={(e) => setVModel(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Transportadora</label>
                  <input
                    type="text"
                    value={vCarrier}
                    onChange={(e) => setVCarrier(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1">Capacidade (Tons)</label>
                  <input
                    type="number"
                    value={vTons}
                    onChange={(e) => setVTons(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Tipo de Carga</label>
                  <select
                    value={vCargo}
                    onChange={(e) => setVCargo(e.target.value as CargoType)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-2 text-white"
                  >
                    <option value="paletizada">Paletizada</option>
                    <option value="seca">Seca</option>
                    <option value="refrigerada">Refrigerada</option>
                    <option value="fracionada">Fracionada</option>
                    <option value="perigosa">Perigosa</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Motorista Padrão</label>
                <input
                  type="text"
                  value={vDriver}
                  onChange={(e) => setVDriver(e.target.value)}
                  placeholder="Nome do condutor principal"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl font-bold text-white bg-cyan-600 hover:bg-cyan-500 shadow mt-2"
              >
                Salvar Veículo
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Driver Modal */}
      {showDriverModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Cadastrar Operador ou Motorista</h3>
              <button onClick={() => setShowDriverModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateDriver} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={dName}
                  onChange={(e) => setDName(e.target.value)}
                  placeholder="Ex: João da Silva"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1">Documento (CPF/CNH)</label>
                  <input
                    type="text"
                    value={dDoc}
                    onChange={(e) => setDDoc(e.target.value)}
                    placeholder="000.000.000-00"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Telefone</label>
                  <input
                    type="text"
                    value={dPhone}
                    onChange={(e) => setDPhone(e.target.value)}
                    placeholder="(11) 98888-7777"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1">Perfil de Permissão</label>
                  <select
                    value={dRole}
                    onChange={(e) => setDRole(e.target.value as UserRole)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-2 text-white"
                  >
                    <option value="operador">Operador de Doca</option>
                    <option value="gerente">Gerente de Pátio</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Crachá / Matrícula</label>
                  <input
                    type="text"
                    value={dBadge}
                    onChange={(e) => setDBadge(e.target.value)}
                    placeholder="Ex: OP-105"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl font-bold text-white bg-cyan-600 hover:bg-cyan-500 shadow mt-2"
              >
                Salvar Operador
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
