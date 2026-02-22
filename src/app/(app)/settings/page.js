'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import useUserStore from '@/stores/useUserStore';
import SettingsForm from '@/components/Settings/SettingsForm';
import Avatar from '@/components/ui/Avatar';
import { staggerContainer, staggerItem, cardHover } from '@/lib/motion';
import styles from './Settings.module.css';

export default function SettingsPage() {
  const currentUser = useUserStore((state) => state.currentUser);
  const isLoaded = useUserStore((state) => state.isLoaded);
  const allUsers = useUserStore((state) => state.allUsers);
  const setCurrentUser = useUserStore((state) => state.setCurrentUser);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !isLoaded) {
    return (
      <div className="page-container">
        <div className="page-content">
          <div className="page-header">
            <h1 className="page-title">Configuracoes</h1>
          </div>
          <p style={{ color: 'var(--text-muted)' }}>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="page-container">
        <div className="page-content">
          <div className="page-header">
            <h1 className="page-title">Configuracoes</h1>
          </div>

          <div className={styles.selectorCard}>
            <h2 className={styles.selectorTitle}>Quem e voce?</h2>
            <p className={styles.selectorDescription}>
              Selecione seu perfil para continuar.
            </p>

            {allUsers.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Nenhum usuario encontrado.
              </p>
            ) : (
              <motion.div
                className={styles.userGrid}
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {allUsers.map((user) => (
                  <motion.button
                    key={user.id}
                    className={styles.userOption}
                    onClick={() => setCurrentUser(user)}
                    title={user.name}
                    variants={staggerItem}
                    whileHover={cardHover}
                  >
                    <Avatar
                      name={user.name}
                      color={user.avatar_color || '#3b82f6'}
                      size="lg"
                    />
                    <span className={styles.userName}>{user.name}</span>
                    {user.email && (
                      <span className={styles.userEmail}>{user.email}</span>
                    )}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-content">
        <div className="page-header">
          <h1 className="page-title">Configuracoes</h1>
        </div>

        <SettingsForm user={currentUser} />
      </div>
    </div>
  );
}
