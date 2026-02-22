'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import useUserStore from '@/stores/useUserStore';
import useUIStore from '@/stores/useUIStore';
import { AVATAR_COLORS } from '@/lib/constants';
import { springTransition } from '@/lib/motion';
import Avatar from '@/components/ui/Avatar';
import styles from './SettingsForm.module.css';

export default function SettingsForm({ user }) {
  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [avatarColor, setAvatarColor] = useState(user.avatar_color || AVATAR_COLORS[0]);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      useUIStore.getState().addToast('Nome e obrigatorio', 'error');
      return;
    }

    setIsSaving(true);

    try {
      const result = await useUserStore.getState().updateUser(user.id, {
        name: trimmedName,
        email: email.trim() || null,
        avatar_color: avatarColor,
      });

      if (result) {
        useUIStore.getState().addToast('Perfil atualizado com sucesso', 'success');
      } else {
        useUIStore.getState().addToast('Erro ao atualizar perfil', 'error');
      }
    } catch {
      useUIStore.getState().addToast('Erro ao atualizar perfil', 'error');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.card}>
        <h2 className={styles.sectionTitle}>Perfil</h2>

        <div className={styles.previewRow}>
          <Avatar name={name || 'U'} color={avatarColor} size="lg" />
          <div className={styles.previewInfo}>
            <span className={styles.previewName}>{name || 'Seu nome'}</span>
            <span className={styles.previewEmail}>{email || 'email@exemplo.com'}</span>
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="settings-name">
            Nome
          </label>
          <input
            id="settings-name"
            type="text"
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome..."
            maxLength={200}
            required
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="settings-email">
            Email
          </label>
          <input
            id="settings-email"
            type="email"
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            maxLength={300}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Cor do avatar</label>
          <div className={styles.colorGrid}>
            {AVATAR_COLORS.map((color) => (
              <motion.button
                key={color}
                type="button"
                className={`${styles.colorOption} ${avatarColor === color ? styles.colorActive : ''}`}
                style={{
                  backgroundColor: color,
                  ...(avatarColor === color
                    ? { boxShadow: '0 0 0 2px #fff, 0 0 16px ' + color }
                    : {}),
                }}
                onClick={() => setAvatarColor(color)}
                aria-label={`Cor ${color}`}
                title={color}
                whileHover={{ scale: 1.2, transition: springTransition }}
                whileTap={{ scale: 0.95 }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <button
          type="submit"
          className={styles.btnPrimary}
          disabled={isSaving}
        >
          {isSaving ? 'Salvando...' : 'Salvar alteracoes'}
        </button>
      </div>
    </form>
  );
}
