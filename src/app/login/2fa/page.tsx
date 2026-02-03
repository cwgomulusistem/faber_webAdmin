'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Smartphone, Mail, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function TwoFactorPage() {
  const router = useRouter();
  const { 
    isPreAuth, 
    preAuthToken, 
    twoFactorType, 
    verify2FAWithPreAuth, 
    verifyRecoveryCode,
    isLoading, 
    error, 
    clearError,
    isAuthenticated 
  } = useAuth();

  const [code, setCode] = useState('');
  const [useRecovery, setUseRecovery] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Redirect if not in pre-auth state or already authenticated
  useEffect(() => {
    if (!isPreAuth || !preAuthToken) {
      router.replace('/login');
    }
  }, [isPreAuth, preAuthToken, router]);

  // Redirect on successful auth
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!code.trim()) {
      setLocalError('Kod gerekli');
      return;
    }

    try {
      if (useRecovery) {
        await verifyRecoveryCode({ code: code.trim() });
      } else {
        await verify2FAWithPreAuth({ code: code.trim() });
      }
      // Success - AuthContext will handle redirect
    } catch (err: any) {
      setLocalError(err.message || 'Doğrulama başarısız');
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, useRecovery ? 8 : 6);
    setCode(value);
  };

  // Show loading while checking auth state
  if (!isPreAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
            {twoFactorType === 'TOTP' ? (
              <Smartphone className="w-8 h-8 text-primary" />
            ) : (
              <Mail className="w-8 h-8 text-primary" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            {useRecovery ? 'Kurtarma Kodu' : 'İki Faktörlü Doğrulama'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {useRecovery 
              ? 'Kurtarma kodlarınızdan birini girin'
              : twoFactorType === 'TOTP'
                ? 'Google Authenticator uygulamasından 6 haneli kodu girin'
                : 'E-posta adresinize gönderilen 6 haneli kodu girin'
            }
          </p>
        </div>

        {/* Error Display */}
        {(error || localError) && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error || localError}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label htmlFor="code" className="sr-only">
              {useRecovery ? 'Kurtarma Kodu' : 'Doğrulama Kodu'}
            </label>
            <input
              id="code"
              name="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              value={code}
              onChange={handleCodeChange}
              placeholder={useRecovery ? '12345678' : '000000'}
              className="appearance-none relative block w-full px-4 py-4 text-center text-2xl font-mono tracking-[0.5em] border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              autoFocus
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading || code.length < (useRecovery ? 8 : 6)}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-primary hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Doğrulanıyor...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5 mr-2" />
                  Doğrula
                </>
              )}
            </button>
          </div>
        </form>

        {/* Toggle Recovery Mode */}
        <div className="text-center space-y-3">
          <button
            type="button"
            onClick={() => {
              setUseRecovery(!useRecovery);
              setCode('');
              setLocalError(null);
              clearError();
            }}
            className="text-sm font-medium text-primary hover:text-blue-600"
          >
            {useRecovery 
              ? '← Doğrulama kodu ile giriş yap'
              : 'Telefona erişemiyorum, kurtarma kodu kullan'
            }
          </button>

          <div>
            <Link
              href="/login"
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Giriş sayfasına dön
            </Link>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mt-6">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            {twoFactorType === 'TOTP' ? 'Google Authenticator Kullanımı' : 'E-posta Doğrulama'}
          </h4>
          <ul className="text-xs text-blue-700 space-y-1">
            {twoFactorType === 'TOTP' ? (
              <>
                <li>• Google Authenticator uygulamasını açın</li>
                <li>• Faber hesabınız için gösterilen 6 haneli kodu girin</li>
                <li>• Kod her 30 saniyede bir değişir</li>
              </>
            ) : (
              <>
                <li>• E-posta adresinizi kontrol edin</li>
                <li>• Gönderilen 6 haneli doğrulama kodunu girin</li>
                <li>• Kod 5 dakika geçerlidir</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
