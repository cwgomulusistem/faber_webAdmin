'use client';

// Register Page
// New user registration

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import { LayoutDashboard, AlertCircle, Loader2 } from 'lucide-react';
import styles from '../login/page.module.css'; // Reuse login styles

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await register({ email, password, fullName });
      // Registration successful, redirect to login or dashboard
      router.push('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Kayıt başarısız. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <LayoutDashboard size={32} />
          </div>
          <h1 className={styles.title}>Kayıt Ol</h1>
          <p className={styles.subtitle}>Faber Admin hesabı oluşturun</p>
        </div>

        {error && (
          <div className={styles.error}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
            <label className={styles.label}>Ad Soyad</label>
            <input
              type="text"
              required
              className={styles.input}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Adınız Soyadınız"
              disabled={isLoading}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>E-posta</label>
            <input
              type="email"
              required
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@email.com"
              disabled={isLoading}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Şifre</label>
            <input
              type="password"
              required
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="En az 6 karakter"
              minLength={6}
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={styles.submitBtn}
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className={styles.spinner} />
                <span>Kayıt Olunuyor...</span>
              </>
            ) : (
              'Kayıt Ol'
            )}
          </button>
        </form>

        <div className={styles.footer}>
          Zaten hesabınız var mı?{' '}
          <Link href="/login" className={styles.link}>
            Giriş Yap
          </Link>
        </div>
      </div>
    </div>
  );
}
