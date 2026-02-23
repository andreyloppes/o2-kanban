'use client';

import { useState, useEffect } from 'react';
import { Clock, X } from 'lucide-react';
import styles from './DurationInput.module.css';

/**
 * Input de duracao em horas e minutos.
 * @param {Object} props
 * @param {number|null} props.value - Duracao total em minutos
 * @param {function} props.onChange - Callback com valor em minutos ou null
 * @param {boolean} [props.disabled=false]
 * @param {string} [props.placeholder='Sem estimativa']
 */
export default function DurationInput({
  value = null,
  onChange,
  disabled = false,
  placeholder = 'Sem estimativa',
}) {
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');

  useEffect(() => {
    if (value === null || value === undefined) {
      setHours('');
      setMinutes('');
    } else {
      setHours(String(Math.floor(value / 60)));
      setMinutes(String(value % 60));
    }
  }, [value]);

  const handleHoursChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 3);
    setHours(val);
    emitChange(val, minutes);
  };

  const handleMinutesChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 2);
    if (Number(val) > 59) val = '59';
    setMinutes(val);
    emitChange(hours, val);
  };

  const emitChange = (h, m) => {
    const hNum = parseInt(h, 10) || 0;
    const mNum = parseInt(m, 10) || 0;
    if (hNum === 0 && mNum === 0 && !h && !m) {
      onChange(null);
    } else {
      onChange(hNum * 60 + mNum);
    }
  };

  const handleClear = () => {
    setHours('');
    setMinutes('');
    onChange(null);
  };

  const hasValue = hours !== '' || minutes !== '';

  return (
    <div className={`${styles.container} ${disabled ? styles.disabled : ''}`}>
      <Clock size={16} className={styles.icon} />
      <input
        type="text"
        inputMode="numeric"
        className={styles.input}
        value={hours}
        onChange={handleHoursChange}
        placeholder="00"
        disabled={disabled}
        aria-label="Horas"
      />
      <span className={styles.separator}>h</span>
      <input
        type="text"
        inputMode="numeric"
        className={styles.input}
        value={minutes}
        onChange={handleMinutesChange}
        placeholder="00"
        disabled={disabled}
        aria-label="Minutos"
      />
      <span className={styles.separator}>m</span>
      {hasValue && !disabled && (
        <button
          type="button"
          className={styles.clearBtn}
          onClick={handleClear}
          aria-label="Limpar duracao"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
