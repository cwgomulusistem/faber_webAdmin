'use client';

// Register Page
// New user registration with E.164 phone number support

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import { LayoutDashboard, AlertCircle, Loader2 } from 'lucide-react';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import styles from '../login/page.module.css'; // Reuse login styles

export default function RegisterPage() {
  const router = useRouter();
  const { register, activate } = useAuth();
  
  const [step, setStep] = useState<'register' | 'activate'>('register');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState<string | undefined>('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setPhoneError('');

    try {
      if (step === 'register') {
        // Telefon numarası validasyonu (E.164 formatı)
        if (!phone || !isValidPhoneNumber(phone)) {
          setPhoneError('Geçerli bir telefon numarası giriniz');
          setIsLoading(false);
          return;
        }

        const result = await register({ 
          email, 
          password, 
          fullName,
          phone // E.164 formatında (örn: +905551234567)
        });
        
        if (result && result.requireActivation) {
          setStep('activate');
        } else {
          router.push('/dashboard');
        }
      } else {
        await activate({ email, code });
        router.push('/login'); // Redirect to login after activation
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
          <h1 className={styles.title}>Kayıt Ol</h1>
          <p className={styles.subtitle}>
            {step === 'register' ? 'Faber Admin hesabı oluşturun' : 'Hesap Aktivasyonu'}
          </p>
        </div>

        {error && (
          <div className={styles.error}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          {step === 'register' ? (
            <>
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

              <div className={styles.field}>
                <label className={styles.label}>Telefon</label>
                <PhoneInput
                  international
                  defaultCountry="TR"
                  value={phone}
                  onChange={setPhone}
                  disabled={isLoading}
                  className={styles.phoneInput}
                  placeholder="555 123 45 67"
                />
                {phoneError && (
                  <span className={styles.fieldError}>{phoneError}</span>
                )}
              </div>
            </>
          ) : (
            <div className={styles.field}>
              <label className={styles.label}>Aktivasyon Kodu</label>
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
              <p className={styles.hint}>
                E-posta veya telefonunuza gönderilen kodu giriniz.
              </p>
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
              step === 'register' ? 'Kayıt Ol' : 'Aktive Et'
            )}
          </button>
        </form>

        <div className={styles.footer}>
          {step === 'register' && (
            <>
              Zaten hesabınız var mı?{' '}
              <Link href="/login" className={styles.link}>
                Giriş Yap
              </Link>
            </>
          )}
          {step === 'activate' && (
            <div className={styles.backLink} onClick={() => setStep('register')}>
              Geri dön
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
