'use client';

import React, { useState } from 'react';

export default function AdminSettingsPage() {
  const [companyName, setCompanyName] = useState('Faber Smart Home');
  const [logoUrl, setLogoUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#3b82f6');
  const [tenantId, setTenantId] = useState('cwgomulusistem');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Save logic to backend API (e.g. PUT /api/v1/admin/settings)
    alert('Settings Saved!');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h1 className="text-xl font-bold text-slate-800">Faber Şirket Ayarları</h1>
            <span className="text-xs font-mono text-slate-400">/64ad16</span>
        </div>
        
        <form onSubmit={handleSave} className="p-6 space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Şirket Adı</label>
                    <input 
                        type="text" 
                        value={companyName}
                        onChange={e => setCompanyName(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Tenant ID (Kiracı)</label>
                    <input 
                        type="text" 
                        value={tenantId}
                        onChange={e => setTenantId(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 text-slate-500"
                        readOnly
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Logo URL</label>
                <div className="flex gap-2">
                    <input 
                        type="texxt" 
                        value={logoUrl}
                        onChange={e => setLogoUrl(e.target.value)}
                        placeholder="https://example.com/logo.png"
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                {logoUrl && (
                    <div className="mt-2 p-2 border border-slate-200 rounded-lg inline-block bg-slate-50">
                        <img src={logoUrl} alt="Logo Preview" className="h-12 object-contain" />
                    </div>
                )}
            </div>

            <div className="space-y-2">
                 <label className="text-sm font-medium text-slate-700">Tema Rengi</label>
                 <div className="flex items-center gap-2">
                    <input 
                        type="color" 
                        value={primaryColor}
                        onChange={e => setPrimaryColor(e.target.value)}
                        className="h-10 w-20 p-1 border border-slate-300 rounded-lg"
                    />
                    <span className="text-slate-600 font-mono">{primaryColor}</span>
                 </div>
            </div>

            <div className="border-t border-slate-100 pt-6 flex justify-end">
                <button 
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors shadow-sm"
                >
                    Kaydet
                </button>
            </div>
            
        </form>
      </div>
    </div>
  );
}
