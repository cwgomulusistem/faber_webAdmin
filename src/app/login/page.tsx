'use client';

// Login Page
// Admin authentication page

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import { LayoutDashboard, AlertCircle, Loader2 } from 'lucide-react';
import styles from './page.module.css';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { adminLogin, verify2FA } = useAuth();
  
  const [step, setStep] = useState<'login' | '2fa'>('login');
  const [identifier, setIdentifier] = useState(''); // Email OR Username (PBAC v2.0)
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const redirectPath = searchParams.get('redirect') || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (step === 'login') {
        // Backend accepts both email and username in the 'email' field
        const response = await adminLogin({ email: identifier, password });
        if (response && response.require2FA) {
          setStep('2fa');
        } else {
          router.push(redirectPath);
        }
      } else {
        await verify2FA({ email: identifier, code });
        router.push(redirectPath);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'İşlem başarısız. Lütfen tekrar deneyin.');
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
          <h1 className={styles.title}>Faber Admin</h1>
          <p className={styles.subtitle}>
            {step === 'login' ? 'Yönetim paneline giriş yapın' : '2FA Doğrulama Kodu'}
          </p>
        </div>

        {error && (
          <div className={styles.error}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          {step === 'login' ? (
            <>
              <div className={styles.field}>
                <label className={styles.label}>E-posta veya Kullanıcı Adı</label>
                <input
                  type="text"
                  required
                  className={styles.input}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="ornek@email.com veya kullanici_adi"
                  autoComplete="username"
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
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={isLoading}
                />
              </div>
            </>
          ) : (
            <div className={styles.field}>
              <label className={styles.label}>Doğrulama Kodu</label>
              <input
                type="text"
                required
                className={styles.input}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="6 haneli kod"
                maxLength={6}
                disabled={isLoading}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={styles.submitBtn}
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className={styles.spinner} />
                <span>İşleniyor...</span>
              </>
            ) : (
              step === 'login' ? 'Giriş Yap' : 'Doğrula'
            )}
          </button>
        </form>

        <div className={styles.footer}>
          {step === 'login' && (
            <>
              Hesabınız yok mu?{' '}
              <Link href="/register" className={styles.link}>
                Kayıt Ol
              </Link>
            </>
          )}
          {step === '2fa' && (
            <div className={styles.backLink} onClick={() => setStep('login')}>
              Giriş ekranına dön
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className={styles.container}>Yükleniyor...</div>}>
      <LoginForm />
    </Suspense>
  );
}
