import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { depotStorage } from './server/storage';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'LogiDocas',
    timestamp: new Date().toISOString(),
    uptimeSeconds: process.uptime(),
  });
});

// 1. Get full state
app.get('/api/state', (req, res) => {
  try {
    const state = depotStorage.getState();
    res.json(state);
  } catch (error) {
    console.error('Error fetching state:', error);
    res.status(500).json({ error: 'Erro ao obter estado das docas' });
  }
});

// 2. Assign vehicle to dock
app.post('/api/docas/:id/assign', (req, res) => {
  try {
    const dockId = req.params.id;
    const {
      vehicleId,
      plate,
      driverName,
      operationType,
      cargoType,
      estimatedDurationMinutes,
      notes,
      operatorName,
    } = req.body;

    if (!plate || !driverName || !operationType) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes (placa, motorista, tipo)' });
    }

    const result = depotStorage.assignVehicleToDock({
      dockId,
      vehicleId,
      plate,
      driverName,
      operationType,
      cargoType: cargoType || 'paletizada',
      estimatedDurationMinutes: Number(estimatedDurationMinutes) || 45,
      notes,
      operatorName: operatorName || 'Operador Central',
    });

    if ('error' in result) {
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      message: `Veículo ${plate} alocado na doca com sucesso`,
      state: depotStorage.getState(),
    });
  } catch (error) {
    console.error('Error assigning vehicle to dock:', error);
    res.status(500).json({ error: 'Falha interna ao alocar veículo' });
  }
});

// 3. Release dock (complete operation)
app.post('/api/docas/:id/release', (req, res) => {
  try {
    const dockId = req.params.id;
    const { notes } = req.body || {};

    const result = depotStorage.releaseDock(dockId, notes);
    if ('error' in result) {
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      message: 'Doca liberada com sucesso',
      dock: result.dock,
      state: depotStorage.getState(),
    });
  } catch (error) {
    console.error('Error releasing dock:', error);
    res.status(500).json({ error: 'Falha ao liberar doca' });
  }
});

// 4. Set dock to maintenance or clear
app.post('/api/docas/:id/maintenance', (req, res) => {
  try {
    const dockId = req.params.id;
    const { reason, active } = req.body;

    if (active === false) {
      // Return to free
      const dock = depotStorage.updateDock(dockId, {
        status: 'livre',
        equipmentAlert: undefined,
      });
      return res.json({ success: true, message: 'Doca reativada com sucesso', dock, state: depotStorage.getState() });
    }

    const result = depotStorage.setDockMaintenance(dockId, reason || 'Manutenção programada');
    if ('error' in result) {
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      message: 'Doca colocada em manutenção',
      dock: result,
      state: depotStorage.getState(),
    });
  } catch (error) {
    console.error('Error setting dock maintenance:', error);
    res.status(500).json({ error: 'Falha ao atualizar manutenção' });
  }
});

// 5. Gate Check-in
app.post('/api/checkin', (req, res) => {
  try {
    const {
      plate,
      model,
      capacityTons,
      capacityM3,
      cargoType,
      carrier,
      driverName,
      driverDocument,
      operationType,
      priority,
      assignedDockNumber,
      operatorName,
      notes,
    } = req.body;

    if (!plate || !driverName || !operationType) {
      return res.status(400).json({ error: 'Dados essenciais de check-in não fornecidos' });
    }

    const outcome = depotStorage.checkInVehicle({
      plate,
      model: model || 'Caminhão Padrão',
      capacityTons: Number(capacityTons) || 25,
      capacityM3: Number(capacityM3) || 70,
      cargoType: cargoType || 'seca',
      carrier: carrier || 'Frota Externa',
      driverName,
      driverDocument: driverDocument || 'Não informado',
      operationType: operationType || 'descarregamento',
      priority: priority || 'normal',
      assignedDockNumber: assignedDockNumber ? Number(assignedDockNumber) : undefined,
      operatorName: operatorName || 'Portaria Principal',
      notes,
    });

    res.json({
      success: true,
      message: outcome.dock
        ? `Check-in realizado! Veículo alocado diretamente na Doca ${outcome.dock.number}.`
        : `Check-in realizado! Veículo inserido na fila de espera do pátio.`,
      outcome,
      state: depotStorage.getState(),
    });
  } catch (error) {
    console.error('Error on vehicle check-in:', error);
    res.status(500).json({ error: 'Falha ao processar check-in' });
  }
});

