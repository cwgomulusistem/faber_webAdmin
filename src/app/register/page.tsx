'use client';

// Register Page
// New user registration with E.164 phone number support and password strength validation

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import { LayoutDashboard, AlertCircle, Loader2, Eye, EyeOff, Check, X } from 'lucide-react';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import styles from '../login/page.module.css'; // Reuse login styles

// Password validation rules (Industry Standard - NIST/OWASP)
const PASSWORD_RULES = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecial: true,
};

// Password strength checker
interface PasswordStrength {
  score: number; // 0-5
  label: string;
  color: string;
  checks: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
  };
}

function checkPasswordStrength(password: string): PasswordStrength {
  const checks = {
    minLength: password.length >= PASSWORD_RULES.minLength,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/`~]/.test(password),
  };

  const score = Object.values(checks).filter(Boolean).length;

  const strengthMap: Record<number, { label: string; color: string }> = {
    0: { label: 'Çok Zayıf', color: '#ef4444' },
    1: { label: 'Zayıf', color: '#f97316' },
    2: { label: 'Orta', color: '#eab308' },
    3: { label: 'İyi', color: '#84cc16' },
    4: { label: 'Güçlü', color: '#22c55e' },
    5: { label: 'Çok Güçlü', color: '#10b981' },
  };

  return {
    score,
    ...strengthMap[score],
    checks,
  };
}

export default function RegisterPage() {
  const router = useRouter();
  const { register, activate } = useAuth();
  
  const [step, setStep] = useState<'register' | 'activate'>('register');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState<string | undefined>('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password strength calculation
  const passwordStrength = useMemo(() => checkPasswordStrength(password), [password]);
  
  // Check if passwords match
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
  
  // Check if password meets all requirements
  const isPasswordValid = passwordStrength.score === 5;

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

        // Şifre gücü kontrolü
        if (!isPasswordValid) {
          setError('Şifre tüm gereksinimleri karşılamalıdır');
          setIsLoading(false);
          return;
        }

        // Şifre eşleşme kontrolü
        if (!passwordsMatch) {
          setError('Şifreler eşleşmiyor');
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
                <div className={styles.passwordWrapper}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    className={styles.input}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Güçlü bir şifre oluşturun"
                    maxLength={128}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {password.length > 0 && (
                  <div className={styles.passwordStrength}>
                    <div className={styles.strengthBar}>
                      <div 
                        className={styles.strengthFill}
                        style={{ 
                          width: `${(passwordStrength.score / 5) * 100}%`,
                          backgroundColor: passwordStrength.color 
                        }}
                      />
                    </div>
                    <span className={styles.strengthLabel} style={{ color: passwordStrength.color }}>
                      {passwordStrength.label}
                    </span>
                  </div>
                )}

                {/* Password Requirements Checklist */}
                {password.length > 0 && (
                  <div className={styles.passwordRequirements}>
                    <div className={`${styles.requirement} ${passwordStrength.checks.minLength ? styles.valid : styles.invalid}`}>
                      {passwordStrength.checks.minLength ? <Check size={14} /> : <X size={14} />}
                      <span>En az 8 karakter</span>
                    </div>
                    <div className={`${styles.requirement} ${passwordStrength.checks.hasUppercase ? styles.valid : styles.invalid}`}>
                      {passwordStrength.checks.hasUppercase ? <Check size={14} /> : <X size={14} />}
                      <span>En az 1 büyük harf (A-Z)</span>
                    </div>
                    <div className={`${styles.requirement} ${passwordStrength.checks.hasLowercase ? styles.valid : styles.invalid}`}>
                      {passwordStrength.checks.hasLowercase ? <Check size={14} /> : <X size={14} />}
                      <span>En az 1 küçük harf (a-z)</span>
                    </div>
                    <div className={`${styles.requirement} ${passwordStrength.checks.hasNumber ? styles.valid : styles.invalid}`}>
                      {passwordStrength.checks.hasNumber ? <Check size={14} /> : <X size={14} />}
                      <span>En az 1 rakam (0-9)</span>
                    </div>
                    <div className={`${styles.requirement} ${passwordStrength.checks.hasSpecial ? styles.valid : styles.invalid}`}>
                      {passwordStrength.checks.hasSpecial ? <Check size={14} /> : <X size={14} />}
                      <span>En az 1 özel karakter (!@#$%^&*)</span>
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Şifre Tekrar</label>
                <div className={styles.passwordWrapper}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    className={`${styles.input} ${confirmPassword.length > 0 ? (passwordsMatch ? styles.inputValid : styles.inputInvalid) : ''}`}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Şifrenizi tekrar girin"
                    maxLength={128}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {confirmPassword.length > 0 && !passwordsMatch && (
                  <span className={styles.fieldError}>Şifreler eşleşmiyor</span>
                )}
                {confirmPassword.length > 0 && passwordsMatch && (
                  <span className={styles.fieldSuccess}>Şifreler eşleşiyor ✓</span>
                )}
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
