'use client';

import { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';
import { AUTOMATION_TRIGGERS, AUTOMATION_ACTIONS, TASK_PRIORITIES } from '@/lib/constants';
import styles from './CreateAutomationForm.module.css';

export default function CreateAutomationForm({ boardId, onAutomationCreated }) {
  const [name, setName] = useState('');
  const [triggerType, setTriggerType] = useState('task_moved_to_column');
  const [triggerConfig, setTriggerConfig] = useState({});
  const [actionType, setActionType] = useState('set_priority');
  const [actionConfig, setActionConfig] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [columns, setColumns] = useState([]);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    if (!boardId) return;

    async function fetchOptions() {
      try {
        const [colRes, memRes] = await Promise.all([
          fetch(`/api/boards/${boardId}/columns`),
          fetch(`/api/boards/${boardId}/members`),
        ]);

        if (colRes.ok) {
          const colData = await colRes.json();
          setColumns(colData.columns || []);
        }
        if (memRes.ok) {
          const memData = await memRes.json();
          setMembers(memData.members || []);
        }
      } catch {
        // silencioso
      }
    }

    fetchOptions();
  }, [boardId]);

  // Reset configs quando muda tipo
  useEffect(() => {
    setTriggerConfig({});
  }, [triggerType]);

  useEffect(() => {
    setActionConfig({});
  }, [actionType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName || isSubmitting) return;

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/boards/${boardId}/automations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmedName,
          trigger_type: triggerType,
          trigger_config: triggerConfig,
          action_type: actionType,
          action_config: actionConfig,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFeedback({ type: 'error', message: data.error || 'Erro ao criar automacao' });
        return;
      }

      setFeedback({ type: 'success', message: `Automacao "${trimmedName}" criada com sucesso` });
      setName('');
      setTriggerType('task_moved_to_column');
      setTriggerConfig({});
      setActionType('set_priority');
      setActionConfig({});
      onAutomationCreated?.(data.automation);
    } catch {
      setFeedback({ type: 'error', message: 'Erro de conexao. Tente novamente.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>
        <Zap size={18} />
        Criar automacao
      </h3>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label className={styles.label}>Nome</label>
          <input
            className={styles.input}
            type="text"
            placeholder="Ex: Mover para Done ao concluir..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isSubmitting}
            required
            maxLength={200}
          />
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>Gatilho</label>
            <select
              className={styles.select}
              value={triggerType}
              onChange={(e) => setTriggerType(e.target.value)}
              disabled={isSubmitting}
            >
              {Object.entries(AUTOMATION_TRIGGERS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Acao</label>
            <select
              className={styles.select}
              value={actionType}
              onChange={(e) => setActionType(e.target.value)}
              disabled={isSubmitting}
            >
              {Object.entries(AUTOMATION_ACTIONS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Configuracao do gatilho: coluna (para task_moved_to_column) */}
        {triggerType === 'task_moved_to_column' && columns.length > 0 && (
          <div className={styles.field}>
            <label className={styles.label}>Coluna do gatilho</label>
            <select
              className={styles.select}
              value={triggerConfig.column_id || ''}
              onChange={(e) => setTriggerConfig({ column_id: e.target.value })}
              disabled={isSubmitting}
            >
              <option value="">Qualquer coluna</option>
              {columns.map((col) => (
                <option key={col.id} value={col.id}>{col.title}</option>
              ))}
            </select>
          </div>
        )}

        {/* Configuracao da acao: prioridade */}
        {actionType === 'set_priority' && (
          <div className={styles.field}>
            <label className={styles.label}>Prioridade</label>
            <select
              className={styles.select}
              value={actionConfig.priority || ''}
              onChange={(e) => setActionConfig({ priority: e.target.value })}
              disabled={isSubmitting}
            >
              <option value="">Selecionar...</option>
              {Object.entries(TASK_PRIORITIES).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        )}

        {/* Configuracao da acao: membro */}
        {actionType === 'assign_member' && members.length > 0 && (
          <div className={styles.field}>
            <label className={styles.label}>Responsavel</label>
            <select
              className={styles.select}
              value={actionConfig.assignee || ''}
              onChange={(e) => setActionConfig({ assignee: e.target.value })}
              disabled={isSubmitting}
            >
              <option value="">Selecionar...</option>
              {members.map((m) => (
                <option key={m.id} value={m.user?.name || m.user?.email || ''}>
                  {m.user?.name || m.user?.email || 'Usuario'}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Configuracao da acao: coluna destino */}
        {actionType === 'move_to_column' && columns.length > 0 && (
          <div className={styles.field}>
            <label className={styles.label}>Coluna destino</label>
            <select
              className={styles.select}
              value={actionConfig.column_id || ''}
              onChange={(e) => setActionConfig({ column_id: e.target.value })}
              disabled={isSubmitting}
            >
              <option value="">Selecionar...</option>
              {columns.map((col) => (
                <option key={col.id} value={col.id}>{col.title}</option>
              ))}
            </select>
          </div>
        )}

        {/* Configuracao da acao: comentario */}
        {actionType === 'add_comment' && (
          <div className={styles.field}>
            <label className={styles.label}>Mensagem do comentario</label>
            <input
              className={styles.input}
              type="text"
              placeholder="Mensagem automatica..."
              value={actionConfig.message || ''}
              onChange={(e) => setActionConfig({ message: e.target.value })}
              disabled={isSubmitting}
              maxLength={1000}
            />
          </div>
        )}

        <button
          className={styles.button}
          type="submit"
          disabled={!name.trim() || isSubmitting}
        >
          {isSubmitting ? 'Criando...' : 'Criar Automacao'}
        </button>
      </form>

      {feedback && (
        <p className={`${styles.feedback} ${feedback.type === 'error' ? styles.feedbackError : styles.feedbackSuccess}`}>
          {feedback.message}
        </p>
      )}

      <p className={styles.hint}>
        Automacoes executam acoes automaticamente quando o gatilho configurado ocorrer.
      </p>
    </div>
  );
}
