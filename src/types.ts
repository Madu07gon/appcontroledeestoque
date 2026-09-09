export type DockStatus = 'livre' | 'ocupada' | 'em_carregamento' | 'em_descarregamento' | 'manutencao';

export type CargoType = 'seca' | 'refrigerada' | 'fracionada' | 'perigosa' | 'paletizada';

export type OperationType = 'carregamento' | 'descarregamento';

export type UserRole = 'admin' | 'gerente' | 'operador';

export interface DockOperation {
  vehicleId: string;
  plate: string;
  driverName: string;
  operationType: OperationType;
  cargoType: CargoType;
  startedAt: string; // ISO string
  estimatedDurationMinutes: number;
  targetCompletionAt: string; // ISO string
  notes?: string;
}

export interface Dock {
  id: string; // e.g. "doca-1"
  number: number; // 1 to 14
  name: string; // "Doca 01"
  type: 'geral' | 'refrigerada' | 'expresso' | 'pesada';
  status: DockStatus;
  currentOperation?: DockOperation;
  totalOperationsToday: number;
  totalOccupiedMinutesToday: number;
  totalIdleMinutesToday: number;
  lastStatusChange: string;
  maxWeightTons: number;
  hasHydraulicRamp: boolean;
  equipmentAlert?: string;
}

export interface Vehicle {
  id: string;
  plate: string;
  model: string;
  capacityTons: number;
  capacityM3: number;
  cargoType: CargoType;
  carrier: string; // Transportadora / Proprietário
  status: 'no_patio' | 'em_doca' | 'em_viagem' | 'liberado';
  driverName: string;
  driverDocument: string;
  createdAt: string;
}

export interface DriverOrUser {
  id: string;
  name: string;
  document: string;
  phone: string;
  role: UserRole;
  badgeCode: string;
  status: 'ativo' | 'em_transito' | 'em_descanso';
  assignedVehiclePlate?: string;
}

export interface QueueItem {
  id: string;
  movementId: string;
  vehiclePlate: string;
  vehicleModel: string;
  driverName: string;
  cargoType: CargoType;
  operationType: OperationType;
  priority: 'normal' | 'alta' | 'urgente';
  arrivalTime: string;
  recommendedDockNumber?: number;
  estimatedWaitMinutes: number;
}

export interface MovementRecord {
  id: string;
  vehiclePlate: string;
  vehicleModel: string;
  driverName: string;
  driverDocument?: string;
  dockNumber?: number;
  dockId?: string;
  operationType: OperationType;
  cargoType: CargoType;
  gateEntryTime: string; // Automatic arrival timestamp
  dockAssignmentTime?: string; // Dock entry
  dockReleaseTime?: string; // Dock exit
  gateExitTime?: string; // Gate exit / completed
  totalYardMinutes: number;
  totalDockMinutes: number;
  status: 'fila_espera' | 'operando_doca' | 'concluido' | 'cancelado';
  operatorName: string;
  delayMinutes?: number;
  notes?: string;
}

export interface OperationalKPIs {
  averageOccupancyRate: number; // %
  averageDockStayMinutes: number; // Minutes
  totalProcessedVehicles: number;
  activeDocksCount: number;
  idleDocksCount: number;
  maintenanceDocksCount: number;
  operationalEfficiency: number; // % (active vs 14 total)
  vehiclesInQueue: number;
  delayedOperationsCount: number;
  bottlenecks: { hour: string; count: number; delayed: number }[];
  turnPerformance: { turn: string; vehicles: number; avgTimeMinutes: number }[];
  cargoDistribution: { type: CargoType; count: number; percentage: number }[];
}

export interface Recommendation {
  id: string;
  type: 'redistribuicao' | 'gargalo' | 'janela_otima' | 'alerta_atraso' | 'manutencao' | 'procedimento_ineficiente';
  severity: 'alta' | 'media' | 'informativa';
  title: string;
  description: string;
  suggestedAction: string;
  targetDockNumber?: number;
  impact: string;
  timestamp: string;
  applied?: boolean;
}

export interface SystemState {
  docks: Dock[];
  queue: QueueItem[];
  vehicles: Vehicle[];
  drivers: DriverOrUser[];
  movements: MovementRecord[];
  kpis: OperationalKPIs;
  recommendations: Recommendation[];
  lastBackupAt?: string;
  systemVersion: string;
}

export interface CurrentUser {
  id: string;
  name: string;
  role: UserRole;
  badgeCode: string;
}
