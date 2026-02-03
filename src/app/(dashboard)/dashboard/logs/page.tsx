'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Shield, Download, Search, AlertTriangle, CheckCircle, Bell,
  Filter, RefreshCw, Loader2, Calendar, User, Activity,
  ChevronLeft, ChevronRight, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSocket } from '@/hooks/useSocket';
import adminService, { AuditLog, PaginatedResponse } from '@/services/admin.service';

interface LogFilters {
  action?: string;
  entityType?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export default function AuditLogsPage() {
  const router = useRouter();
  const { isConnected } = useSocket();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<LogFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  // Fetch logs
  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await adminService.getAuditLogs(page, 20, filters);
      // Handle both response formats
      const logsData = (response as any).logs || (response as any).data || [];
      setLogs(logsData);
      setTotalPages((response as any).totalPages || 1);
      setTotal((response as any).total || logsData.length);
    } catch (err: any) {
      console.error('Failed to fetch logs:', err);
      setError(err.message || 'Loglar yüklenemedi');
      // Set empty data on error
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, search: searchQuery }));
    setPage(1);
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
    setPage(1);
  };

  // Export logs
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = await adminService.exportAuditLogs(filters);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || 'Dışa aktarma başarısız');
    } finally {
      setIsExporting(false);
    }
  };

  // Get action badge style
  const getActionStyle = (action: string) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('delete') || actionLower.includes('ban') || actionLower.includes('fail')) {
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    }
    if (actionLower.includes('create') || actionLower.includes('success') || actionLower.includes('activate')) {
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    }
    if (actionLower.includes('update') || actionLower.includes('edit')) {
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    }
    return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // Action types for filter
  const actionTypes = [
    'LOGIN',
    'LOGOUT',
    'CREATE_USER',
    'UPDATE_USER',
    'DELETE_USER',
    'ACTIVATE_USER',
    'DEACTIVATE_USER',
    'BAN_DEVICE',
    'UNBAN_DEVICE',
    'CONTROL_DEVICE',
    'CREATE_SCENE',
    'DELETE_SCENE',
    'EXECUTE_SCENE',
  ];

  // Entity types for filter
  const entityTypes = ['user', 'device', 'scene', 'home', 'room'];

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark text-slate-900 dark:text-white overflow-hidden">
      {/* Header */}
      <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">Denetim Kayıtları</h1>
            <span className="text-xs text-gray-500">
              {total.toLocaleString('tr-TR')} kayıt bulundu
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800">
            <span className="text-xs font-medium text-gray-500">Sistem</span>
            <div className="flex items-center gap-1.5">
              {isConnected ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-semibold text-green-600 dark:text-green-400">Çevrimiçi</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-xs font-semibold text-red-600">Çevrimdışı</span>
                </>
              )}
            </div>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              showFilters 
                ? "bg-primary text-white" 
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            )}
          >
            <Filter size={16} />
            Filtrele
          </button>

          <button
            onClick={fetchLogs}
            disabled={isLoading}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <RefreshCw size={18} className={cn("text-gray-500", isLoading && "animate-spin")} />
          </button>

          <button
            onClick={handleExport}
            disabled={isExporting || logs.length === 0}
            className="flex items-center gap-2 rounded-xl bg-primary hover:bg-blue-600 text-white px-4 py-2 shadow-sm transition-all active:scale-95 text-sm font-semibold disabled:opacity-50"
          >
            {isExporting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Download size={18} />
            )}
            <span className="hidden sm:inline">Dışa Aktar</span>
          </button>
        </div>
      </header>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4">
          <div className="max-w-[1440px] mx-auto flex flex-wrap gap-4 items-end">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500">İşlem Türü</label>
              <select
                value={filters.action || ''}
                onChange={(e) => {
                  setFilters(prev => ({ ...prev, action: e.target.value || undefined }));
                  setPage(1);
                }}
                className="h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
              >
                <option value="">Tümü</option>
                {actionTypes.map(action => (
                  <option key={action} value={action}>{action.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500">Kaynak Türü</label>
              <select
                value={filters.entityType || ''}
                onChange={(e) => {
                  setFilters(prev => ({ ...prev, entityType: e.target.value || undefined }));
                  setPage(1);
                }}
                className="h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm capitalize"
              >
                <option value="">Tümü</option>
                {entityTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500">Başlangıç</label>
              <input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => {
                  setFilters(prev => ({ ...prev, startDate: e.target.value || undefined }));
                  setPage(1);
                }}
                className="h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500">Bitiş</label>
              <input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => {
                  setFilters(prev => ({ ...prev, endDate: e.target.value || undefined }));
                  setPage(1);
                }}
                className="h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
              />
            </div>

            {Object.keys(filters).length > 0 && (
              <button
                onClick={clearFilters}
                className="h-10 px-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/30 flex items-center gap-2"
              >
                <X size={16} />
                Temizle
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 max-w-[1440px] mx-auto w-full flex flex-col gap-6 overflow-y-auto">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 rounded-lg pl-10 pr-4 py-3 text-sm border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Kullanıcı, işlem veya kaynak ara..."
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-600"
          >
            Ara
          </button>
        </form>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span className="text-red-700 dark:text-red-400">{error}</span>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 size={40} className="animate-spin text-primary" />
            <span className="text-slate-500">Kayıtlar yükleniyor...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Shield size={48} className="text-slate-300" />
            <span className="text-slate-500">Kayıt bulunamadı</span>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left">
                  <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-xs font-bold uppercase text-slate-500">
                    <tr>
                      <th className="px-6 py-4">Tarih</th>
                      <th className="px-6 py-4">Kullanıcı</th>
                      <th className="px-6 py-4">İşlem</th>
                      <th className="px-6 py-4">Kaynak</th>
                      <th className="px-6 py-4">IP Adresi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {logs.map((log) => (
                      <tr 
                        key={log.id} 
                        className={cn(
                          "hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors",
                          (log.action.toLowerCase().includes('fail') || log.action.toLowerCase().includes('ban')) && 
                          'bg-red-50/50 dark:bg-red-900/10'
                        )}
                      >
                        <td className="px-6 py-4 font-mono text-sm text-slate-600 dark:text-slate-400">
                          {formatDate(log.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <User size={14} className="text-primary" />
                            </div>
                            <span className="text-sm font-medium">
                              {log.userEmail || log.userId || 'System'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold",
                            getActionStyle(log.action)
                          )}>
                            {log.action.toLowerCase().includes('fail') || log.action.toLowerCase().includes('ban') ? (
                              <AlertTriangle size={12} />
                            ) : (
                              <Activity size={12} />
                            )}
                            {log.action.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-600 dark:text-slate-400">
                            {log.entityType && (
                              <span className="capitalize">{log.entityType}</span>
                            )}
                            {log.entityId && (
                              <span className="text-slate-400 dark:text-slate-500 ml-1">
                                ({log.entityId.slice(0, 8)}...)
                              </span>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs text-slate-500">
                            {log.ipAddress || '-'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">
                  Sayfa {page} / {totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="flex items-center gap-1 px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    <ChevronLeft size={16} />
                    Önceki
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="flex items-center gap-1 px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    Sonraki
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
