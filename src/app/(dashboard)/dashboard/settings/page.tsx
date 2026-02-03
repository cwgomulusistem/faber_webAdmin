'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, Bell, Shield, Settings2, Search, 
  AlertTriangle, CheckCircle, Loader2, Eye, EyeOff,
  Copy, Download, Smartphone, Mail, Key, Lock,
  ChevronRight, RefreshCw, Trash2, AlertCircle,
  Monitor, Globe, Clock, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/hooks/useAuth';
import authService, { TrustedDevice } from '@/services/auth.service';
import type { SecurityStatus, TOTPSetupResponse } from '@/types/auth.types';

type TabType = 'profile' | 'security' | 'notifications' | 'preferences';

export default function SettingsPage() {
  const router = useRouter();
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

  // Load user data
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setEmail(user.email || '');
      setPhone((user as any).phone || '');
      setLanguage((user as any).language || 'tr');
      setTimezone((user as any).timezone || 'Europe/Istanbul');
    }
  }, [user]);

  // Load security status and trusted devices
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

  const handleRevokeTrustedDevice = async (deviceId: string) => {
    if (!confirm('Bu cihazı güvenilir cihazlar listesinden kaldırmak istediğinize emin misiniz?')) {
      return;
    }
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
    if (!confirm('Tüm güvenilir cihazları kaldırmak istediğinize emin misiniz? Bir sonraki girişte 2FA kodu girmeniz gerekecek.')) {
      return;
    }
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

  // Profile handlers
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

  // Password handlers
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

  // TOTP handlers
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

  const tabs = [
    { id: 'profile' as TabType, label: 'Profil', icon: User },
    { id: 'security' as TabType, label: 'Güvenlik', icon: Shield },
    { id: 'notifications' as TabType, label: 'Bildirimler', icon: Bell },
    { id: 'preferences' as TabType, label: 'Tercihler', icon: Settings2 },
  ];

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark overflow-hidden">
      {/* Header */}
      <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">Ayarlar</h1>
            <span className="text-xs text-gray-500">Hesap ve Sistem Ayarları</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800">
            <span className="text-xs font-medium text-gray-500">Bağlantı</span>
            {isConnected ? (
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-red-500" />
            )}
          </div>
        </div>
      </header>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-700">
          <CheckCircle size={20} />
          <span>{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
          <AlertCircle size={20} />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 flex flex-col bg-white dark:bg-surface-dark border-r border-slate-200 dark:border-slate-800 overflow-y-auto shrink-0 hidden md:flex">
          <div className="p-4 flex flex-col gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors w-full text-left",
                  activeTab === tab.id 
                    ? "bg-primary/10 text-primary font-semibold" 
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                )}
              >
                <tab.icon size={18} />
                <span className="text-sm">{tab.label}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="max-w-[800px] mx-auto">
            
            {/* Mobile Tab Bar */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 md:hidden">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium",
                    activeTab === tab.id 
                      ? "bg-primary text-white" 
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  )}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="flex flex-col gap-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Profil Bilgileri</h2>
                  <p className="text-slate-500 mt-1">Kişisel bilgilerinizi yönetin</p>
                </div>

                <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Ad Soyad</label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="h-11 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">E-posta</label>
                      <input
                        type="email"
                        value={email}
                        disabled
                        className="h-11 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-500 cursor-not-allowed"
                      />
                      <span className="text-xs text-slate-400">E-posta değiştirilemez</span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Telefon</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="h-11 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={handleSaveProfile}
                    disabled={isLoading}
                    className="px-6 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
                  >
                    {isLoading && <Loader2 size={18} className="animate-spin" />}
                    Kaydet
                  </button>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="flex flex-col gap-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Güvenlik</h2>
                  <p className="text-slate-500 mt-1">Şifre ve iki faktörlü doğrulama ayarları</p>
                </div>

                {/* Password Change */}
                <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Key size={20} />
                    Şifre Değiştir
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Mevcut Şifre</label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full h-11 px-4 pr-12 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Yeni Şifre</label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full h-11 px-4 pr-12 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Yeni Şifre (Tekrar)</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="h-11 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleChangePassword}
                    disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
                    className="mt-4 px-6 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
                  >
                    {isLoading && <Loader2 size={18} className="animate-spin" />}
                    Şifreyi Değiştir
                  </button>
                </div>

                {/* Two-Factor Authentication */}
                <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Shield size={20} />
                    İki Faktörlü Doğrulama (2FA)
                  </h3>

                  {securityStatus ? (
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center",
                            securityStatus.twoFactorEnabled ? "bg-green-100 text-green-600" : "bg-slate-200 text-slate-500"
                          )}>
                            {securityStatus.twoFactorType === 'TOTP' ? <Smartphone size={20} /> : <Mail size={20} />}
                          </div>
                          <div>
                            <p className="font-medium">
                              {securityStatus.twoFactorEnabled 
                                ? (securityStatus.twoFactorType === 'TOTP' ? 'Google Authenticator' : 'E-posta OTP')
                                : 'İki faktörlü doğrulama kapalı'
                              }
                            </p>
                            <p className="text-sm text-slate-500">
                              {securityStatus.twoFactorEnabled 
                                ? `${securityStatus.recoveryCodesLeft} kurtarma kodu kaldı`
                                : 'Hesabınızı daha güvenli hale getirin'
                              }
                            </p>
                          </div>
                        </div>
                        {securityStatus.twoFactorEnabled ? (
                          <div className="flex gap-2">
                            <button
                              onClick={handleRegenerateCodes}
                              className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                            >
                              <RefreshCw size={16} />
                              Kodları Yenile
                            </button>
                            <button
                              onClick={() => setShowDisableModal(true)}
                              className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 flex items-center gap-2"
                            >
                              <Trash2 size={16} />
                              Kapat
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={handleSetupTOTP}
                            disabled={isLoading}
                            className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
                          >
                            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
                            Etkinleştir
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 size={24} className="animate-spin text-slate-400" />
                    </div>
                  )}
                </div>

                {/* Trusted Devices */}
                <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Monitor size={20} />
                      Güvenilir Cihazlar
                    </h3>
                    {trustedDevices.length > 0 && (
                      <button
                        onClick={handleRevokeAllTrustedDevices}
                        disabled={isLoading}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-1.5"
                      >
                        <Trash2 size={14} />
                        Tümünü Kaldır
                      </button>
                    )}
                  </div>

                  <p className="text-sm text-slate-500 mb-4">
                    Bu cihazlarda 30 gün boyunca 2FA kodu sorulmaz. Şüpheli bir cihaz görürseniz hemen kaldırın.
                  </p>

                  {isLoadingDevices ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 size={24} className="animate-spin text-slate-400" />
                    </div>
                  ) : trustedDevices.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <Monitor size={40} className="mx-auto mb-3 opacity-30" />
                      <p>Henüz güvenilir cihaz yok</p>
                      <p className="text-sm mt-1">Giriş yaparken "Bu cihazı hatırla" seçeneğini işaretleyin</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {trustedDevices.map((device) => (
                        <div
                          key={device.id}
                          className={cn(
                            "flex items-center justify-between p-4 rounded-lg border",
                            device.isCurrent 
                              ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                              : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                          )}
                        >
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center",
                              device.platform === 'WEB' ? "bg-blue-100 text-blue-600" :
                              device.platform === 'ANDROID' ? "bg-green-100 text-green-600" :
                              "bg-slate-100 text-slate-600"
                            )}>
                              {device.platform === 'WEB' ? <Monitor size={20} /> : <Smartphone size={20} />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{device.deviceName}</p>
                                {device.isCurrent && (
                                  <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                                    Bu Cihaz
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                                {device.lastCity && device.lastCountry && (
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
                            className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title="Cihazı kaldır"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="flex flex-col gap-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Bildirimler</h2>
                  <p className="text-slate-500 mt-1">Bildirim tercihlerinizi yönetin</p>
                </div>

                <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                  <div className="flex flex-col gap-4">
                    <NotificationToggle
                      title="Push Bildirimleri"
                      description="Tarayıcı üzerinden anlık bildirimler"
                      defaultChecked={true}
                    />
                    <NotificationToggle
                      title="E-posta Bildirimleri"
                      description="Önemli güncellemeler için e-posta"
                      defaultChecked={true}
                    />
                    <NotificationToggle
                      title="Cihaz Uyarıları"
                      description="Cihaz çevrimdışı olduğunda bildirim"
                      defaultChecked={true}
                    />
                    <NotificationToggle
                      title="Güvenlik Uyarıları"
                      description="Yeni giriş ve güvenlik olayları"
                      defaultChecked={true}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="flex flex-col gap-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Tercihler</h2>
                  <p className="text-slate-500 mt-1">Dil ve bölgesel ayarlar</p>
                </div>

                <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Dil</label>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="h-11 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      >
                        <option value="tr">Türkçe</option>
                        <option value="en">English</option>
                        <option value="de">Deutsch</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Saat Dilimi</label>
                      <select
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className="h-11 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      >
                        <option value="Europe/Istanbul">İstanbul (GMT+3)</option>
                        <option value="Europe/Berlin">Berlin (GMT+1)</option>
                        <option value="America/New_York">New York (GMT-5)</option>
                        <option value="UTC">UTC (GMT+0)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={handleSaveProfile}
                    disabled={isLoading}
                    className="px-6 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
                  >
                    {isLoading && <Loader2 size={18} className="animate-spin" />}
                    Kaydet
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* TOTP Setup Modal */}
      {showTotpSetup && totpSetupData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Google Authenticator Kurulumu</h3>
            
            {/* QR Code */}
            <div className="flex flex-col items-center gap-4 mb-6">
              <div className="bg-white p-4 rounded-xl">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(totpSetupData.qrCodeUrl)}`}
                  alt="QR Code"
                  className="w-48 h-48"
                />
              </div>
              
              <button
                onClick={() => setShowManualEntry(!showManualEntry)}
                className="text-sm text-primary hover:underline"
              >
                {showManualEntry ? 'QR Kodu göster' : 'Kodu tarayamıyor musunuz? Manuel girin'}
              </button>

              {showManualEntry && (
                <div className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <p className="text-xs text-slate-500 mb-2">Manuel giriş için bu kodu kullanın:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm font-mono tracking-widest break-all">
                      {totpSetupData.secret}
                    </code>
                    <button
                      onClick={() => copyToClipboard(totpSetupData.secret.replace(/\s/g, ''))}
                      className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Verification */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">6 Haneli Doğrulama Kodu</label>
                <input
                  type="text"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="h-12 px-4 text-center text-2xl font-mono tracking-widest rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowTotpSetup(false);
                    setTotpCode('');
                  }}
                  className="flex-1 px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  İptal
                </button>
                <button
                  onClick={handleVerifyTOTP}
                  disabled={isLoading || totpCode.length !== 6}
                  className="flex-1 px-4 py-3 rounded-lg bg-primary text-white font-medium hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2"
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold">Kurtarma Kodlarınızı Kaydedin!</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Bu kodlar sadece bir kez gösterilir. Telefonunuzu kaybederseniz bu kodlarla giriş yapabilirsiniz.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 my-4">
              {recoveryCodes.map((code, i) => (
                <div key={i} className="px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded text-center font-mono text-sm">
                  {code}
                </div>
              ))}
            </div>

            <div className="flex gap-2 mb-4">
              <button
                onClick={downloadRecoveryCodes}
                className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-2"
              >
                <Download size={16} />
                İndir (.txt)
              </button>
              <button
                onClick={() => copyToClipboard(recoveryCodes.join('\n'))}
                className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-2"
              >
                <Copy size={16} />
                Kopyala
              </button>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                id="confirmCodes"
                checked={hasConfirmedCodes}
                onChange={(e) => setHasConfirmedCodes(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300"
              />
              <label htmlFor="confirmCodes" className="text-sm">
                Kodları güvenli bir yere kaydettim
              </label>
            </div>

            <button
              onClick={() => setShowRecoveryCodes(false)}
              disabled={!hasDownloadedCodes && !hasConfirmedCodes}
              className="w-full px-4 py-3 rounded-lg bg-primary text-white font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Devam Et
            </button>
          </div>
        </div>
      )}

      {/* Disable 2FA Modal */}
      {showDisableModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm p-6">
            <h3 className="text-xl font-bold mb-4">2FA'yı Kapat</h3>
            <p className="text-sm text-slate-500 mb-4">
              İki faktörlü doğrulamayı kapatmak için şifrenizi girin.
            </p>
            <input
              type="password"
              value={disablePassword}
              onChange={(e) => setDisablePassword(e.target.value)}
              placeholder="Şifreniz"
              className="w-full h-11 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary focus:border-transparent outline-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDisableModal(false);
                  setDisablePassword('');
                }}
                className="flex-1 px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                İptal
              </button>
              <button
                onClick={handleDisableTOTP}
                disabled={isLoading || !disablePassword}
                className="flex-1 px-4 py-3 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-2"
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
    <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
      <button
        onClick={() => setChecked(!checked)}
        className={cn(
          "w-12 h-6 rounded-full transition-colors relative",
          checked ? "bg-primary" : "bg-slate-300"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform",
            checked ? "translate-x-6" : "translate-x-0.5"
          )}
        />
      </button>
    </div>
  );
}
