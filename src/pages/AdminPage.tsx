import React, { useState, useRef } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { usePageTitle } from '../utils/usePageTitle';
import { backupAPI, authAPI } from '../services/api';
import { hasPermission } from '../utils/permissions';

export default function AdminPage() {
  usePageTitle('Admin');

  const [backupResult, setBackupResult] = useState<string>('');
  const [restoreResult, setRestoreResult] = useState<string>('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: 'full' | 'partial'; file?: File } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get current user for permission checks
  const { data: currentUser } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => authAPI.getCurrentUser(),
    retry: 1
  });

  // Create backup mutation
  const createBackupMutation = useMutation({
    mutationFn: backupAPI.createFullBackup,
    onSuccess: (data) => {
      setBackupResult(`Backup created successfully!\n\nSize: ${data.backup_size} bytes\nTimestamp: ${data.timestamp}\nTables: ${data.tables_included.join(', ')}\n\n${data.message}`);
    },
    onError: (error: any) => {
      setBackupResult(`Backup failed: ${error.response?.data?.detail || error.message}`);
    }
  });

  // Download backup mutation
  const downloadBackupMutation = useMutation({
    mutationFn: backupAPI.downloadFullBackup,
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `stocky_backup_${new Date().toISOString().slice(0, 19).replace(/[-:]/g, '')}.sql.gz`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setBackupResult('Backup downloaded successfully!');
    },
    onError: (error: any) => {
      setBackupResult(`Download failed: ${error.response?.data?.detail || error.message}`);
    }
  });

  // Restore mutations
  const restorePartialMutation = useMutation({
    mutationFn: ({ file }: { file: File }) => backupAPI.uploadPartialBackup(file, false),
    onSuccess: (data) => {
      setRestoreResult(`Partial restore completed!\n\nTables affected: ${data.tables_affected.join(', ')}\nRecords imported: ${data.records_imported}\nTimestamp: ${data.timestamp}\n\n${data.message}`);
      setShowConfirmDialog(false);
      setPendingAction(null);
    },
    onError: (error: any) => {
      setRestoreResult(`Partial restore failed: ${error.response?.data?.detail || error.message}`);
      setShowConfirmDialog(false);
      setPendingAction(null);
    }
  });

  const restoreFullMutation = useMutation({
    mutationFn: ({ file }: { file: File }) => backupAPI.uploadFullBackup(file, true),
    onSuccess: (data) => {
      setRestoreResult(`Full restore completed!\n\n⚠️ DESTRUCTIVE OPERATION COMPLETED ⚠️\n\nTables affected: ${data.tables_affected.join(', ')}\nTimestamp: ${data.timestamp}\n\n${data.message}`);
      setShowConfirmDialog(false);
      setPendingAction(null);
    },
    onError: (error: any) => {
      setRestoreResult(`Full restore failed: ${error.response?.data?.detail || error.message}`);
      setShowConfirmDialog(false);
      setPendingAction(null);
    }
  });

  // Permission checks
  const canBackup = hasPermission(currentUser?.role, 'canBackupData');
  const canRestore = hasPermission(currentUser?.role, 'canRestoreData');

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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, type: 'partial' | 'full') => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.sql.gz')) {
      setRestoreResult('Error: Please select a .sql.gz file');
      return;
    }

    if (type === 'full') {
      // Show confirmation for destructive operation
      setPendingAction({ type, file });
      setShowConfirmDialog(true);
    } else {
      // Execute partial restore immediately
      restorePartialMutation.mutate({ file });
    }

    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleConfirmRestore = () => {
    if (pendingAction && pendingAction.file) {
      if (pendingAction.type === 'full') {
        restoreFullMutation.mutate({ file: pendingAction.file });
      }
    }
  };

  const handleCancelRestore = () => {
    setShowConfirmDialog(false);
    setPendingAction(null);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Manage system backups and restore operations. All operations require admin privileges.
        </p>
      </div>

      {/* Backup Section */}
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
        <div className="px-4 py-6 sm:p-8">
          <div className="max-w-2xl">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Database Backup</h2>
            <p className="text-gray-600 mb-6">
              Create backups of your database for safety and deployment purposes.
            </p>
            
            <div className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => createBackupMutation.mutate()}
                  disabled={!canBackup || createBackupMutation.isPending}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createBackupMutation.isPending ? 'Creating...' : 'Create Backup'}
                </button>
                
                <button
                  onClick={() => downloadBackupMutation.mutate()}
                  disabled={!canBackup || downloadBackupMutation.isPending}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {downloadBackupMutation.isPending ? 'Downloading...' : 'Download Backup'}
                </button>
              </div>

              {backupResult && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Backup Result:</h3>
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">{backupResult}</pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Restore Section */}
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
        <div className="px-4 py-6 sm:p-8">
          <div className="max-w-2xl">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Database Restore</h2>
            <p className="text-gray-600 mb-6">
              Import data from backup files. Use partial restore to add data, or full restore to completely replace the database.
            </p>
            
            <div className="space-y-6">
              {/* Partial Restore */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Partial Restore (Safe)</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Adds data from backup to existing database. Existing data is preserved.
                </p>
                <div className="flex items-center gap-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".sql.gz"
                    onChange={(e) => handleFileSelect(e, 'partial')}
                    disabled={!canRestore || restorePartialMutation.isPending}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                  />
                  {restorePartialMutation.isPending && (
                    <span className="text-sm text-blue-600">Importing...</span>
                  )}
                </div>
              </div>

              {/* Full Restore */}
              <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                <h3 className="font-medium text-red-900 mb-2">Full Restore (Destructive)</h3>
                <p className="text-sm text-red-700 mb-4">
                  ⚠️ <strong>WARNING:</strong> This will completely replace your current database with the backup data. 
                  All existing data will be lost. The original database will be backed up automatically before restoration.
                </p>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept=".sql.gz"
                    onChange={(e) => handleFileSelect(e, 'full')}
                    disabled={!canRestore || restoreFullMutation.isPending}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-red-50 file:text-red-700 hover:file:bg-red-100 disabled:opacity-50"
                  />
                  {restoreFullMutation.isPending && (
                    <span className="text-sm text-red-600">Restoring...</span>
                  )}
                </div>
              </div>

              {restoreResult && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Restore Result:</h3>
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">{restoreResult}</pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4">Confirm Full Database Restore</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  This action will completely replace your current database with the backup data. 
                  All existing data will be permanently lost.
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Your current database will be automatically backed up before restoration.
                </p>
                <p className="text-sm font-semibold text-red-600 mt-2">
                  This action cannot be undone. Are you absolutely sure?
                </p>
              </div>
              <div className="flex gap-4 mt-4">
                <button
                  onClick={handleCancelRestore}
                  className="flex-1 px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmRestore}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Yes, Replace Database
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}