'use client';

import { useState, useRef } from 'react';
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
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url || null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  async function handleAvatarUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`/api/users/${user.id}/avatar`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao enviar foto');
      }

      const { user: updatedUser } = await res.json();
      setAvatarUrl(updatedUser.avatar_url);

      const current = useUserStore.getState().currentUser;
      if (current && current.id === user.id) {
        useUserStore.getState().setCurrentUser({ ...current, avatar_url: updatedUser.avatar_url });
      }

      useUIStore.getState().addToast('Foto atualizada com sucesso', 'success');
    } catch (err) {
      useUIStore.getState().addToast(err.message || 'Erro ao enviar foto', 'error');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleRemoveAvatar() {
    setIsUploading(true);
    try {
      const res = await fetch(`/api/users/${user.id}/avatar`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erro ao remover foto');

      setAvatarUrl(null);

      const current = useUserStore.getState().currentUser;
      if (current && current.id === user.id) {
        useUserStore.getState().setCurrentUser({ ...current, avatar_url: null });
      }

      useUIStore.getState().addToast('Foto removida', 'success');
    } catch {
      useUIStore.getState().addToast('Erro ao remover foto', 'error');
    } finally {
      setIsUploading(false);
    }
  }

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
          <Avatar name={name || 'U'} color={avatarColor} size="lg" avatarUrl={avatarUrl} />
          <div className={styles.previewInfo}>
            <span className={styles.previewName}>{name || 'Seu nome'}</span>
            <span className={styles.previewEmail}>{email || 'email@exemplo.com'}</span>
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Foto do perfil</label>
          <div className={styles.photoActions}>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? 'Enviando...' : avatarUrl ? 'Trocar foto' : 'Enviar foto'}
            </button>
            {avatarUrl && (
              <button
                type="button"
                className={styles.btnDanger}
                onClick={handleRemoveAvatar}
                disabled={isUploading}
              >
                Remover foto
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleAvatarUpload}
              style={{ display: 'none' }}
            />
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
