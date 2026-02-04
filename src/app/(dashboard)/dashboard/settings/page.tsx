'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, Bell, Shield, Settings2,
  AlertTriangle, CheckCircle, Loader2, Eye, EyeOff,
  Copy, Download, Smartphone, Mail, Key, Lock,
  RefreshCw, Trash2, AlertCircle,
  Monitor, Globe, Clock, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/hooks/useAuth';
import authService, { TrustedDevice } from '@/services/auth.service';
import type { SecurityStatus, TOTPSetupResponse } from '@/types/auth.types';

type TabType = 'profile' | 'security' | 'notifications' | 'preferences';

// Reusable Card Component
function SettingsCard({ 
  children, 
  icon: Icon, 
  iconColor = 'blue',
  title, 
  description 
}: { 
  children: React.ReactNode;
  icon: React.ElementType;
  iconColor?: 'blue' | 'green' | 'purple' | 'amber';
  title: string;
  description?: string;
}) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 shadow-blue-500/20',
    green: 'from-emerald-500 to-emerald-600 shadow-emerald-500/20',
    purple: 'from-violet-500 to-violet-600 shadow-violet-500/20',
    amber: 'from-amber-500 to-amber-600 shadow-amber-500/20',
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className={cn(
            "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg",
            colorClasses[iconColor]
          )}>
            <Icon className="text-white" size={22} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
            {description && (
              <p className="text-sm text-slate-500 mt-0.5">{description}</p>
            )}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

