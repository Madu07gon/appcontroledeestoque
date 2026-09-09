import React, { useState, useRef } from 'react';
import {
  X,
  Download,
  Upload,
  RefreshCw,
  HardDrive,
  Cloud,
  CheckCircle2,
  AlertTriangle,
  Layers,
} from 'lucide-react';
import { SystemState } from '../types';

interface BackupModalProps {
  lastBackupAt?: string;
  onClose: () => void;
  onRestoreState: (state: SystemState) => Promise<void>;
  onResetSeed: () => Promise<void>;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  lastBackupAt,
  onClose,
  onRestoreState,
  onResetSeed,
}) => {
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreMessage, setRestoreMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadBackup = () => {
    window.location.href = '/api/backup/export';
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsRestoring(true);
    setRestoreMessage(null);
    setErrorMessage(null);

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const dataToRestore = parsed.data || parsed;

      await onRestoreState(dataToRestore);
      setRestoreMessage('Backup restaurado com sucesso! As 14 docas foram atualizadas.');
    } catch (err) {
      console.error(err);
      setErrorMessage('Erro ao ler ou restaurar o arquivo de backup. Verifique se o formato é JSON válido.');
    } finally {
      setIsRestoring(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleReset = async () => {
    if (window.confirm('Deseja realmente redefinir os dados para a demonstração padrão?')) {
      await onResetSeed();
      setRestoreMessage('Base operacional redefinida para os parâmetros iniciais!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800/80 flex items-center justify-center text-emerald-400">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white tracking-tight">
                Persistência & Backup em Nuvem
              </h3>
              <p className="text-xs text-slate-400">
                Arquitetura dual: Cache rápido em memória + Google Drive / Vercel Blob
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs">
          {/* Architecture info */}
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-300 font-semibold">
              <span className="flex items-center space-x-1.5">
                <HardDrive className="w-4 h-4 text-cyan-400" />
                <span>Status da Base Operacional</span>
              </span>
              <span className="text-emerald-400 text-[11px] font-bold">Ativa & Protegida</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Os dados de movimentação das 14 docas são persistidos de forma segura no backend Node.js com cache contínuo e suporte a snapshots compatíveis com Google Drive e nuvem.
            </p>
            {lastBackupAt && (
              <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                Último salvamento: {new Date(lastBackupAt).toLocaleString('pt-BR')}
              </div>
            )}
          </div>

          {/* Feedback messages */}
          {restoreMessage && (
            <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-300 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{restoreMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-300 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Action 1: Download Snapshot for Google Drive */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between">
              <strong className="text-white text-xs">1. Exportar Backup (Google Drive / JSON)</strong>
              <span className="text-[10px] text-cyan-300 bg-slate-900 px-2 py-0.5 rounded">.JSON</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Baixe a imagem completa do pátio, incluindo as 14 docas, filas de triagem e histórico para arquivamento no Google Drive.
            </p>
            <button
              id="btn-download-backup"
              onClick={handleDownloadBackup}
              className="w-full py-2 px-3 rounded-lg font-bold text-xs text-white bg-cyan-600 hover:bg-cyan-500 shadow flex items-center justify-center space-x-2 transition"
            >
              <Download className="w-4 h-4" />
              <span>Exportar Snapshot Completo</span>
            </button>
          </div>

          {/* Action 2: Restore from file */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
            <strong className="text-white text-xs block">2. Restaurar Base de Dados</strong>
            <p className="text-slate-400 text-[11px]">
              Selecione um arquivo de backup previamente exportado para recuperar o estado operacional.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              id="btn-upload-backup"
              onClick={() => fileInputRef.current?.click()}
              disabled={isRestoring}
              className="w-full py-2 px-3 rounded-lg font-bold text-xs text-slate-200 bg-slate-700 hover:bg-slate-600 shadow flex items-center justify-center space-x-2 transition"
            >
              <Upload className="w-4 h-4 text-amber-400" />
              <span>{isRestoring ? 'Processando Restauração...' : 'Importar Arquivo de Backup'}</span>
            </button>
          </div>

          {/* Action 3: Reset */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <span className="text-slate-400 text-[11px]">Redefinir para dados de demonstração:</span>
            <button
              id="btn-reset-seed"
              onClick={handleReset}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-950/40 border border-rose-900/60 transition"
            >
              Redefinir Dados
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
