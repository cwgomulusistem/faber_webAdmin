'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Key, Shield } from 'lucide-react';
import { globalAdminService } from '../../../services/global-admin.service';
import { tokenManager } from '../../../services/api.service';
import styles from './page.module.css';

export default function GlobalAdminLogin() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    totpCode: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await globalAdminService.login({
        email: formData.email,
        password: formData.password,
        totpCode: formData.totpCode,
        clientId: tokenManager.getClientId(),
        clientType: 'WEB'
      });
      
      router.push('/64ad16/system-logs');
    } catch (err: unknown) {
      console.error(err);
      const errorMessage = (err as any).response?.data?.error || 'Giriş yapılamadı';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <Shield size={40} className={styles.icon} />
          </div>
          <h1 className={styles.title}>Global Admin</h1>
          <p className={styles.subtitle}>Sistem Yönetici Girişi</p>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <Mail size={20} className={styles.inputIcon} />
            <input
              type="email"
              placeholder="Email Adresi"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
              className={styles.input}
            />
          </div>

          <div className={styles.inputGroup}>
            <Lock size={20} className={styles.inputIcon} />
            <input
              type="password"
              placeholder="Şifre"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
              className={styles.input}
            />
          </div>

          <div className={styles.inputGroup}>
            <Key size={20} className={styles.inputIcon} />
            <input
              type="text"
              placeholder="TOTP Kodu (6 hane)"
              value={formData.totpCode}
              onChange={(e) => setFormData({...formData, totpCode: e.target.value})}
              required
              maxLength={6}
              className={styles.input}
            />
          </div>

          <button 
            type="submit" 
            className={styles.submitBtn} 
            disabled={loading}
          >
            {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>
      </div>
    </div>
  );
}
