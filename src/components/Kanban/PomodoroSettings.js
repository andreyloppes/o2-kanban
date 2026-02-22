'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Timer, Coffee, Repeat } from 'lucide-react';
import usePomodoro from '@/hooks/usePomodoro';
import styles from './PomodoroSettings.module.css';

const FOCUS_PRESETS = [25, 30, 40, 50];
const SHORT_BREAK_PRESETS = [5, 10, 15];
const LONG_BREAK_PRESETS = [15, 20, 30];

export default function PomodoroSettings({ onClose }) {
  const { settings, updateSettings } = usePomodoro();
  const ref = useRef(null);

  const [focusMin, setFocusMin] = useState(Math.round(settings.focusDurationMs / 60000));
  const [shortBreakMin, setShortBreakMin] = useState(Math.round(settings.shortBreakMs / 60000));
  const [longBreakMin, setLongBreakMin] = useState(Math.round(settings.longBreakMs / 60000));
  const [sessionsBeforeLong, setSessionsBeforeLong] = useState(settings.sessionsBeforeLongBreak);
  const [autoStartBreak, setAutoStartBreak] = useState(settings.autoStartBreak);
  const [autoStartFocus, setAutoStartFocus] = useState(settings.autoStartFocus);
  const [linkToTask, setLinkToTask] = useState(settings.linkToTaskTimer);

  const [customFocus, setCustomFocus] = useState(!FOCUS_PRESETS.includes(focusMin));
  const [customShortBreak, setCustomShortBreak] = useState(!SHORT_BREAK_PRESETS.includes(shortBreakMin));
  const [customLongBreak, setCustomLongBreak] = useState(!LONG_BREAK_PRESETS.includes(longBreakMin));

  // Close on click outside
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  function handleSave() {
    updateSettings({
      focusDurationMs: Math.max(1, focusMin) * 60000,
      shortBreakMs: Math.max(1, shortBreakMin) * 60000,
      longBreakMs: Math.max(1, longBreakMin) * 60000,
      sessionsBeforeLongBreak: Math.max(1, sessionsBeforeLong),
      autoStartBreak,
      autoStartFocus,
      linkToTaskTimer: linkToTask,
    });
    onClose();
  }

  function selectFocusPreset(val) {
    setFocusMin(val);
    setCustomFocus(false);
  }

  function selectShortBreakPreset(val) {
    setShortBreakMin(val);
    setCustomShortBreak(false);
  }

  function selectLongBreakPreset(val) {
    setLongBreakMin(val);
    setCustomLongBreak(false);
  }

  return (
    <div className={styles.popover} ref={ref}>
      <div className={styles.header}>
        <span className={styles.title}>Configuracoes do Pomodoro</span>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar">
          <X size={14} />
        </button>
      </div>

      <div className={styles.body}>
        {/* Foco */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <Timer size={14} className={styles.sectionIcon} />
            <span className={styles.sectionLabel}>Tempo de foco</span>
          </div>
          <div className={styles.presetRow}>
            {FOCUS_PRESETS.map((val) => (
              <button
                key={val}
                className={`${styles.preset} ${!customFocus && focusMin === val ? styles.presetActive : ''}`}
                onClick={() => selectFocusPreset(val)}
              >
                {val}min
              </button>
            ))}
            <button
              className={`${styles.preset} ${styles.presetCustom} ${customFocus ? styles.presetActive : ''}`}
              onClick={() => setCustomFocus(true)}
            >
              Outro
            </button>
          </div>
          {customFocus && (
            <div className={styles.customInput}>
              <input
                type="number"
                className={styles.input}
                value={focusMin}
                onChange={(e) => setFocusMin(Number(e.target.value))}
                min={1}
                max={120}
                autoFocus
              />
              <span className={styles.inputSuffix}>min</span>
            </div>
          )}
        </div>

        {/* Pausa curta */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <Coffee size={14} className={styles.sectionIcon} />
            <span className={styles.sectionLabel}>Pausa curta</span>
          </div>
          <div className={styles.presetRow}>
            {SHORT_BREAK_PRESETS.map((val) => (
              <button
                key={val}
                className={`${styles.preset} ${!customShortBreak && shortBreakMin === val ? styles.presetActive : ''}`}
                onClick={() => selectShortBreakPreset(val)}
              >
                {val}min
              </button>
            ))}
            <button
              className={`${styles.preset} ${styles.presetCustom} ${customShortBreak ? styles.presetActive : ''}`}
              onClick={() => setCustomShortBreak(true)}
            >
              Outro
            </button>
          </div>
          {customShortBreak && (
            <div className={styles.customInput}>
              <input
                type="number"
                className={styles.input}
                value={shortBreakMin}
                onChange={(e) => setShortBreakMin(Number(e.target.value))}
                min={1}
                max={60}
                autoFocus
              />
              <span className={styles.inputSuffix}>min</span>
            </div>
          )}
        </div>

        {/* Pausa longa */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <Coffee size={14} className={styles.sectionIconBreak} />
            <span className={styles.sectionLabel}>Pausa longa</span>
          </div>
          <div className={styles.presetRow}>
            {LONG_BREAK_PRESETS.map((val) => (
              <button
                key={val}
                className={`${styles.preset} ${!customLongBreak && longBreakMin === val ? styles.presetActive : ''}`}
                onClick={() => selectLongBreakPreset(val)}
              >
                {val}min
              </button>
            ))}
            <button
              className={`${styles.preset} ${styles.presetCustom} ${customLongBreak ? styles.presetActive : ''}`}
              onClick={() => setCustomLongBreak(true)}
            >
              Outro
            </button>
          </div>
          {customLongBreak && (
            <div className={styles.customInput}>
              <input
                type="number"
                className={styles.input}
                value={longBreakMin}
                onChange={(e) => setLongBreakMin(Number(e.target.value))}
                min={1}
                max={60}
                autoFocus
              />
              <span className={styles.inputSuffix}>min</span>
            </div>
          )}
        </div>

        {/* Ciclo */}
        <div className={styles.divider} />

        <div className={styles.field}>
          <div className={styles.fieldLabel}>
            <Repeat size={14} className={styles.sectionIcon} />
            <span>Sessoes antes da pausa longa</span>
          </div>
          <div className={styles.presetRow}>
            {[2, 3, 4, 6].map((val) => (
              <button
                key={val}
                className={`${styles.preset} ${styles.presetSmall} ${sessionsBeforeLong === val ? styles.presetActive : ''}`}
                onClick={() => setSessionsBeforeLong(val)}
              >
                {val}
              </button>
            ))}
          </div>
        </div>

        {/* Toggles */}
        <div className={styles.divider} />

        <div className={styles.toggleGroup}>
          <label className={styles.toggleLabel}>
            <span className={styles.toggleText}>Iniciar pausa automaticamente</span>
            <div className={`${styles.switch} ${autoStartBreak ? styles.switchOn : ''}`}
              onClick={() => setAutoStartBreak(!autoStartBreak)}
              role="switch"
              aria-checked={autoStartBreak}
              tabIndex={0}
            >
              <div className={styles.switchThumb} />
            </div>
          </label>

          <label className={styles.toggleLabel}>
            <span className={styles.toggleText}>Iniciar foco automaticamente</span>
            <div className={`${styles.switch} ${autoStartFocus ? styles.switchOn : ''}`}
              onClick={() => setAutoStartFocus(!autoStartFocus)}
              role="switch"
              aria-checked={autoStartFocus}
              tabIndex={0}
            >
              <div className={styles.switchThumb} />
            </div>
          </label>

          <label className={styles.toggleLabel}>
            <span className={styles.toggleText}>Vincular ao timer de tarefa</span>
            <div className={`${styles.switch} ${linkToTask ? styles.switchOn : ''}`}
              onClick={() => setLinkToTask(!linkToTask)}
              role="switch"
              aria-checked={linkToTask}
              tabIndex={0}
            >
              <div className={styles.switchThumb} />
            </div>
          </label>
        </div>
      </div>

      <div className={styles.footer}>
        <button className={styles.cancelBtn} onClick={onClose}>
          Cancelar
        </button>
        <button className={styles.saveBtn} onClick={handleSave}>
          Salvar
        </button>
      </div>
    </div>
  );
}
