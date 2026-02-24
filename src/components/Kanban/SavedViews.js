'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Bookmark, ChevronDown, X, Check } from 'lucide-react';
import useUIStore from '@/stores/useUIStore';
import styles from './SavedViews.module.css';

export default function SavedViews() {
  const { boardId } = useParams();
  const [views, setViews] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [activeViewId, setActiveViewId] = useState(null);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  const fetchViews = useCallback(async () => {
    if (!boardId) return;
    try {
      const res = await fetch(`/api/boards/${boardId}/views`);
      if (res.ok) {
        const data = await res.json();
        setViews(data.views || []);
      }
    } catch {
      // silently fail
    }
  }, [boardId]);

  useEffect(() => {
    fetchViews();
  }, [fetchViews]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
        setIsCreating(false);
        setNewName('');
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Focus input when creating
  useEffect(() => {
    if (isCreating && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCreating]);

  async function handleApplyView(view) {
    setActiveViewId(view.id);

    // Apply filters
    const store = useUIStore.getState();
    store.clearFilters();
    if (view.filters) {
      Object.entries(view.filters).forEach(([key, value]) => {
        if (value) store.setFilter(key, value);
      });
    }

    // Apply view type
    if (view.view_type) {
      store.setBoardView(view.view_type);
    }

    setIsOpen(false);
  }

  async function handleSaveView() {
    if (!newName.trim() || !boardId) return;

    setLoading(true);
    try {
      const filters = useUIStore.getState().filters;
      const viewType = useUIStore.getState().boardView;

      // Build clean filters object (only non-null, non-empty values)
      const cleanFilters = {};
      if (filters.type) cleanFilters.type = filters.type;
      if (filters.priority) cleanFilters.priority = filters.priority;
      if (filters.assignee) cleanFilters.assignee = filters.assignee;
      if (filters.search) cleanFilters.search = filters.search;

      const res = await fetch(`/api/boards/${boardId}/views`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          filters: cleanFilters,
          view_type: viewType,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setViews((prev) => [...prev, data.view].sort((a, b) => a.name.localeCompare(b.name)));
        setActiveViewId(data.view.id);
        setNewName('');
        setIsCreating(false);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteView(e, viewId) {
    e.stopPropagation();
    if (!boardId) return;

    try {
      const res = await fetch(`/api/boards/${boardId}/views/${viewId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setViews((prev) => prev.filter((v) => v.id !== viewId));
        if (activeViewId === viewId) {
          setActiveViewId(null);
        }
      }
    } catch {
      // silently fail
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      handleSaveView();
    } else if (e.key === 'Escape') {
      setIsCreating(false);
      setNewName('');
    }
  }

  const activeView = views.find((v) => v.id === activeViewId);

  return (
    <div className={styles.container} ref={dropdownRef}>
      <button
        type="button"
        className={`${styles.trigger} ${activeViewId ? styles.triggerActive : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bookmark size={14} />
        <span>{activeView ? activeView.name : 'Views'}</span>
        <ChevronDown size={14} className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`} />
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          {views.length > 0 && (
            <div className={styles.viewList}>
              {views.map((view) => (
                <div
                  key={view.id}
                  className={`${styles.viewItem} ${activeViewId === view.id ? styles.viewItemActive : ''}`}
                  onClick={() => handleApplyView(view)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyView(view)}
                >
                  <span className={styles.viewName}>{view.name}</span>
                  <span className={styles.viewType}>{view.view_type}</span>
                  <button
                    type="button"
                    className={styles.deleteBtn}
                    onClick={(e) => handleDeleteView(e, view.id)}
                    title="Remover view"
                    aria-label={`Remover view ${view.name}`}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {views.length === 0 && !isCreating && (
            <div className={styles.emptyState}>
              Nenhuma view salva
            </div>
          )}

          <div className={styles.divider} />

          {isCreating ? (
            <div className={styles.createForm}>
              <input
                ref={inputRef}
                type="text"
                className={styles.nameInput}
                placeholder="Nome da view..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={handleKeyDown}
                maxLength={100}
              />
              <button
                type="button"
                className={styles.confirmBtn}
                onClick={handleSaveView}
                disabled={!newName.trim() || loading}
                title="Salvar view"
              >
                <Check size={14} />
              </button>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => {
                  setIsCreating(false);
                  setNewName('');
                }}
                title="Cancelar"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              className={styles.saveBtn}
              onClick={() => setIsCreating(true)}
            >
              <Bookmark size={14} />
              Salvar view atual
            </button>
          )}
        </div>
      )}
    </div>
  );
}
