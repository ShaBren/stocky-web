import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usePageTitle } from '../utils/usePageTitle';
import { backupAPI, authAPI } from '../services/api';
import { hasPermission } from '../utils/permissions';

export default function AdminPage() {
  usePageTitle('Admin');

  const [status, setStatus] = useState<string>('');
  const [restoreResult, setRestoreResult] = useState<string>('');
  const [restoreMode, setRestoreMode] = useState<'merge' | 'replace'>('merge');
  const [restoreConfirm, setRestoreConfirm] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: currentUser } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => authAPI.getCurrentUser(),
    retry: 1,
  });

  const handleDownload = async () => {
    setIsPending(true);
    try {
      const blob = await backupAPI.downloadBackup();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `stocky_backup_${new Date().toISOString().slice(0, 10)}.json.gz`;
      a.click();
      URL.revokeObjectURL(url);
      setStatus('Backup downloaded successfully.');
    } catch (err: any) {
      setStatus(`Download failed: ${err.response?.data?.detail || err.message}`);
    } finally {
      setIsPending(false);
    }
  };

  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json.gz')) {
      setRestoreResult('Error: Please select a .json.gz backup file.');
      return;
    }

    setIsPending(true);
    try {
      const data = await backupAPI.restoreBackup(file, restoreMode, restoreConfirm);
      setRestoreResult(`Restore complete (${restoreMode} mode).\nTables: ${data.tables_affected.join(', ')}\nRecords: ${data.records_imported}`);
    } catch (err: any) {
      setRestoreResult(`Restore failed: ${err.response?.data?.detail || err.message}`);
    } finally {
      setIsPending(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleLoadStatus = async () => {
    try {
      const s = await backupAPI.getStatus();
      setStatus(JSON.stringify(s.tables, null, 2));
    } catch (err: any) {
      setStatus(`Status check failed: ${err.message}`);
    }
  };

  if (!hasPermission(currentUser?.role, 'canAccessAdmin')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">Manage system backups and restore operations.</p>
      </div>

      {/* Backup */}
      <div className="stocky-card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Database Backup</h2>
        <div className="flex flex-wrap gap-4 mb-4">
          <button onClick={handleDownload} disabled={isPending} className="stocky-button-primary">
            {isPending ? 'Downloading...' : 'Download Backup (.json.gz)'}
          </button>
          <button onClick={handleLoadStatus} className="bg-white border border-gray-300 px-4 py-2 rounded-md text-sm">
            Show Table Counts
          </button>
        </div>
        {status && <pre className="text-sm bg-gray-50 p-4 rounded whitespace-pre-wrap">{status}</pre>}
      </div>

      {/* Restore */}
      <div className="stocky-card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Restore Backup</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input type="radio" value="merge" checked={restoreMode === 'merge'} onChange={() => setRestoreMode('merge')} />
              <span className="text-sm">Merge (add data, keep existing)</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" value="replace" checked={restoreMode === 'replace'} onChange={() => setRestoreMode('replace')} />
              <span className="text-sm text-red-700">Replace (⚠️ deletes all data)</span>
            </label>
          </div>
          {restoreMode === 'replace' && (
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={restoreConfirm} onChange={e => setRestoreConfirm(e.target.checked)} />
              <span className="text-sm text-red-700 font-medium">I understand this will delete all existing data</span>
            </label>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json.gz"
            onChange={handleRestore}
            disabled={isPending || (restoreMode === 'replace' && !restoreConfirm)}
            className="block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700"
          />
          {isPending && <span className="text-sm text-blue-600">Processing...</span>}
          {restoreResult && <pre className="text-sm bg-gray-50 p-4 rounded whitespace-pre-wrap">{restoreResult}</pre>}
        </div>
      </div>
    </div>
  );
}