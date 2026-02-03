'use client';

// Login Page
// Admin authentication page with lockout countdown, 2FA support, and trusted devices

import React, { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import { useCountdown } from '../../hooks/useCountdown';
import { LoginError } from '../../services/auth.service';
import { getCachedFingerprint } from '../../utils/fingerprint';
import { 
  LayoutDashboard, 
  AlertCircle, 
  Loader2, 
  Lock, 
  AlertTriangle,
  KeyRound,
  ArrowLeft,
  Shield
} from 'lucide-react';
import styles from './page.module.css';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { 
    adminLogin, 
    verify2FA, 
    verify2FAWithPreAuth, 
    verifyRecoveryCode,
    isPreAuth,
    twoFactorType,
    clearLockout
  } = useAuth();

  const [step, setStep] = useState<'login' | '2fa' | 'recovery'>('login');
  const [identifier, setIdentifier] = useState(''); // Email OR Username (PBAC v2.0)
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Trusted Device state
  const [rememberMe, setRememberMe] = useState(false);
  
  // Lockout state
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);

  const redirectPath = searchParams.get('redirect') || '/dashboard';

  // Countdown hook for lockout
  const { remaining: countdown, isActive: isLocked, formatTime, start: startCountdown } = useCountdown(
    lockoutUntil,
    {
      onComplete: () => {
        setLockoutUntil(null);
        setError('');
        clearLockout();
      }
    }
  );

  // Check if we're in pre-auth state on mount
  useEffect(() => {
    if (isPreAuth) {
      setStep('2fa');
    }
  }, [isPreAuth]);

  // Update lockout countdown when lockoutUntil changes
  useEffect(() => {
    if (lockoutUntil) {
      startCountdown(lockoutUntil);
    }
  }, [lockoutUntil, startCountdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLocked) return;
    
    setIsLoading(true);
    setError('');
    setRemainingAttempts(null);

    try {
      if (step === 'login') {
        // Backend accepts both email and username in the 'email' field
        const response = await adminLogin({ email: identifier, password });
        if (response && response.require2FA) {
          setStep('2fa');
        } else {
          router.push(redirectPath);
        }
      } else if (step === '2fa') {
        // Use pre-auth flow with rememberMe support
        if (isPreAuth) {
          // Get hardware fingerprint for trusted device binding
          const hardwareFingerprint = rememberMe ? await getCachedFingerprint() : undefined;
          await verify2FAWithPreAuth({ code, rememberMe, hardwareFingerprint });
        } else {
          await verify2FA({ email: identifier, code });
        }
        router.push(redirectPath);
      } else if (step === 'recovery') {
        await verifyRecoveryCode({ code: recoveryCode });
        router.push(redirectPath);
      }
    } catch (err: any) {
      console.error(err);
      
      // Handle LoginError with lockout info
      if (err instanceof LoginError) {
        setError(err.message);
        
        if (err.code === 'ACCOUNT_LOCKED') {
          // Set lockout state
          if (err.lockedUntil) {
            setLockoutUntil(err.lockedUntil * 1000); // Convert to milliseconds
          } else if (err.retryAfter) {
            setLockoutUntil(Date.now() + err.retryAfter * 1000);
          }
        } else if (err.remainingAttempts !== undefined) {
          setRemainingAttempts(err.remainingAttempts);
        }
      } else {
        setError(err.message || 'İşlem başarısız. Lütfen tekrar deneyin.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setStep('login');
    setCode('');
    setRecoveryCode('');
    setError('');
  };

  const handleUseRecoveryCode = () => {
    setStep('recovery');
    setCode('');
    setError('');
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
            {step === 'login' && 'Yönetim paneline giriş yapın'}
            {step === '2fa' && (
              twoFactorType === 'TOTP' 
                ? 'Google Authenticator kodunu girin' 
                : 'E-postanıza gönderilen kodu girin'
            )}
            {step === 'recovery' && 'Kurtarma kodunuzu girin'}
          </p>
        </div>

        {/* Lockout Banner */}
        {isLocked && (
          <div className={styles.lockoutBanner}>
            <Lock size={24} />
            <div>
              <p className={styles.lockoutTitle}>Hesabınız geçici olarak kilitlendi</p>
              <p className={styles.lockoutCountdown}>
                <strong>{formatTime(countdown)}</strong> sonra tekrar deneyebilirsiniz
              </p>
            </div>
          </div>
        )}

        {/* Remaining Attempts Warning */}
        {remainingAttempts !== null && remainingAttempts <= 2 && !isLocked && (
          <div className={styles.warningBanner}>
            <AlertTriangle size={18} />
            <span>
              Dikkat: <strong>{remainingAttempts}</strong> deneme hakkınız kaldı
            </span>
          </div>
        )}

        {/* Error Banner */}
        {error && !isLocked && (
          <div className={styles.error}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          {step === 'login' && (
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
                  disabled={isLoading || isLocked}
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
                  disabled={isLoading || isLocked}
                />
              </div>
            </>
          )}

          {step === '2fa' && (
            <>
              <div className={styles.field}>
                <label className={styles.label}>
                  {twoFactorType === 'TOTP' ? '6 Haneli Kod' : 'Doğrulama Kodu'}
                </label>
                <input
                  type="text"
                  required
                  className={`${styles.input} ${styles.codeInput}`}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  disabled={isLoading}
                  autoFocus
                />
                <p className={styles.hint}>
                  {twoFactorType === 'TOTP' 
                    ? 'Google Authenticator uygulamanızdaki kodu girin'
                    : 'E-postanıza gönderilen 6 haneli kodu girin'
                  }
                </p>
              </div>
              
              {/* Remember Me Checkbox */}
              <div className={styles.rememberMe}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className={styles.checkbox}
                    disabled={isLoading}
                  />
                  <Shield size={16} className={styles.shieldIcon} />
                  <span>Bu cihazı 30 gün hatırla</span>
                </label>
                <p className={styles.rememberMeHint}>
                  İşaretlerseniz, bu cihazda 30 gün boyunca 2FA kodu sorulmaz
                </p>
              </div>
            </>
          )}

          {step === 'recovery' && (
            <div className={styles.field}>
              <label className={styles.label}>Kurtarma Kodu</label>
              <input
                type="text"
                required
                className={`${styles.input} ${styles.codeInput}`}
                value={recoveryCode}
                onChange={(e) => setRecoveryCode(e.target.value.toUpperCase())}
                placeholder="XXXX-XXXX-XXXX-XXXX"
                disabled={isLoading}
                autoFocus
              />
              <p className={styles.hint}>
                2FA kurulumu sırasında size verilen kurtarma kodlarından birini girin
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || isLocked}
            className={`${styles.submitBtn} ${isLocked ? styles.lockedBtn : ''}`}
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className={styles.spinner} />
                <span>İşleniyor...</span>
              </>
            ) : isLocked ? (
              <>
                <Lock size={18} />
                <span>{formatTime(countdown)} sonra deneyin</span>
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
            <div className={styles.footerActions}>
              <button 
                type="button"
                className={styles.textButton}
                onClick={handleBackToLogin}
              >
                <ArrowLeft size={16} />
                Giriş ekranına dön
              </button>
              <button 
                type="button"
                className={styles.textButton}
                onClick={handleUseRecoveryCode}
              >
                <KeyRound size={16} />
                Kurtarma kodu kullan
              </button>
            </div>
          )}
          {step === 'recovery' && (
            <button 
              type="button"
              className={styles.textButton}
              onClick={() => setStep('2fa')}
            >
              <ArrowLeft size={16} />
              Doğrulama koduna dön
            </button>
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
