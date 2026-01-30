'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Home, MapPin, Trash2, Edit2, Check, X } from 'lucide-react';
import { cn, setActiveHomeId } from '@/lib/utils';
import api from '@/services/api.service';
import { motion, AnimatePresence } from 'framer-motion';

interface HomeData {
    id: string;
    name: string;
    address?: string;
    role?: string;
}

export default function HomesPage() {
    const router = useRouter();
    const [homes, setHomes] = useState<HomeData[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newHomeName, setNewHomeName] = useState('');
    const [newHomeAddress, setNewHomeAddress] = useState('');

    const fetchHomes = async () => {
        try {
            setLoading(true);
            const res = await api.get('/homes');
            setHomes(res.data?.data || []);
        } catch (err) {
            console.error("Failed to fetch homes", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHomes();
    }, []);

    const handleCreateHome = async () => {
        if (!newHomeName.trim()) return;
        try {
            await api.post('/homes', { name: newHomeName, address: newHomeAddress });
            setNewHomeName('');
            setNewHomeAddress('');
            setIsAddModalOpen(false);
            fetchHomes();
        } catch (err) {
            console.error("Failed to create home", err);
            alert("Ev oluşturulurken hata oluştu.");
        }
    };

    const handleDeleteHome = async (id: string) => {
        if (!confirm("Bu evi silmek istediğinize emin misiniz? Tüm odalar ve cihazlar etkilenebilir.")) return;
        try {
            await api.delete(`/homes/${id}`);
            fetchHomes();
        } catch (err) {
            console.error("Delete failed", err);
        }
    };

    return (
        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark overflow-hidden">
            <header className="flex items-center justify-between px-8 py-6 shrink-0 bg-white dark:bg-surface-dark border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex gap-2 items-center text-sm text-slate-500">
                        <span className="hover:text-primary cursor-pointer" onClick={() => router.push('/dashboard')}>Ana Sayfa</span>
                        <span>/</span>
                        <span className="text-slate-900 dark:text-white font-medium">Evlerim</span>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-8">
                <div className="max-w-[1200px] mx-auto flex flex-col gap-6">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Ev Yönetimi</h2>
                            <p className="text-slate-500 dark:text-slate-400">Birden fazla evi yönetin ve yapılandırın.</p>
                        </div>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:bg-blue-600 transition-all active:scale-95"
                        >
                            <Plus size={20} />
                            <span>Yeni Ev Ekle</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {loading ? (
                            <p className="text-slate-500">Yükleniyor...</p>
                        ) : homes.length === 0 ? (
                            <div className="col-span-full py-20 text-center bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-300">
                                <Home className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                                <p className="text-slate-500 mb-4">Henüz kayıtlı ev yok.</p>
                                <button onClick={() => setIsAddModalOpen(true)} className="text-primary font-bold hover:underline">Hemen bir tane oluşturun</button>
                            </div>
                        ) : (
                            homes.map((home) => (
                                <div key={home.id} className="group relative bg-white dark:bg-surface-dark rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                            <Home size={24} />
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleDeleteHome(home.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{home.name}</h3>
                                    <div className="flex items-center gap-2 text-slate-500 text-sm mb-6">
                                        <MapPin size={16} />
                                        <span>{home.address || 'Adres belirtilmemiş'}</span>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setActiveHomeId(home.id);
                                            router.push('/dashboard');
                                        }}
                                        className="w-full py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-medium hover:bg-primary hover:text-white transition-all"
                                    >
                                        Bu Evi Yönet
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>

            {/* Add Home Modal */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setIsAddModalOpen(false)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-white dark:bg-surface-dark w-full max-w-md rounded-2xl p-6 shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Yeni Ev Oluştur</h3>
                                <button onClick={() => setIsAddModalOpen(false)}><X className="text-slate-400 hover:text-slate-600" /></button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Ev Adı</label>
                                    <input
                                        autoFocus
                                        value={newHomeName}
                                        onChange={e => setNewHomeName(e.target.value)}
                                        placeholder="Örn: Yazlık Evim"
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary/50 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Adres (İsteğe bağlı)</label>
                                    <input
                                        value={newHomeAddress}
                                        onChange={e => setNewHomeAddress(e.target.value)}
                                        placeholder="Şehir, İlçe..."
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary/50 outline-none"
                                    />
                                </div>
                                <div className="pt-4 flex gap-3 justify-end">
                                    <button onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg">İptal</button>
                                    <button
                                        onClick={handleCreateHome}
                                        disabled={!newHomeName.trim()}
                                        className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-blue-600 disabled:opacity-50"
                                    >
                                        Oluştur
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
