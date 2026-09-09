import fs from 'fs';
import path from 'path';
import {
  Dock,
  Vehicle,
  DriverOrUser,
  QueueItem,
  MovementRecord,
  SystemState,
  OperationalKPIs,
  Recommendation,
  OperationType,
  CargoType,
  DockStatus,
} from '../src/types';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'depot_state.json');

// Helper for initial seed data
function generateInitialState(): SystemState {
  const now = new Date();
  const getPastTime = (minutesAgo: number) =>
    new Date(now.getTime() - minutesAgo * 60 * 1000).toISOString();
  const getFutureTime = (minutesAhead: number) =>
    new Date(now.getTime() + minutesAhead * 60 * 1000).toISOString();

  // 14 Docks with realistic logistical layout
  const docks: Dock[] = [
    {
      id: 'doca-1',
      number: 1,
      name: 'Doca 01',
      type: 'geral',
      status: 'em_descarregamento',
      maxWeightTons: 40,
      hasHydraulicRamp: true,
      lastStatusChange: getPastTime(35),
      totalOperationsToday: 4,
      totalOccupiedMinutesToday: 185,
      totalIdleMinutesToday: 45,
      currentOperation: {
        vehicleId: 'veh-1',
        plate: 'BRA2E19',
        driverName: 'Carlos Silva',
        operationType: 'descarregamento',
        cargoType: 'paletizada',
        startedAt: getPastTime(35),
        estimatedDurationMinutes: 45,
        targetCompletionAt: getFutureTime(10),
        notes: 'Carga de autopeças paletizadas - conferência rápida',
      },
    },
    {
      id: 'doca-2',
      number: 2,
      name: 'Doca 02',
      type: 'refrigerada',
      status: 'em_descarregamento',
      maxWeightTons: 35,
      hasHydraulicRamp: true,
      lastStatusChange: getPastTime(55),
      totalOperationsToday: 3,
      totalOccupiedMinutesToday: 190,
      totalIdleMinutesToday: 30,
      currentOperation: {
        vehicleId: 'veh-2',
        plate: 'SPK9A88',
        driverName: 'Marcos Vinicius',
        operationType: 'descarregamento',
        cargoType: 'refrigerada',
        startedAt: getPastTime(55),
        estimatedDurationMinutes: 40,
        targetCompletionAt: getPastTime(15), // DELAYED!
        notes: 'Carga congelada - conferência térmica em andamento',
      },
      equipmentAlert: 'Atraso operacional: excedeu tempo previsto em 15 min',
    },
    {
      id: 'doca-3',
      number: 3,
      name: 'Doca 03',
      type: 'geral',
      status: 'livre',
      maxWeightTons: 40,
      hasHydraulicRamp: true,
      lastStatusChange: getPastTime(20),
      totalOperationsToday: 5,
      totalOccupiedMinutesToday: 210,
      totalIdleMinutesToday: 50,
    },
    {
      id: 'doca-4',
      number: 4,
      name: 'Doca 04',
      type: 'expresso',
      status: 'em_carregamento',
      maxWeightTons: 20,
      hasHydraulicRamp: false,
      lastStatusChange: getPastTime(15),
      totalOperationsToday: 6,
      totalOccupiedMinutesToday: 160,
      totalIdleMinutesToday: 60,
      currentOperation: {
        vehicleId: 'veh-3',
        plate: 'RTO8F22',
        driverName: 'Juliana Mendes',
        operationType: 'carregamento',
        cargoType: 'fracionada',
        startedAt: getPastTime(15),
        estimatedDurationMinutes: 30,
        targetCompletionAt: getFutureTime(15),
        notes: 'Expedição expressa para rota capital',
      },
    },
    {
      id: 'doca-5',
      number: 5,
      name: 'Doca 05',
      type: 'pesada',
      status: 'manutencao',
      maxWeightTons: 60,
      hasHydraulicRamp: true,
      lastStatusChange: getPastTime(120),
      totalOperationsToday: 1,
      totalOccupiedMinutesToday: 40,
      totalIdleMinutesToday: 180,
      equipmentAlert: 'Manutenção preventiva da rampa hidráulica em andamento',
    },
    {
      id: 'doca-6',
      number: 6,
      name: 'Doca 06',
      type: 'geral',
      status: 'em_carregamento',
      maxWeightTons: 40,
      hasHydraulicRamp: true,
      lastStatusChange: getPastTime(25),
      totalOperationsToday: 4,
      totalOccupiedMinutesToday: 175,
      totalIdleMinutesToday: 55,
      currentOperation: {
        vehicleId: 'veh-4',
        plate: 'MGX3C44',
        driverName: 'Roberto Albuquerque',
        operationType: 'carregamento',
        cargoType: 'seca',
        startedAt: getPastTime(25),
        estimatedDurationMinutes: 50,
        targetCompletionAt: getFutureTime(25),
        notes: 'Carregamento de grãos e cereais secos',
      },
    },
    {
      id: 'doca-7',
      number: 7,
      name: 'Doca 07',
      type: 'refrigerada',
      status: 'livre',
      maxWeightTons: 35,
      hasHydraulicRamp: true,
      lastStatusChange: getPastTime(40),
      totalOperationsToday: 3,
      totalOccupiedMinutesToday: 140,
      totalIdleMinutesToday: 90,
    },
    {
      id: 'doca-8',
      number: 8,
      name: 'Doca 08',
      type: 'geral',
      status: 'ocupada',
      maxWeightTons: 40,
      hasHydraulicRamp: true,
      lastStatusChange: getPastTime(8),
      totalOperationsToday: 4,
      totalOccupiedMinutesToday: 155,
      totalIdleMinutesToday: 65,
      currentOperation: {
        vehicleId: 'veh-5',
        plate: 'PRT7B11',
        driverName: 'Fernando Ramos',
        operationType: 'descarregamento',
        cargoType: 'paletizada',
        startedAt: getPastTime(8),
        estimatedDurationMinutes: 40,
        targetCompletionAt: getFutureTime(32),
        notes: 'Aguardando liberação de documentação fiscal',
      },
    },
    {
      id: 'doca-9',
      number: 9,
      name: 'Doca 09',
      type: 'expresso',
      status: 'livre',
      maxWeightTons: 20,
      hasHydraulicRamp: false,
      lastStatusChange: getPastTime(10),
      totalOperationsToday: 5,
      totalOccupiedMinutesToday: 150,
      totalIdleMinutesToday: 70,
    },
    {
      id: 'doca-10',
      number: 10,
      name: 'Doca 10',
      type: 'geral',
      status: 'em_descarregamento',
      maxWeightTons: 40,
      hasHydraulicRamp: true,
      lastStatusChange: getPastTime(20),
      totalOperationsToday: 3,
      totalOccupiedMinutesToday: 130,
      totalIdleMinutesToday: 80,
      currentOperation: {
        vehicleId: 'veh-6',
        plate: 'KLO4D99',
        driverName: 'André Santos',
        operationType: 'descarregamento',
        cargoType: 'seca',
        startedAt: getPastTime(20),
        estimatedDurationMinutes: 35,
        targetCompletionAt: getFutureTime(15),
        notes: 'Bobinas de celulose - manuseio especial com empilhadeira',
      },
    },
    {
      id: 'doca-11',
      number: 11,
      name: 'Doca 11',
      type: 'geral',
      status: 'livre',
      maxWeightTons: 40,
      hasHydraulicRamp: true,
      lastStatusChange: getPastTime(70),
      totalOperationsToday: 2,
      totalOccupiedMinutesToday: 90,
      totalIdleMinutesToday: 130,
    },
    {
      id: 'doca-12',
      number: 12,
      name: 'Doca 12',
      type: 'pesada',
      status: 'em_carregamento',
      maxWeightTons: 60,
      hasHydraulicRamp: true,
      lastStatusChange: getPastTime(42),
      totalOperationsToday: 2,
      totalOccupiedMinutesToday: 120,
      totalIdleMinutesToday: 90,
      currentOperation: {
        vehicleId: 'veh-7',
        plate: 'ABC9J12',
        driverName: 'Gilberto Nogueira',
        operationType: 'carregamento',
        cargoType: 'perigosa',
        startedAt: getPastTime(42),
        estimatedDurationMinutes: 60,
        targetCompletionAt: getFutureTime(18),
        notes: 'Produtos químicos classificados - protocolo de segurança EPI ativo',
      },
    },
    {
      id: 'doca-13',
      number: 13,
      name: 'Doca 13',
      type: 'geral',
      status: 'livre',
      maxWeightTons: 40,
      hasHydraulicRamp: true,
      lastStatusChange: getPastTime(15),
      totalOperationsToday: 4,
      totalOccupiedMinutesToday: 160,
      totalIdleMinutesToday: 60,
    },
    {
      id: 'doca-14',
      number: 14,
      name: 'Doca 14',
      type: 'expresso',
      status: 'livre',
      maxWeightTons: 20,
      hasHydraulicRamp: false,
      lastStatusChange: getPastTime(25),
      totalOperationsToday: 5,
      totalOccupiedMinutesToday: 145,
      totalIdleMinutesToday: 75,
    },
  ];

  // Vehicles in fleet & partner transport
  const vehicles: Vehicle[] = [
    {
      id: 'veh-1',
      plate: 'BRA2E19',
      model: 'Scania R450 6x2',
      capacityTons: 32,
      capacityM3: 90,
      cargoType: 'paletizada',
      carrier: 'TransBrasil Logística',
      status: 'em_doca',
      driverName: 'Carlos Silva',
      driverDocument: '284.912.833-01',
      createdAt: getPastTime(600),
    },
    {
      id: 'veh-2',
      plate: 'SPK9A88',
      model: 'Volvo FH 540 Globetrotter',
      capacityTons: 35,
      capacityM3: 105,
      cargoType: 'refrigerada',
      carrier: 'FrioCargas Express',
      status: 'em_doca',
      driverName: 'Marcos Vinicius',
      driverDocument: '143.722.910-44',
      createdAt: getPastTime(550),
    },
    {
      id: 'veh-3',
      plate: 'RTO8F22',
      model: 'VW Delivery 11.180',
      capacityTons: 11,
      capacityM3: 42,
      cargoType: 'fracionada',
      carrier: 'Frota Própria Depósito',
      status: 'em_doca',
      driverName: 'Juliana Mendes',
      driverDocument: '332.901.442-12',
      createdAt: getPastTime(480),
    },
    {
      id: 'veh-4',
      plate: 'MGX3C44',
      model: 'Mercedes-Benz Actros 2651',
      capacityTons: 38,
      capacityM3: 95,
      cargoType: 'seca',
      carrier: 'RodoMinas Transportes',
      status: 'em_doca',
      driverName: 'Roberto Albuquerque',
      driverDocument: '098.341.229-88',
      createdAt: getPastTime(420),
    },
    {
      id: 'veh-5',
      plate: 'PRT7B11',
      model: 'DAF XF 530',
      capacityTons: 36,
      capacityM3: 98,
      cargoType: 'paletizada',
      carrier: 'TransSul Express',
      status: 'em_doca',
      driverName: 'Fernando Ramos',
      driverDocument: '554.120.763-90',
      createdAt: getPastTime(390),
    },
    {
      id: 'veh-6',
      plate: 'KLO4D99',
      model: 'Iveco Stralis 440',
      capacityTons: 30,
      capacityM3: 88,
      cargoType: 'seca',
      carrier: 'Cargas Brasil Central',
      status: 'em_doca',
      driverName: 'André Santos',
      driverDocument: '441.879.330-21',
      createdAt: getPastTime(350),
    },
    {
      id: 'veh-7',
      plate: 'ABC9J12',
      model: 'Volvo FM 380',
      capacityTons: 28,
      capacityM3: 75,
      cargoType: 'perigosa',
      carrier: 'QuímicaExpress Soluções',
      status: 'em_doca',
      driverName: 'Gilberto Nogueira',
      driverDocument: '221.654.981-33',
      createdAt: getPastTime(300),
    },
    {
      id: 'veh-8',
      plate: 'XYZ3H55',
      model: 'Scania P310 Bitruck',
      capacityTons: 19,
      capacityM3: 60,
      cargoType: 'refrigerada',
      carrier: 'Laticínios Alvorada',
      status: 'no_patio',
      driverName: 'Edivaldo Pereira',
      driverDocument: '772.339.118-05',
      createdAt: getPastTime(50),
    },
    {
      id: 'veh-9',
      plate: 'QWE1K22',
      model: 'Mercedes-Benz Atego 2426',
      capacityTons: 17,
      capacityM3: 55,
      cargoType: 'fracionada',
      carrier: 'Jamef Transportes',
      status: 'no_patio',
      driverName: 'Lucas Ferreira',
      driverDocument: '661.229.400-55',
      createdAt: getPastTime(35),
    },
    {
      id: 'veh-10',
      plate: 'BHZ4P90',
      model: 'Volvo FH 460',
      capacityTons: 34,
      capacityM3: 92,
      cargoType: 'seca',
      carrier: 'Expresso São Miguel',
      status: 'no_patio',
      driverName: 'Renato Vasconcelos',
      driverDocument: '119.882.341-99',
      createdAt: getPastTime(18),
    },
  ];

  // Drivers & Operators
  const drivers: DriverOrUser[] = [
    {
      id: 'drv-1',
      name: 'Carlos Silva',
      document: '284.912.833-01',
      phone: '(11) 98721-3301',
      role: 'operador',
      badgeCode: 'OP-101',
      status: 'ativo',
      assignedVehiclePlate: 'BRA2E19',
    },
    {
      id: 'drv-2',
      name: 'Marcos Vinicius',
      document: '143.722.910-44',
      phone: '(19) 99120-4491',
      role: 'operador',
      badgeCode: 'OP-102',
      status: 'ativo',
      assignedVehiclePlate: 'SPK9A88',
    },
    {
      id: 'drv-3',
      name: 'Juliana Mendes',
      document: '332.901.442-12',
      phone: '(11) 97412-8822',
      role: 'operador',
      badgeCode: 'OP-103',
      status: 'ativo',
      assignedVehiclePlate: 'RTO8F22',
    },
    {
      id: 'drv-4',
      name: 'Ana Cláudia Fontes',
      document: '420.912.331-50',
      phone: '(11) 98112-9900',
      role: 'gerente',
      badgeCode: 'MGR-01',
      status: 'ativo',
    },
    {
      id: 'drv-5',
      name: 'Ricardo Duarte',
      document: '110.823.491-00',
      phone: '(11) 99933-2211',
      role: 'admin',
      badgeCode: 'ADM-01',
      status: 'ativo',
    },
  ];

  // Waiting Queue in Yard
  const queue: QueueItem[] = [
    {
      id: 'q-1',
      movementId: 'mov-108',
      vehiclePlate: 'XYZ3H55',
      vehicleModel: 'Scania P310 Bitruck',
      driverName: 'Edivaldo Pereira',
      cargoType: 'refrigerada',
      operationType: 'descarregamento',
      priority: 'alta', // Refrigerated is priority
      arrivalTime: getPastTime(45),
      recommendedDockNumber: 7, // Doca 07 is livre and refrigerada!
      estimatedWaitMinutes: 5,
    },
    {
      id: 'q-2',
      movementId: 'mov-109',
      vehiclePlate: 'QWE1K22',
      vehicleModel: 'Mercedes-Benz Atego 2426',
      driverName: 'Lucas Ferreira',
      cargoType: 'fracionada',
      operationType: 'carregamento',
      priority: 'normal',
      arrivalTime: getPastTime(30),
      recommendedDockNumber: 9, // Doca 09 is livre and expresso!
      estimatedWaitMinutes: 10,
    },
    {
      id: 'q-3',
      movementId: 'mov-110',
      vehiclePlate: 'BHZ4P90',
      vehicleModel: 'Volvo FH 460',
      driverName: 'Renato Vasconcelos',
      cargoType: 'seca',
      operationType: 'descarregamento',
      priority: 'normal',
      arrivalTime: getPastTime(15),
      recommendedDockNumber: 3, // Doca 03 is livre
      estimatedWaitMinutes: 12,
    },
  ];

  // Movements (history of today)
  const movements: MovementRecord[] = [
    {
      id: 'mov-101',
      vehiclePlate: 'BRA2E19',
      vehicleModel: 'Scania R450 6x2',
      driverName: 'Carlos Silva',
      driverDocument: '284.912.833-01',
      dockNumber: 1,
      dockId: 'doca-1',
      operationType: 'descarregamento',
      cargoType: 'paletizada',
      gateEntryTime: getPastTime(50),
      dockAssignmentTime: getPastTime(35),
      totalYardMinutes: 50,
      totalDockMinutes: 35,
      status: 'operando_doca',
      operatorName: 'Rodrigo Pires (Pátio)',
    },
    {
      id: 'mov-102',
      vehiclePlate: 'SPK9A88',
      vehicleModel: 'Volvo FH 540 Globetrotter',
      driverName: 'Marcos Vinicius',
      driverDocument: '143.722.910-44',
      dockNumber: 2,
      dockId: 'doca-2',
      operationType: 'descarregamento',
      cargoType: 'refrigerada',
      gateEntryTime: getPastTime(75),
      dockAssignmentTime: getPastTime(55),
      totalYardMinutes: 75,
      totalDockMinutes: 55,
      status: 'operando_doca',
      operatorName: 'Rodrigo Pires (Pátio)',
      delayMinutes: 15,
      notes: 'Atraso na liberação sanitária da carga fria',
    },
    {
      id: 'mov-103',
      vehiclePlate: 'RTO8F22',
      vehicleModel: 'VW Delivery 11.180',
      driverName: 'Juliana Mendes',
      driverDocument: '332.901.442-12',
      dockNumber: 4,
      dockId: 'doca-4',
      operationType: 'carregamento',
      cargoType: 'fracionada',
      gateEntryTime: getPastTime(25),
      dockAssignmentTime: getPastTime(15),
      totalYardMinutes: 25,
      totalDockMinutes: 15,
      status: 'operando_doca',
      operatorName: 'Valter Silva (Docas)',
    },
    {
      id: 'mov-104',
      vehiclePlate: 'MGX3C44',
      vehicleModel: 'Mercedes-Benz Actros 2651',
      driverName: 'Roberto Albuquerque',
      driverDocument: '098.341.229-88',
      dockNumber: 6,
      dockId: 'doca-6',
      operationType: 'carregamento',
      cargoType: 'seca',
      gateEntryTime: getPastTime(40),
      dockAssignmentTime: getPastTime(25),
      totalYardMinutes: 40,
      totalDockMinutes: 25,
      status: 'operando_doca',
      operatorName: 'Valter Silva (Docas)',
    },
    {
      id: 'mov-105',
      vehiclePlate: 'PRT7B11',
      vehicleModel: 'DAF XF 530',
      driverName: 'Fernando Ramos',
      driverDocument: '554.120.763-90',
      dockNumber: 8,
      dockId: 'doca-8',
      operationType: 'descarregamento',
      cargoType: 'paletizada',
      gateEntryTime: getPastTime(20),
      dockAssignmentTime: getPastTime(8),
      totalYardMinutes: 20,
      totalDockMinutes: 8,
      status: 'operando_doca',
      operatorName: 'Rodrigo Pires (Pátio)',
    },
    {
      id: 'mov-106',
      vehiclePlate: 'KLO4D99',
      vehicleModel: 'Iveco Stralis 440',
      driverName: 'André Santos',
      driverDocument: '441.879.330-21',
      dockNumber: 10,
      dockId: 'doca-10',
      operationType: 'descarregamento',
      cargoType: 'seca',
      gateEntryTime: getPastTime(35),
      dockAssignmentTime: getPastTime(20),
      totalYardMinutes: 35,
      totalDockMinutes: 20,
      status: 'operando_doca',
      operatorName: 'Valter Silva (Docas)',
    },
    {
      id: 'mov-107',
      vehiclePlate: 'ABC9J12',
      vehicleModel: 'Volvo FM 380',
      driverName: 'Gilberto Nogueira',
      driverDocument: '221.654.981-33',
      dockNumber: 12,
      dockId: 'doca-12',
      operationType: 'carregamento',
      cargoType: 'perigosa',
      gateEntryTime: getPastTime(60),
      dockAssignmentTime: getPastTime(42),
      totalYardMinutes: 60,
      totalDockMinutes: 42,
      status: 'operando_doca',
      operatorName: 'Valter Silva (Docas)',
    },
    // Past completed operations today
    {
      id: 'mov-095',
      vehiclePlate: 'JHG5T88',
      vehicleModel: 'Volvo FH 460',
      driverName: 'Marcio Santos',
      dockNumber: 3,
      dockId: 'doca-3',
      operationType: 'descarregamento',
      cargoType: 'paletizada',
      gateEntryTime: getPastTime(160),
      dockAssignmentTime: getPastTime(140),
      dockReleaseTime: getPastTime(95),
      gateExitTime: getPastTime(85),
      totalYardMinutes: 75,
      totalDockMinutes: 45,
      status: 'concluido',
      operatorName: 'Valter Silva (Docas)',
    },
    {
      id: 'mov-096',
      vehiclePlate: 'POI9U33',
      vehicleModel: 'VW Constellation 24.280',
      driverName: 'Tiago Souza',
      dockNumber: 7,
      dockId: 'doca-7',
      operationType: 'carregamento',
      cargoType: 'refrigerada',
      gateEntryTime: getPastTime(190),
      dockAssignmentTime: getPastTime(160),
      dockReleaseTime: getPastTime(110),
      gateExitTime: getPastTime(100),
      totalYardMinutes: 90,
      totalDockMinutes: 50,
      status: 'concluido',
      operatorName: 'Rodrigo Pires (Pátio)',
    },
    {
      id: 'mov-097',
      vehiclePlate: 'TRW4M10',
      vehicleModel: 'Mercedes-Benz Accelo 1016',
      driverName: 'Leonardo Cruz',
      dockNumber: 9,
      dockId: 'doca-9',
      operationType: 'descarregamento',
      cargoType: 'fracionada',
      gateEntryTime: getPastTime(140),
      dockAssignmentTime: getPastTime(120),
      dockReleaseTime: getPastTime(90),
      gateExitTime: getPastTime(80),
      totalYardMinutes: 60,
      totalDockMinutes: 30,
      status: 'concluido',
      operatorName: 'Rodrigo Pires (Pátio)',
    },
    {
      id: 'mov-098',
      vehiclePlate: 'BNM7C81',
      vehicleModel: 'Scania R440',
      driverName: 'Paulo Cesar',
      dockNumber: 11,
      dockId: 'doca-11',
      operationType: 'descarregamento',
      cargoType: 'seca',
      gateEntryTime: getPastTime(180),
      dockAssignmentTime: getPastTime(155),
      dockReleaseTime: getPastTime(115),
      gateExitTime: getPastTime(105),
      totalYardMinutes: 75,
      totalDockMinutes: 40,
      status: 'concluido',
      operatorName: 'Valter Silva (Docas)',
    },
    {
      id: 'mov-099',
      vehiclePlate: 'GHJ8Y29',
      vehicleModel: 'Iveco Daily 35S14',
      driverName: 'Felipe Santana',
      dockNumber: 14,
      dockId: 'doca-14',
      operationType: 'carregamento',
      cargoType: 'fracionada',
      gateEntryTime: getPastTime(120),
      dockAssignmentTime: getPastTime(100),
      dockReleaseTime: getPastTime(75),
      gateExitTime: getPastTime(65),
      totalYardMinutes: 55,
      totalDockMinutes: 25,
      status: 'concluido',
      operatorName: 'Rodrigo Pires (Pátio)',
    },
    // Vehicles in queue
    {
      id: 'mov-108',
      vehiclePlate: 'XYZ3H55',
      vehicleModel: 'Scania P310 Bitruck',
      driverName: 'Edivaldo Pereira',
      operationType: 'descarregamento',
      cargoType: 'refrigerada',
      gateEntryTime: getPastTime(45),
      totalYardMinutes: 45,
      totalDockMinutes: 0,
      status: 'fila_espera',
      operatorName: 'Portaria Principal',
    },
    {
      id: 'mov-109',
      vehiclePlate: 'QWE1K22',
      vehicleModel: 'Mercedes-Benz Atego 2426',
      driverName: 'Lucas Ferreira',
      operationType: 'carregamento',
      cargoType: 'fracionada',
      gateEntryTime: getPastTime(30),
      totalYardMinutes: 30,
      totalDockMinutes: 0,
      status: 'fila_espera',
      operatorName: 'Portaria Principal',
    },
    {
      id: 'mov-110',
      vehiclePlate: 'BHZ4P90',
      vehicleModel: 'Volvo FH 460',
      driverName: 'Renato Vasconcelos',
      operationType: 'descarregamento',
      cargoType: 'seca',
      gateEntryTime: getPastTime(15),
      totalYardMinutes: 15,
      totalDockMinutes: 0,
      status: 'fila_espera',
      operatorName: 'Portaria Principal',
    },
  ];

  return {
    docks,
    queue,
    vehicles,
    drivers,
    movements,
    kpis: computeKPIs(docks, movements, queue),
    recommendations: generateRecommendations(docks, queue, movements),
    lastBackupAt: new Date().toISOString(),
    systemVersion: '2.4.0',
  };
}