// 6. Gate Check-out
app.post('/api/checkout', (req, res) => {
  try {
    const { plate } = req.body;
    if (!plate) {
      return res.status(400).json({ error: 'Placa não informada' });
    }

    const result = depotStorage.checkOutVehicle(plate);
    res.json({
      ...result,
      state: depotStorage.getState(),
    });
  } catch (error) {
    console.error('Error on vehicle check-out:', error);
    res.status(500).json({ error: 'Falha ao processar check-out' });
  }
});

// 7. Vehicles CRUD
app.get('/api/vehicles', (req, res) => {
  res.json(depotStorage.getState().vehicles);
});

app.post('/api/vehicles', (req, res) => {
  try {
    const { plate, model, capacityTons, capacityM3, cargoType, carrier, driverName, driverDocument } = req.body;
    if (!plate) return res.status(400).json({ error: 'Placa é obrigatória' });

    const veh = depotStorage.addVehicle({
      plate,
      model: model || 'Caminhão Baú',
      capacityTons: Number(capacityTons) || 20,
      capacityM3: Number(capacityM3) || 60,
      cargoType: cargoType || 'paletizada',
      carrier: carrier || 'Transportadora Associada',
      status: 'liberado',
      driverName: driverName || 'A definir',
      driverDocument: driverDocument || '',
    });

    res.json({ success: true, vehicle: veh, state: depotStorage.getState() });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao cadastrar veículo' });
  }
});

// 8. Drivers CRUD
app.get('/api/drivers', (req, res) => {
  res.json(depotStorage.getState().drivers);
});

app.post('/api/drivers', (req, res) => {
  try {
    const { name, document, phone, role, badgeCode, assignedVehiclePlate } = req.body;
    if (!name) return res.status(400).json({ error: 'Nome é obrigatório' });

    const drv = depotStorage.addDriver({
      name,
      document: document || '',
      phone: phone || '',
      role: role || 'operador',
      badgeCode: badgeCode || `OP-${Math.floor(100 + Math.random() * 900)}`,
      status: 'ativo',
      assignedVehiclePlate,
    });

    res.json({ success: true, driver: drv, state: depotStorage.getState() });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao cadastrar operador/motorista' });
  }
});

