'use client';

// Scenes Page
// Manage automation scenes

import React, { useEffect, useState } from 'react';
import { Plus, Play, Layers } from 'lucide-react';
import { sceneService } from '../../../../services/scene.service';
import { homeService } from '../../../../services/home.service';
import type { Scene } from '../../../../types/scene.types';
import type { Home } from '../../../../types/home.types';
import styles from './page.module.css';

export default function ScenesPage() {
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [homes, setHomes] = useState<Home[]>([]);
  const [selectedHomeId, setSelectedHomeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [runningSceneId, setRunningSceneId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      // First fetch homes
      const userHomes = await homeService.getHomes();
      setHomes(userHomes);
      
      if (userHomes.length > 0) {
        const defaultHome = userHomes.find(h => h.isDefault) || userHomes[0];
        setSelectedHomeId(defaultHome.id);
        
        // Then fetch scenes for default home
        const data = await sceneService.getScenes(defaultHome.id);
        setScenes(data);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunScene = async (sceneId: string) => {
    if (runningSceneId) return;
    try {
      setRunningSceneId(sceneId);
      await sceneService.executeScene(sceneId);
      // Show generic feedback for now
      // setTimeout(() => setRunningSceneId(null), 1000);
    } catch (error) {
      console.error('Failed to run scene:', error);
    } finally {
      setRunningSceneId(null);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Senaryolar</h1>
          <p className={styles.subtitle}>Otomasyon ve senaryo yönetimi</p>
        </div>
        <button className={styles.addBtn}>
          <Plus size={18} />
          <span>Senaryo Ekle</span>
        </button>
      </div>

      {isLoading ? (
        <div className={styles.loading}>Yükleniyor...</div>
      ) : scenes.length > 0 ? (
        <div className={styles.grid}>
          {scenes.map((scene) => (
            <div key={scene.id} className={styles.card}>
              <div className={styles.cardContent}>
                <div className={styles.iconWrapper}>
                  <span className={styles.icon}>{scene.icon || '✨'}</span>
                </div>
                <div>
                  <h3 className={styles.sceneName}>{scene.name}</h3>
                  <p className={styles.sceneInfo}>
                    {scene.actions?.length || 0} aksiyon
                  </p>
                </div>
              </div>
              <button 
                className={`${styles.runBtn} ${runningSceneId === scene.id ? styles.running : ''}`}
                onClick={() => handleRunScene(scene.id)}
                disabled={!!runningSceneId}
              >
                <Play size={20} fill="currentColor" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          <Layers size={48} />
          <p>Henüz senaryo oluşturulmamış</p>
          <button className={styles.createBtn}>Yeni Senaryo Oluştur</button>
        </div>
      )}
    </div>
  );
}