// Compute comprehensive logistics KPIs
export function computeKPIs(
  docks: Dock[],
  movements: MovementRecord[],
  queue: QueueItem[],
): OperationalKPIs {
  const totalDocks = 14;
  const activeDocks = docks.filter(
    (d) => d.status !== 'livre' && d.status !== 'manutencao',
  ).length;
  const maintenanceDocks = docks.filter((d) => d.status === 'manutencao').length;
  const idleDocks = docks.filter((d) => d.status === 'livre').length;

  const operationalEfficiency = Math.round(
    ((totalDocks - maintenanceDocks) / totalDocks) * 100,
  );
  const occupancyRate = Math.round(
    (activeDocks / Math.max(1, totalDocks - maintenanceDocks)) * 100,
  );

  // Completed + active dock stays
  const dockTimes: number[] = [];
  movements.forEach((m) => {
    if (m.totalDockMinutes > 0) {
      dockTimes.push(m.totalDockMinutes);
    }
  });

  const averageDockStay =
    dockTimes.length > 0
      ? Math.round(dockTimes.reduce((a, b) => a + b, 0) / dockTimes.length)
      : 38;

  const totalProcessed = movements.filter((m) => m.status === 'concluido').length;

  // Delayed count
  const delayedOperationsCount = docks.filter((d) => {
    if (!d.currentOperation) return false;
    const target = new Date(d.currentOperation.targetCompletionAt).getTime();
    return Date.now() > target;
  }).length;

  // Hourly bottleneck simulation for today
  const bottlenecks = [
    { hour: '06:00 - 08:00', count: 4, delayed: 0 },
    { hour: '08:00 - 10:00', count: 12, delayed: 3 }, // Peak morning
    { hour: '10:00 - 12:00', count: 9, delayed: 1 },
    { hour: '12:00 - 14:00', count: 6, delayed: 0 },
    { hour: '14:00 - 16:00', count: 14, delayed: 4 }, // Peak afternoon
    { hour: '16:00 - 18:00', count: 8, delayed: 1 },
  ];

  // Turn performance
  const turnPerformance = [
    { turn: 'Turno 1 (06h - 14h)', vehicles: 18, avgTimeMinutes: 37 },
    { turn: 'Turno 2 (14h - 22h)', vehicles: 12, avgTimeMinutes: 44 },
    { turn: 'Turno 3 (22h - 06h)', vehicles: 6, avgTimeMinutes: 29 },
  ];

  // Cargo distribution
  const cargoDistribution = [
    { type: 'paletizada' as CargoType, count: 14, percentage: 38 },
    { type: 'seca' as CargoType, count: 10, percentage: 27 },
    { type: 'refrigerada' as CargoType, count: 6, percentage: 16 },
    { type: 'fracionada' as CargoType, count: 5, percentage: 14 },
    { type: 'perigosa' as CargoType, count: 2, percentage: 5 },
  ];

  return {
    averageOccupancyRate: occupancyRate,
    averageDockStayMinutes: averageDockStay,
    totalProcessedVehicles: totalProcessed + activeDocks,
    activeDocksCount: activeDocks,
    idleDocksCount: idleDocks,
    maintenanceDocksCount: maintenanceDocks,
    operationalEfficiency,
    vehiclesInQueue: queue.length,
    delayedOperationsCount,
    bottlenecks,
    turnPerformance,
    cargoDistribution,
  };
}