// Reusable Input Component
function FormInput({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  disabled,
  icon: Icon,
  showToggle,
  onToggle,
  isVisible,
  error,
  success,
  hint,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  icon?: React.ElementType;
  showToggle?: boolean;
  onToggle?: () => void;
  isVisible?: boolean;
  error?: string;
  success?: boolean;
  hint?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
        {Icon && <Icon size={14} className="text-slate-400" />}
        {label}
      </label>
      <div className="relative">
        <input
          type={showToggle ? (isVisible ? 'text' : 'password') : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "w-full h-11 px-4 rounded-xl border bg-white dark:bg-slate-800 outline-none transition-all",
            "placeholder:text-slate-400 text-slate-900 dark:text-white",
            disabled && "bg-slate-50 dark:bg-slate-900 text-slate-500 cursor-not-allowed",
            error 
              ? "border-red-300 dark:border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
              : success 
                ? "border-green-300 dark:border-green-500/50 focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                : "border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
            (showToggle || success || error) && "pr-12"
          )}
        />
        {showToggle && (
          <button
            type="button"
            onClick={onToggle}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded text-slate-400 hover:text-slate-600 transition-colors"
          >
            {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
        {!showToggle && success && (
          <CheckCircle size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" />
        )}
        {!showToggle && error && (
          <AlertCircle size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500" />
        )}
      </div>
      {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}

export default function SettingsPage() {
  const { isConnected } = useSocket();
  const { user, refreshAuth } = useAuth();

  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Profile state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Security state
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus | null>(null);
  const [totpSetupData, setTotpSetupData] = useState<TOTPSetupResponse | null>(null);
  const [showTotpSetup, setShowTotpSetup] = useState(false);
  const [totpCode, setTotpCode] = useState('');
  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [hasDownloadedCodes, setHasDownloadedCodes] = useState(false);
  const [hasConfirmedCodes, setHasConfirmedCodes] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);

  // Trusted Devices state
  const [trustedDevices, setTrustedDevices] = useState<TrustedDevice[]>([]);
  const [isLoadingDevices, setIsLoadingDevices] = useState(false);

  // Preferences state
  const [language, setLanguage] = useState('tr');
  const [timezone, setTimezone] = useState('Europe/Istanbul');

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setEmail(user.email || '');
      setPhone((user as any).phone || '');
      setLanguage((user as any).language || 'tr');
      setTimezone((user as any).timezone || 'Europe/Istanbul');
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'security') {
      loadSecurityStatus();
      loadTrustedDevices();
    }
  }, [activeTab]);

  const loadSecurityStatus = async () => {
    try {
      const status = await authService.getSecurityStatus();
      setSecurityStatus(status);
    } catch (error) {
      console.error('Failed to load security status:', error);
    }
  };

  const loadTrustedDevices = async () => {
    setIsLoadingDevices(true);
    try {
      const devices = await authService.getTrustedDevices();
      setTrustedDevices(devices);
    } catch (error) {
      console.error('Failed to load trusted devices:', error);
    } finally {
      setIsLoadingDevices(false);
    }
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setErrorMessage(null);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const showError = (message: string) => {
    setErrorMessage(message);
    setSuccessMessage(null);
    setTimeout(() => setErrorMessage(null), 5000);
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      await authService.updateProfile({
        fullName: fullName || undefined,
        phone: phone || undefined,
        language: language || undefined,
        timezone: timezone || undefined,
      });
      await refreshAuth();
      showSuccess('Profil başarıyla güncellendi');
    } catch (error: any) {
      showError(error.message || 'Profil güncellenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      showError('Şifreler eşleşmiyor');
      return;
    }
    if (newPassword.length < 8) {
      showError('Şifre en az 8 karakter olmalı');
      return;
    }

    setIsLoading(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showSuccess('Şifre başarıyla değiştirildi');
    } catch (error: any) {
      showError(error.message || 'Şifre değiştirilemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetupTOTP = async () => {
    setIsLoading(true);
    try {
      const data = await authService.setupTOTP();
      setTotpSetupData(data);
      setRecoveryCodes(data.recoveryCodes);
      setShowTotpSetup(true);
    } catch (error: any) {
      showError(error.message || 'TOTP kurulumu başlatılamadı');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyTOTP = async () => {
    if (totpCode.length !== 6) {
      showError('6 haneli kod girin');
      return;
    }

    setIsLoading(true);
    try {
      await authService.verifyAndEnableTOTP(totpCode);
      setShowTotpSetup(false);
      setShowRecoveryCodes(true);
      setTotpCode('');
      await loadSecurityStatus();
    } catch (error: any) {
      showError(error.message || 'Kod doğrulanamadı');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisableTOTP = async () => {
    setIsLoading(true);
    try {
      await authService.disableTOTP(disablePassword);
      setShowDisableModal(false);
      setDisablePassword('');
      await loadSecurityStatus();
      showSuccess('2FA başarıyla kapatıldı');
    } catch (error: any) {
      showError(error.message || '2FA kapatılamadı');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateCodes = async () => {
    const password = prompt('Şifrenizi girin:');
    if (!password) return;

    setIsLoading(true);
    try {
      const codes = await authService.regenerateRecoveryCodes(password);
      setRecoveryCodes(codes);
      setShowRecoveryCodes(true);
      setHasDownloadedCodes(false);
      setHasConfirmedCodes(false);
      await loadSecurityStatus();
    } catch (error: any) {
      showError(error.message || 'Kodlar yenilenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeTrustedDevice = async (deviceId: string) => {
    if (!confirm('Bu cihazı güvenilir cihazlar listesinden kaldırmak istediğinize emin misiniz?')) return;
    
    setIsLoading(true);
    try {
      await authService.revokeTrustedDevice(deviceId);
      await loadTrustedDevices();
      showSuccess('Cihaz güvenilir listesinden kaldırıldı');
    } catch (error: any) {
      showError(error.message || 'Cihaz kaldırılamadı');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeAllTrustedDevices = async () => {
    if (!confirm('Tüm güvenilir cihazları kaldırmak istediğinize emin misiniz?')) return;
    
    setIsLoading(true);
    try {
      await authService.revokeAllTrustedDevices();
      await loadTrustedDevices();
      showSuccess('Tüm güvenilir cihazlar kaldırıldı');
    } catch (error: any) {
      showError(error.message || 'Cihazlar kaldırılamadı');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showSuccess('Panoya kopyalandı');
  };

  const downloadRecoveryCodes = () => {
    const content = `Faber Smart Home - Kurtarma Kodları\n${'='.repeat(40)}\n\nBu kodları güvenli bir yerde saklayın.\nHer kod sadece bir kez kullanılabilir.\n\n${recoveryCodes.join('\n')}\n\nOluşturulma: ${new Date().toLocaleString('tr-TR')}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'faber-recovery-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
    setHasDownloadedCodes(true);
  };

  const getPasswordStrength = () => {
    if (!newPassword) return null;
    if (newPassword.length < 4) return { level: 1, text: 'Çok zayıf', color: 'red' };
    if (newPassword.length < 8) return { level: 2, text: 'Zayıf', color: 'orange' };
    if (newPassword.length < 12) return { level: 3, text: 'Orta', color: 'yellow' };
    return { level: 4, text: 'Güçlü', color: 'green' };
  };

  const passwordStrength = getPasswordStrength();

  const tabs = [
    { id: 'profile' as TabType, label: 'Profil', icon: User },
    { id: 'security' as TabType, label: 'Güvenlik', icon: Shield },
    { id: 'notifications' as TabType, label: 'Bildirimler', icon: Bell },
    { id: 'preferences' as TabType, label: 'Tercihler', icon: Settings2 },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Header */}
      <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 shrink-0">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Ayarlar</h1>
          <p className="text-sm text-slate-500">Hesap ve sistem ayarları</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
          <span className="text-xs font-medium text-slate-500">Bağlantı</span>
          <span className={cn("w-2 h-2 rounded-full", isConnected ? "bg-green-500" : "bg-red-500")} />
        </div>
      </header>

      {/* Toast Messages */}
      {(successMessage || errorMessage) && (
        <div className="px-6 pt-4">
          {successMessage && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3 text-green-700 dark:text-green-400">
              <CheckCircle size={20} />
              <span className="font-medium">{successMessage}</span>
            </div>
          )}
          {errorMessage && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3 text-red-700 dark:text-red-400">
              <AlertCircle size={20} />
              <span className="font-medium">{errorMessage}</span>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 overflow-y-auto shrink-0 hidden md:block">
          <nav className="p-4 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all",
                  activeTab === tab.id 
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold" 
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                )}
              >
                <tab.icon size={20} />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-3xl mx-auto space-y-6">
            
            {/* Mobile Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 md:hidden">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap text-sm font-medium transition-all",
                    activeTab === tab.id 
                      ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25" 
                      : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                  )}
                >
                  <tab.icon size={18} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Profil Bilgileri</h2>
                  <p className="text-slate-500 mt-1">Kişisel bilgilerinizi yönetin</p>
                </div>

                <SettingsCard icon={User} iconColor="blue" title="Kişisel Bilgiler" description="Hesap bilgilerinizi güncelleyin">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormInput
                      label="Ad Soyad"
                      icon={User}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Adınız Soyadınız"
                    />
                    <FormInput
                      label="E-posta"
                      icon={Mail}
                      value={email}
                      onChange={() => {}}
                      disabled
                      hint="E-posta değiştirilemez"
                    />
                    <FormInput
                      label="Telefon"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+90 5XX XXX XX XX"
                    />
                  </div>

                  <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                    <button
                      onClick={handleSaveProfile}
                      disabled={isLoading}
                      className="px-6 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {isLoading && <Loader2 size={18} className="animate-spin" />}
                      Kaydet
                    </button>
                  </div>
                </SettingsCard>
              </>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Güvenlik</h2>
                  <p className="text-slate-500 mt-1">Şifre ve iki faktörlü doğrulama ayarları</p>
                </div>

                {/* Password Change */}
                <SettingsCard icon={Lock} iconColor="blue" title="Şifre Değiştir" description="Hesap şifrenizi güncelleyin">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormInput
                      label="Mevcut Şifre"
                      icon={Key}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      showToggle
                      onToggle={() => setShowCurrentPassword(!showCurrentPassword)}
                      isVisible={showCurrentPassword}
                    />
                    <div className="space-y-2">
                      <FormInput
                        label="Yeni Şifre"
                        icon={Key}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        showToggle
                        onToggle={() => setShowNewPassword(!showNewPassword)}
                        isVisible={showNewPassword}
                      />
                      {passwordStrength && (
                        <div className="space-y-1.5">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4].map((level) => (
                              <div
                                key={level}
                                className={cn(
                                  "h-1 flex-1 rounded-full transition-colors",
                                  passwordStrength.level >= level
                                    ? level === 1 ? "bg-red-500"
                                      : level === 2 ? "bg-orange-500"
                                      : level === 3 ? "bg-yellow-500"
                                      : "bg-green-500"
                                    : "bg-slate-200 dark:bg-slate-700"
                                )}
                              />
                            ))}
                          </div>
                          <p className={cn(
                            "text-xs font-medium",
                            passwordStrength.color === 'red' && "text-red-500",
                            passwordStrength.color === 'orange' && "text-orange-500",
                            passwordStrength.color === 'yellow' && "text-yellow-500",
                            passwordStrength.color === 'green' && "text-green-500"
                          )}>
                            {passwordStrength.text}
                          </p>
                        </div>
                      )}
                    </div>
                    <FormInput
                      label="Yeni Şifre (Tekrar)"
                      icon={CheckCircle}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      error={confirmPassword && newPassword !== confirmPassword ? 'Şifreler eşleşmiyor' : undefined}
                      success={!!confirmPassword && newPassword === confirmPassword}
                    />
                  </div>

                  <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                    <button
                      onClick={handleChangePassword}
                      disabled={isLoading || !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                      className="px-6 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Lock size={18} />}
                      Şifreyi Güncelle
                    </button>
                  </div>
                </SettingsCard>

                {/* Two-Factor Authentication */}
                <SettingsCard icon={Shield} iconColor="green" title="İki Faktörlü Doğrulama (2FA)" description="Hesabınızı ekstra güvenlik ile koruyun">
                  {securityStatus ? (
                    <div className={cn(
                      "p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4",
                      securityStatus.twoFactorEnabled 
                        ? "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800"
                        : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                    )}>
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-11 h-11 rounded-xl flex items-center justify-center",
                          securityStatus.twoFactorEnabled 
                            ? "bg-green-100 dark:bg-green-900/30 text-green-600" 
                            : "bg-slate-200 dark:bg-slate-700 text-slate-500"
                        )}>
                          {securityStatus.twoFactorType === 'TOTP' ? <Smartphone size={22} /> : <Mail size={22} />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {securityStatus.twoFactorEnabled 
                                ? (securityStatus.twoFactorType === 'TOTP' ? 'Google Authenticator' : 'E-posta OTP')
                                : '2FA Kapalı'
                              }
                            </span>
                            {securityStatus.twoFactorEnabled && (
                              <span className="px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold">
                                AKTİF
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-500 mt-0.5">
                            {securityStatus.twoFactorEnabled 
                              ? `${securityStatus.recoveryCodesLeft} kurtarma kodu mevcut`
                              : 'Hesabınızı daha güvenli hale getirin'
                            }
                          </p>
                        </div>
                      </div>

                      {securityStatus.twoFactorEnabled ? (
                        <div className="flex gap-2">
                          <button
                            onClick={handleRegenerateCodes}
                            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-2"
                          >
                            <RefreshCw size={16} />
                            <span className="hidden sm:inline">Kodları Yenile</span>
                          </button>
                          <button
                            onClick={() => setShowDisableModal(true)}
                            className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-all flex items-center gap-2"
                          >
                            <Trash2 size={16} />
                            <span className="hidden sm:inline">Kapat</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={handleSetupTOTP}
                          disabled={isLoading}
                          className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                          {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Shield size={18} />}
                          Etkinleştir
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 size={24} className="animate-spin text-slate-400" />
                    </div>
                  )}
                </SettingsCard>

                {/* Trusted Devices */}
                <SettingsCard icon={Monitor} iconColor="purple" title="Güvenilir Cihazlar" description="30 gün boyunca 2FA sorulmaz">
                  {trustedDevices.length > 0 && (
                    <div className="flex justify-end mb-4 -mt-2">
                      <button
                        onClick={handleRevokeAllTrustedDevices}
                        disabled={isLoading}
                        className="text-sm font-medium text-red-500 hover:text-red-600 flex items-center gap-1.5"
                      >
                        <Trash2 size={14} />
                        Tümünü Kaldır
                      </button>
                    </div>
                  )}

                  {isLoadingDevices ? (
                    <div className="flex items-center justify-center py-10">
                      <Loader2 size={24} className="animate-spin text-slate-400" />
                    </div>
                  ) : trustedDevices.length === 0 ? (
                    <div className="text-center py-10">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <Monitor size={28} className="text-slate-400" />
                      </div>
                      <p className="font-medium text-slate-700 dark:text-slate-300">Henüz güvenilir cihaz yok</p>
                      <p className="text-sm text-slate-500 mt-1">Giriş yaparken "Bu cihazı hatırla" seçeneğini işaretleyin</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {trustedDevices.map((device) => (
                        <div
                          key={device.id}
                          className={cn(
                            "flex items-center justify-between p-4 rounded-xl border transition-all",
                            device.isCurrent 
                              ? "bg-violet-50 dark:bg-violet-900/10 border-violet-200 dark:border-violet-800"
                              : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                          )}
                        >
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center",
                              device.platform === 'WEB' 
                                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600" 
                                : "bg-green-100 dark:bg-green-900/30 text-green-600"
                            )}>
                              {device.platform === 'WEB' ? <Monitor size={20} /> : <Smartphone size={20} />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-slate-900 dark:text-white">{device.deviceName}</span>
                                {device.isCurrent && (
                                  <span className="px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 text-xs font-bold">
                                    Bu Cihaz
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-sm text-slate-500 mt-0.5">
                                {device.lastCity && (
                                  <span className="flex items-center gap-1">
                                    <Globe size={12} />
                                    {device.lastCity}, {device.lastCountry}
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <Clock size={12} />
                                  {new Date(device.lastUsedAt).toLocaleDateString('tr-TR', {
                                    day: 'numeric',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRevokeTrustedDevice(device.id)}
                            disabled={isLoading}
                            className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </SettingsCard>
              </>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Bildirimler</h2>
                  <p className="text-slate-500 mt-1">Bildirim tercihlerinizi yönetin</p>
                </div>

                <SettingsCard icon={Bell} iconColor="amber" title="Bildirim Ayarları" description="Hangi bildirimleri almak istediğinizi seçin">
                  <div className="space-y-1">
                    <NotificationToggle title="Push Bildirimleri" description="Tarayıcı üzerinden anlık bildirimler" defaultChecked={true} />
                    <NotificationToggle title="E-posta Bildirimleri" description="Önemli güncellemeler için e-posta" defaultChecked={true} />
                    <NotificationToggle title="Cihaz Uyarıları" description="Cihaz çevrimdışı olduğunda bildirim" defaultChecked={true} />
                    <NotificationToggle title="Güvenlik Uyarıları" description="Yeni giriş ve güvenlik olayları" defaultChecked={true} />
                  </div>
                </SettingsCard>
              </>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Tercihler</h2>
                  <p className="text-slate-500 mt-1">Dil ve bölgesel ayarlar</p>
                </div>

                <SettingsCard icon={Settings2} iconColor="blue" title="Bölgesel Ayarlar" description="Dil ve saat dilimi tercihleri">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                        <Globe size={14} className="text-slate-400" />
                        Dil
                      </label>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      >
                        <option value="tr">Türkçe</option>
                        <option value="en">English</option>
                        <option value="de">Deutsch</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                        <Clock size={14} className="text-slate-400" />
                        Saat Dilimi
                      </label>
                      <select
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      >
                        <option value="Europe/Istanbul">İstanbul (GMT+3)</option>
                        <option value="Europe/Berlin">Berlin (GMT+1)</option>
                        <option value="America/New_York">New York (GMT-5)</option>
                        <option value="UTC">UTC (GMT+0)</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                    <button
                      onClick={handleSaveProfile}
                      disabled={isLoading}
                      className="px-6 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {isLoading && <Loader2 size={18} className="animate-spin" />}
                      Kaydet
                    </button>
                  </div>
                </SettingsCard>
              </>
            )}
          </div>
        </main>
      </div>

      {/* TOTP Setup Modal */}
      {showTotpSetup && totpSetupData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Google Authenticator Kurulumu</h3>
            <p className="text-sm text-slate-500 mb-6">QR kodu uygulamanızla tarayın</p>
            
            <div className="flex flex-col items-center gap-4 mb-6">
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(totpSetupData.qrCodeUrl)}`}
                  alt="QR Code"
                  className="w-48 h-48"
                />
              </div>
              
              <button
                onClick={() => setShowManualEntry(!showManualEntry)}
                className="text-sm text-blue-500 hover:text-blue-600 font-medium"
              >
                {showManualEntry ? 'QR kodu göster' : 'Manuel giriş yap'}
              </button>

              {showManualEntry && (
                <div className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <p className="text-xs text-slate-500 mb-2">Manuel giriş kodu:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm font-mono tracking-wider break-all">{totpSetupData.secret}</code>
                    <button
                      onClick={() => copyToClipboard(totpSetupData.secret)}
                      className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">6 Haneli Doğrulama Kodu</label>
                <input
                  type="text"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full h-12 px-4 text-center text-2xl font-mono tracking-[0.5em] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setShowTotpSetup(false); setTotpCode(''); }}
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={handleVerifyTOTP}
                  disabled={isLoading || totpCode.length !== 6}
                  className="flex-1 px-4 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                >
                  {isLoading && <Loader2 size={18} className="animate-spin" />}
                  Doğrula
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recovery Codes Modal */}
      {showRecoveryCodes && recoveryCodes.length > 0 && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-xl">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Kurtarma Kodları</h3>
                <p className="text-sm text-slate-500 mt-1">Bu kodları güvenli bir yerde saklayın. Her kod sadece bir kez kullanılabilir.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 my-4">
              {recoveryCodes.map((code, i) => (
                <div key={i} className="px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-center font-mono text-sm">
                  {code}
                </div>
              ))}
            </div>

            <div className="flex gap-2 mb-4">
              <button
                onClick={downloadRecoveryCodes}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
              >
                <Download size={16} />
                İndir
              </button>
              <button
                onClick={() => copyToClipboard(recoveryCodes.join('\n'))}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
              >
                <Copy size={16} />
                Kopyala
              </button>
            </div>

            <label className="flex items-center gap-2 mb-4 cursor-pointer">
              <input
                type="checkbox"
                checked={hasConfirmedCodes}
                onChange={(e) => setHasConfirmedCodes(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-500 focus:ring-blue-500/20"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">Kodları güvenli bir yere kaydettim</span>
            </label>

            <button
              onClick={() => setShowRecoveryCodes(false)}
              disabled={!hasDownloadedCodes && !hasConfirmedCodes}
              className="w-full px-4 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Tamam
            </button>
          </div>
        </div>
      )}

      {/* Disable 2FA Modal */}
      {showDisableModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">2FA'yı Kapat</h3>
            <p className="text-sm text-slate-500 mb-4">Bu işlemi onaylamak için şifrenizi girin.</p>
            
            <input
              type="password"
              value={disablePassword}
              onChange={(e) => setDisablePassword(e.target.value)}
              placeholder="Şifreniz"
              className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 mb-4"
            />
            
            <div className="flex gap-3">
              <button
                onClick={() => { setShowDisableModal(false); setDisablePassword(''); }}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleDisableTOTP}
                disabled={isLoading || !disablePassword}
                className="flex-1 px-4 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
              >
                {isLoading && <Loader2 size={18} className="animate-spin" />}
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NotificationToggle({ title, description, defaultChecked }: { title: string; description: string; defaultChecked: boolean }) {
  const [checked, setChecked] = useState(defaultChecked);

  return (
    <div className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <div>
        <p className="font-medium text-slate-900 dark:text-white">{title}</p>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => setChecked(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
          checked ? "bg-blue-500" : "bg-slate-200 dark:bg-slate-700"
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
            checked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </button>
    </div>
  );
}
