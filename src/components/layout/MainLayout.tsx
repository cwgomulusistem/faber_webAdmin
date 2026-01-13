'use client';

// MainLayout Component
// Main layout wrapper with sidebar and header

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import styles from './MainLayout.module.css';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <div className={`${styles.sidebarWrapper} ${isMobileMenuOpen ? styles.open : ''}`}>
        <Sidebar />
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className={styles.overlay}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className={styles.mainContent}>
        <Header onMenuClick={toggleMobileMenu} />
        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