// Generate intelligent logistical recommendations and bottleneck warnings
export function generateRecommendations(
  docks: Dock[],
  queue: QueueItem[],
  movements: MovementRecord[],
): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const now = new Date();

  // 1. Check for delayed dock operations
  docks.forEach((d) => {
    if (d.currentOperation) {
      const targetTime = new Date(d.currentOperation.targetCompletionAt).getTime();
      if (now.getTime() > targetTime) {
        const delayMin = Math.round((now.getTime() - targetTime) / (60 * 1000));
        recommendations.push({
          id: `rec-delay-${d.id}`,
          type: 'alerta_atraso',
          severity: 'alta',
          title: `Atraso Crítico na ${d.name} (+${delayMin} min)`,
          description: `O veículo ${d.currentOperation.plate} está excedendo o tempo previsto para ${d.currentOperation.operationType} (${d.currentOperation.estimatedDurationMinutes} min estimados).`,
          suggestedAction: `Acionar operador de pátio para priorizar finalização ou conferência da carga na ${d.name}.`,
          targetDockNumber: d.number,
          impact: 'Elimina efeito dominó na fila do pátio',
          timestamp: new Date().toISOString(),
        });
      }
    }
  });

  // 2. Queue waiting with suitable dock available
  if (queue.length > 0) {
    const refrigQueue = queue.find((q) => q.cargoType === 'refrigerada');
    const freeRefrigDock = docks.find(
      (d) => d.status === 'livre' && d.type === 'refrigerada',
    );

    if (refrigQueue && freeRefrigDock) {
      recommendations.push({
        id: `rec-refrig-${freeRefrigDock.id}`,
        type: 'redistribuicao',
        severity: 'alta',
        title: `Alocação Imediata: Carga Refrigerada na ${freeRefrigDock.name}`,
        description: `O veículo ${refrigQueue.vehiclePlate} (${refrigQueue.cargoType}) está esperando no pátio há ${Math.round(
          (now.getTime() - new Date(refrigQueue.arrivalTime).getTime()) / 60000,
        )} min enquanto a ${freeRefrigDock.name} está pronta.`,
        suggestedAction: `Autorizar entrada imediata do veículo ${refrigQueue.vehiclePlate} para a ${freeRefrigDock.name}.`,
        targetDockNumber: freeRefrigDock.number,
        impact: 'Proteção da integridade da cadeia de frio e redução de espera',
        timestamp: new Date().toISOString(),
      });
    }

    const freeDocks = docks.filter((d) => d.status === 'livre');
    if (freeDocks.length >= 2 && queue.length >= 1) {
      recommendations.push({
        id: 'rec-dispatch-queue',
        type: 'janela_otima',
        severity: 'media',
        title: `Janela Ótima: ${freeDocks.length} Docas Livres Disponíveis`,
        description: `Existem ${queue.length} veículos aguardando triagem e ${freeDocks.length} docas ociosas (${freeDocks.map((d) => d.name).slice(0, 3).join(', ')}).`,
        suggestedAction: 'Fazer chamada dos próximos veículos da triagem pelo painel da portaria.',
        impact: 'Aumento imediato do throughput em até 30%',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // 3. Balance distribution across dock clusters
  const docks1to7Active = docks
    .slice(0, 7)
    .filter((d) => d.status !== 'livre' && d.status !== 'manutencao').length;
  const docks8to14Active = docks
    .slice(7, 14)
    .filter((d) => d.status !== 'livre' && d.status !== 'manutencao').length;

  if (docks1to7Active >= 6 && docks8to14Active <= 3) {
    recommendations.push({
      id: 'rec-cluster-balance',
      type: 'redistribuicao',
      severity: 'media',
      title: 'Desbalanceamento no Fluxo de Pátio (Docas 01 a 07 sobrecarregadas)',
      description: `O cluster oeste (Docas 01-07) está com ${docks1to7Active}/7 docas ocupadas, gerando gargalo na via interna, enquanto o cluster leste (08-14) possui apenas ${docks8to14Active}/7 ocupadas.`,
      suggestedAction: 'Encaminhar os próximos veículos de descarga para as Docas 11, 13 ou 14.',
      impact: 'Eliminação de manobras conflitantes e circulação fluida',
      timestamp: new Date().toISOString(),
    });
  }

  // 4. Inefficient procedure warning
  recommendations.push({
    id: 'rec-sop-dock5',
    type: 'procedimento_ineficiente',
    severity: 'informativa',
    title: 'Prevenção: Conclusão de Manutenção na Doca 05',
    description: 'A Doca 05 está em manutenção preventiva há 2h. Previsão de liberação em 20 min para absorver carretas pesadas.',
    suggestedAction: 'Confirmar checklist da rampa hidráulica com equipe predial.',
    targetDockNumber: 5,
    impact: 'Restauração de 100% da capacidade operacional do terminal',
    timestamp: new Date().toISOString(),
  });

  return recommendations;
}

// Storage Manager
class DepotStorage {
  private state: SystemState;

  constructor() {
    this.ensureDataDir();
    this.state = this.loadState();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      try {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      } catch (err) {
        console.error('Could not create data dir:', err);
      }
    }
  }

  private loadState(): SystemState {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.docks) && parsed.docks.length === 14) {
          // Recompute KPIs & dynamic recommendations
          parsed.kpis = computeKPIs(parsed.docks, parsed.movements, parsed.queue);
          parsed.recommendations = generateRecommendations(
            parsed.docks,
            parsed.queue,
            parsed.movements,
          );
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading saved state, regenerating seed:', e);
    }
    const initial = generateInitialState();
    this.saveToDisk(initial);
    return initial;
  }

  public saveToDisk(stateToSave?: SystemState) {
    try {
      const data = stateToSave || this.state;
      data.lastBackupAt = new Date().toISOString();
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving state to disk:', err);
    }
  }

  public getState(): SystemState {
    // Dynamic recalculation on fetch
    this.state.kpis = computeKPIs(
      this.state.docks,
      this.state.movements,
      this.state.queue,
    );
    this.state.recommendations = generateRecommendations(
      this.state.docks,
      this.state.queue,
      this.state.movements,
    );
    return this.state;
  }

  public getDock(dockId: string): Dock | undefined {
    return this.state.docks.find((d) => d.id === dockId);
  }

  public updateDock(dockId: string, updates: Partial<Dock>): Dock | null {
    const idx = this.state.docks.findIndex((d) => d.id === dockId);
    if (idx === -1) return null;

    this.state.docks[idx] = {
      ...this.state.docks[idx],
      ...updates,
      lastStatusChange: new Date().toISOString(),
    };

    this.saveToDisk();
    return this.state.docks[idx];
  }

  // Assign vehicle to dock
  public assignVehicleToDock(params: {
    dockId: string;
    vehicleId?: string;
    plate: string;
    driverName: string;
    operationType: OperationType;
    cargoType: CargoType;
    estimatedDurationMinutes: number;
    notes?: string;
    operatorName: string;
  }): { dock: Dock; movement: MovementRecord } | { error: string } {
    const dock = this.state.docks.find((d) => d.id === params.dockId);
    if (!dock) return { error: 'Doca não encontrada' };
    if (dock.status === 'manutencao') {
      return { error: 'Doca está em manutenção' };
    }

    const now = new Date();
    const targetCompletionAt = new Date(
      now.getTime() + params.estimatedDurationMinutes * 60 * 1000,
    ).toISOString();

    const currentOperation = {
      vehicleId: params.vehicleId || `veh-${Date.now()}`,
      plate: params.plate.toUpperCase().trim(),
      driverName: params.driverName,
      operationType: params.operationType,
      cargoType: params.cargoType,
      startedAt: now.toISOString(),
      estimatedDurationMinutes: params.estimatedDurationMinutes,
      targetCompletionAt,
      notes: params.notes,
    };

    dock.status =
      params.operationType === 'carregamento'
        ? 'em_carregamento'
        : 'em_descarregamento';
    dock.currentOperation = currentOperation;
    dock.totalOperationsToday += 1;
    dock.lastStatusChange = now.toISOString();

    // Remove from queue if it was waiting
    this.state.queue = this.state.queue.filter(
      (q) => q.vehiclePlate.toUpperCase() !== params.plate.toUpperCase(),
    );

    // Update vehicle status
    const veh = this.state.vehicles.find(
      (v) => v.plate.toUpperCase() === params.plate.toUpperCase(),
    );
    if (veh) {
      veh.status = 'em_doca';
    }

    // Create or update movement record
    let movement = this.state.movements.find(
      (m) =>
        m.vehiclePlate.toUpperCase() === params.plate.toUpperCase() &&
        m.status === 'fila_espera',
    );

    if (movement) {
      movement.dockId = dock.id;
      movement.dockNumber = dock.number;
      movement.dockAssignmentTime = now.toISOString();
      movement.status = 'operando_doca';
      movement.operationType = params.operationType;
      movement.cargoType = params.cargoType;
      movement.operatorName = params.operatorName;
      if (params.notes) movement.notes = params.notes;
    } else {
      movement = {
        id: `mov-${Date.now()}`,
        vehiclePlate: params.plate.toUpperCase(),
        vehicleModel: veh?.model || 'Caminhão Padrão',
        driverName: params.driverName,
        dockId: dock.id,
        dockNumber: dock.number,
        operationType: params.operationType,
        cargoType: params.cargoType,
        gateEntryTime: now.toISOString(),
        dockAssignmentTime: now.toISOString(),
        totalYardMinutes: 0,
        totalDockMinutes: 0,
        status: 'operando_doca',
        operatorName: params.operatorName,
        notes: params.notes,
      };
      this.state.movements.unshift(movement);
    }

    this.saveToDisk();
    return { dock, movement };
  }

  // Complete operation & release dock
  public releaseDock(
    dockId: string,
    notes?: string,
  ): { dock: Dock; movement?: MovementRecord } | { error: string } {
    const dock = this.state.docks.find((d) => d.id === dockId);
    if (!dock) return { error: 'Doca não encontrada' };
    if (!dock.currentOperation) return { error: 'Doca já está livre' };

    const now = new Date();
    const plate = dock.currentOperation.plate;
    const startedAt = new Date(dock.currentOperation.startedAt);
    const durationMinutes = Math.max(
      1,
      Math.round((now.getTime() - startedAt.getTime()) / (60 * 1000)),
    );

    dock.totalOccupiedMinutesToday += durationMinutes;
    dock.status = 'livre';
    dock.lastStatusChange = now.toISOString();

    // Update movement record
    const movement = this.state.movements.find(
      (m) =>
        m.dockId === dockId &&
        m.vehiclePlate.toUpperCase() === plate.toUpperCase() &&
        m.status === 'operando_doca',
    );

    if (movement) {
      movement.dockReleaseTime = now.toISOString();
      movement.totalDockMinutes = durationMinutes;
      movement.status = 'concluido';
      movement.gateExitTime = now.toISOString();
      const entryTime = new Date(movement.gateEntryTime);
      movement.totalYardMinutes = Math.max(
        durationMinutes,
        Math.round((now.getTime() - entryTime.getTime()) / (60 * 1000)),
      );
      if (notes) {
        movement.notes = (movement.notes ? movement.notes + ' | ' : '') + notes;
      }
    }

    // Free vehicle
    const veh = this.state.vehicles.find(
      (v) => v.plate.toUpperCase() === plate.toUpperCase(),
    );
    if (veh) {
      veh.status = 'liberado';
    }

    dock.currentOperation = undefined;
    dock.equipmentAlert = undefined;

    this.saveToDisk();
    return { dock, movement };
  }

  // Set dock to maintenance
  public setDockMaintenance(
    dockId: string,
    reason: string,
  ): Dock | { error: string } {
    const dock = this.state.docks.find((d) => d.id === dockId);
    if (!dock) return { error: 'Doca não encontrada' };

    if (dock.currentOperation) {
      return {
        error: 'Não é possível colocar em manutenção com operação em andamento. Libere a doca primeiro.',
      };
    }

    dock.status = 'manutencao';
    dock.equipmentAlert = reason || 'Manutenção preventiva programada';
    dock.lastStatusChange = new Date().toISOString();

    this.saveToDisk();
    return dock;
  }

  // Register vehicle arrival at Gate (Portaria Check-in)
  public checkInVehicle(data: {
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
  }): { movement: MovementRecord; queueItem?: QueueItem; dock?: Dock } {
    const now = new Date();
    const plate = data.plate.toUpperCase().trim();

    // Register or update vehicle in registry
    let veh = this.state.vehicles.find((v) => v.plate === plate);
    if (!veh) {
      veh = {
        id: `veh-${Date.now()}`,
        plate,
        model: data.model || 'Caminhão Padrão',
        capacityTons: Number(data.capacityTons) || 25,
        capacityM3: Number(data.capacityM3) || 70,
        cargoType: data.cargoType,
        carrier: data.carrier || 'Transporte Avulso',
        status: 'no_patio',
        driverName: data.driverName,
        driverDocument: data.driverDocument,
        createdAt: now.toISOString(),
      };
      this.state.vehicles.push(veh);
    } else {
      veh.status = 'no_patio';
      veh.driverName = data.driverName;
      veh.cargoType = data.cargoType;
    }

    // Direct dock assignment if specified and available
    if (data.assignedDockNumber) {
      const targetDock = this.state.docks.find(
        (d) => d.number === data.assignedDockNumber,
      );
      if (targetDock && targetDock.status === 'livre') {
        const res = this.assignVehicleToDock({
          dockId: targetDock.id,
          vehicleId: veh.id,
          plate,
          driverName: data.driverName,
          operationType: data.operationType,
          cargoType: data.cargoType,
          estimatedDurationMinutes: data.operationType === 'carregamento' ? 45 : 35,
          notes: data.notes,
          operatorName: data.operatorName,
        });
        if ('dock' in res) {
          return { movement: res.movement, dock: res.dock };
        }
      }
    }

    // Otherwise add to waiting queue in Yard (Triagem)
    const movement: MovementRecord = {
      id: `mov-${Date.now()}`,
      vehiclePlate: plate,
      vehicleModel: data.model || 'Caminhão',
      driverName: data.driverName,
      driverDocument: data.driverDocument,
      operationType: data.operationType,
      cargoType: data.cargoType,
      gateEntryTime: now.toISOString(),
      totalYardMinutes: 0,
      totalDockMinutes: 0,
      status: 'fila_espera',
      operatorName: data.operatorName,
      notes: data.notes,
    };
    this.state.movements.unshift(movement);

    // Find smart recommended dock
    const recommendedDock = this.state.docks.find(
      (d) =>
        d.status === 'livre' ||
        (data.cargoType === 'refrigerada' && d.type === 'refrigerada'),
    );

    const queueItem: QueueItem = {
      id: `q-${Date.now()}`,
      movementId: movement.id,
      vehiclePlate: plate,
      vehicleModel: data.model || 'Caminhão',
      driverName: data.driverName,
      cargoType: data.cargoType,
      operationType: data.operationType,
      priority: data.priority || 'normal',
      arrivalTime: now.toISOString(),
      recommendedDockNumber: recommendedDock?.number,
      estimatedWaitMinutes:
        data.priority === 'urgente'
          ? 5
          : Math.max(10, this.state.queue.length * 12),
    };
    this.state.queue.push(queueItem);

    this.saveToDisk();
    return { movement, queueItem };
  }

  // Gate check-out
  public checkOutVehicle(plate: string): { success: boolean; message: string } {
    const normPlate = plate.toUpperCase().trim();
    // Check if in dock
    const dockWithVehicle = this.state.docks.find(
      (d) => d.currentOperation?.plate.toUpperCase() === normPlate,
    );
    if (dockWithVehicle) {
      this.releaseDock(dockWithVehicle.id, 'Check-out direto na portaria');
    }

    // Remove from queue if present
    this.state.queue = this.state.queue.filter(
      (q) => q.vehiclePlate.toUpperCase() !== normPlate,
    );

    // Conclude active movement
    const movement = this.state.movements.find(
      (m) =>
        m.vehiclePlate.toUpperCase() === normPlate &&
        (m.status === 'operando_doca' || m.status === 'fila_espera'),
    );

    const now = new Date();
    if (movement) {
      movement.status = 'concluido';
      movement.gateExitTime = now.toISOString();
      const entry = new Date(movement.gateEntryTime);
      movement.totalYardMinutes = Math.max(
        5,
        Math.round((now.getTime() - entry.getTime()) / 60000),
      );
    }

    // Update vehicle
    const veh = this.state.vehicles.find((v) => v.plate.toUpperCase() === normPlate);
    if (veh) {
      veh.status = 'liberado';
    }

    this.saveToDisk();
    return { success: true, message: `Veículo ${normPlate} liberado com sucesso.` };
  }

  // Vehicles management
  public addVehicle(v: Omit<Vehicle, 'id' | 'createdAt'>): Vehicle {
    const newVeh: Vehicle = {
      ...v,
      id: `veh-${Date.now()}`,
      plate: v.plate.toUpperCase().trim(),
      createdAt: new Date().toISOString(),
    };
    this.state.vehicles.unshift(newVeh);
    this.saveToDisk();
    return newVeh;
  }

  // Drivers management
  public addDriver(d: Omit<DriverOrUser, 'id'>): DriverOrUser {
    const newDrv: DriverOrUser = {
      ...d,
      id: `drv-${Date.now()}`,
    };
    this.state.drivers.unshift(newDrv);
    this.saveToDisk();
    return newDrv;
  }

  // Snapshot import (Restore)
  public restoreState(imported: SystemState): boolean {
    if (!imported || !Array.isArray(imported.docks) || imported.docks.length !== 14) {
      return false;
    }
    this.state = imported;
    this.saveToDisk();
    return true;
  }

  // Reset to initial clean state
  public resetToSeed(): SystemState {
    this.state = generateInitialState();
    this.saveToDisk();
    return this.state;
  }
}

export const depotStorage = new DepotStorage();