// 9. Dual Persistence: Google Drive & Cloud JSON Backup
app.get('/api/backup/export', (req, res) => {
  try {
    const state = depotStorage.getState();
    const backupPayload = {
      backupFormatVersion: '1.0',
      cloudSyncService: 'GoogleDrive_VercelBlob_Compatible',
      app: 'LogiDocas',
      exportedAt: new Date().toISOString(),
      metadata: {
        totalDocks: 14,
        activeDocks: state.kpis.activeDocksCount,
        occupancyRate: state.kpis.averageOccupancyRate,
        totalMovements: state.movements.length,
        vehiclesInQueue: state.queue.length,
      },
      data: state,
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="logidocas-drive-backup-${Date.now()}.json"`,
    );
    res.json(backupPayload);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao gerar backup de dados' });
  }
});

app.post('/api/backup/import', (req, res) => {
  try {
    const payload = req.body;
    const stateData = payload.data || payload;
    const ok = depotStorage.restoreState(stateData);
    if (!ok) {
      return res.status(400).json({ error: 'Arquivo de backup inválido ou incompatível' });
    }
    res.json({
      success: true,
      message: 'Base de dados restaurada com sucesso!',
      state: depotStorage.getState(),
    });
  } catch (error) {
    res.status(500).json({ error: 'Falha ao restaurar dados' });
  }
});

app.post('/api/backup/reset', (req, res) => {
  try {
    const state = depotStorage.resetToSeed();
    res.json({ success: true, message: 'Dados redefinidos com sucesso', state });
  } catch (error) {
    res.status(500).json({ error: 'Falha ao redefinir base' });
  }
});

// 10. AI Diagnostics & Strategic Logistics Optimizer (using Gemini or advanced heuristics)
app.post('/api/ai-diagnostics', async (req, res) => {
  try {
    const state = depotStorage.getState();
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `Você é um Engenheiro de Logística e Supply Chain Sênior especialista em WMS e gestão de pátio e docas.
Analise a situação operacional atual de um Centro de Distribuição com 14 docas:
- Ocupação média: ${state.kpis.averageOccupancyRate}%
- Docas ativas: ${state.kpis.activeDocksCount}/14
- Docas em manutenção: ${state.kpis.maintenanceDocksCount}/14
- Docas livres: ${state.kpis.idleDocksCount}/14
- Veículos na fila de espera do pátio: ${state.queue.length}
- Operações atrasadas: ${state.kpis.delayedOperationsCount}
- Tempo médio de permanência em doca: ${state.kpis.averageDockStayMinutes} min
- Fila atual: ${state.queue.map(q => `${q.vehiclePlate} (${q.cargoType}, ${q.operationType}, prioridade ${q.priority})`).join('; ') || 'Vazia'}
- Docas ocupadas atualmente: ${state.docks.filter(d => d.currentOperation).map(d => `${d.name} (${d.currentOperation?.plate}, ${d.currentOperation?.operationType}, ${d.currentOperation?.cargoType})`).join('; ')}

Gere um diagnóstico operacional executivo em português (máximo 3 parágrafos curtos) contendo:
1. Identificação do principal gargalo imediato.
2. Ação recomendada em tempo real para os operadores de doca.
3. Sugestão preventiva para o próximo turno de pico.`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        if (response && response.text) {
          return res.json({
            provider: 'gemini',
            analysis: response.text,
            timestamp: new Date().toISOString(),
          });
        }
      } catch (aiErr) {
        console.warn('Gemini API call skipped or failed, using expert heuristic:', aiErr);
      }
    }

    // Heuristic logistics analysis fallback
    const freeDocksList = state.docks.filter(d => d.status === 'livre').map(d => d.name).join(', ');
    const queuePlates = state.queue.map(q => q.vehiclePlate).join(', ');
    const delayedDocks = state.docks.filter(d => {
      if (!d.currentOperation) return false;
      return Date.now() > new Date(d.currentOperation.targetCompletionAt).getTime();
    }).map(d => d.name).join(', ');

    const fallbackAnalysis = `Diagnóstico Operacional em Tempo Real:
1. **Gargalos e Fila de Espera**: O pátio conta com ${state.queue.length} veículos aguardando triagem (${queuePlates || 'sem fila'}). ${delayedDocks ? `Atenção prioritária às docas com tempo excedido: ${delayedDocks}.` : 'Nenhuma operação em atraso crítico no momento.'}
2. **Plano de Ação Imediato**: Existem ${state.kpis.idleDocksCount} docas livres (${freeDocksList || 'nenhuma'}). Realizar chamada imediata dos veículos da triagem priorizando cargas refrigeradas e rotas com janelas de saída agendadas.
3. **Equilíbrio Operacional**: O throughput atual é de ${state.kpis.totalProcessedVehicles} movimentações com tempo médio de permanência em ${state.kpis.averageDockStayMinutes} min. Recomenda-se antecipar a liberação da Doca 05 pós-manutenção para absorver o pico de cargas pesadas do turno 2.`;

    res.json({
      provider: 'heuristic',
      analysis: fallbackAnalysis,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error generating diagnostics:', error);
    res.status(500).json({ error: 'Erro ao gerar diagnóstico operacional' });
  }
});

// Setup Vite or static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LogiDocas server running on port ${PORT}`);
  });
}

startServer();
