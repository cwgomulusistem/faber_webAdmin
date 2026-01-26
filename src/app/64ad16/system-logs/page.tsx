'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Terminal, RefreshCw, LogOut, ArrowLeft, Download, Maximize2, Minimize2 } from 'lucide-react';
import { globalAdminService } from '../../../services/global-admin.service';
import styles from './page.module.css';

export default function SystemLogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [lines, setLines] = useState(100);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      if (!globalAdminService.isAuthenticated()) {
        router.push('/64ad16/login');
        return;
      }
      const logData = await globalAdminService.getSystemLogs(lines);
      setLogs(logData);
      
      // Auto scroll to bottom
      if (logContainerRef.current) {
        logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
      }
    } catch (error) {
      console.error('Loglar alınamadı:', error);
      if ((error as any).response?.status === 401) {
        globalAdminService.logout();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        fetchLogs();
      }, 5000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoRefresh, lines]);

  const handleLogout = () => {
    globalAdminService.logout();
  };

  const handleDownload = () => {
    const blob = new Blob([logs], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `faber-backend-logs-${new Date().toISOString()}.log`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={`${styles.container} ${isFullscreen ? styles.fullscreen : ''}`}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.iconWrapper}>
            <Terminal size={24} className={styles.icon} />
          </div>
          <div>
            <h1 className={styles.title}>Sistem Logları (PM2)</h1>
            <p className={styles.subtitle}>Backend servisi canlı log akışı</p>
          </div>
        </div>

        <div className={styles.actions}>
          <button 
            className={`${styles.actionBtn} ${autoRefresh ? styles.active : ''}`}
            onClick={() => setAutoRefresh(!autoRefresh)}
            title="Otomatik Yenile (5s)"
          >
            <RefreshCw size={18} className={autoRefresh ? styles.spin : ''} />
            <span>{autoRefresh ? 'Canlı' : 'Yenile'}</span>
          </button>

          <select 
            value={lines} 
            onChange={(e) => setLines(Number(e.target.value))}
            className={styles.select}
          >
            <option value="50">50 Satır</option>
            <option value="100">100 Satır</option>
            <option value="200">200 Satır</option>
            <option value="500">500 Satır</option>
            <option value="1000">1000 Satır</option>
          </select>

          <button className={styles.actionBtn} onClick={handleDownload} title="İndir">
            <Download size={18} />
          </button>

          <button className={styles.actionBtn} onClick={toggleFullscreen} title="Tam Ekran">
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>

          <div className={styles.divider}></div>

          <button className={styles.logoutBtn} onClick={handleLogout} title="Çıkış Yap">
            <LogOut size={18} />
            <span>Çıkış</span>
          </button>
        </div>
      </div>

      <div className={styles.terminalWindow}>
        <div className={styles.terminalHeader}>
          <div className={styles.dots}>
            <div className={styles.dot} style={{ background: '#ff5f56' }}></div>
            <div className={styles.dot} style={{ background: '#ffbd2e' }}></div>
            <div className={styles.dot} style={{ background: '#27c93f' }}></div>
          </div>
          <div className={styles.terminalTitle}>root@faber-server:~/backend</div>
        </div>
        <div className={styles.logContent} ref={logContainerRef}>
          {loading && !logs ? (
            <div className={styles.loading}>Loglar yükleniyor...</div>
          ) : (
            <pre>{logs || 'Log kaydı bulunamadı.'}</pre>
          )}
        </div>
      </div>
    </div>
  );
}
