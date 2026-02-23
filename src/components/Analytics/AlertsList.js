'use client';

import { AlertTriangle, CheckCircle } from 'lucide-react';
import styles from './AlertsList.module.css';

export default function AlertsList({ alerts }) {
  if (!alerts || alerts.length === 0) {
    return (
      <div className={styles.empty}>
        <CheckCircle size={20} className={styles.emptyIcon} />
        <span className={styles.emptyText}>
          Nenhum alerta. Tudo esta em ordem!
        </span>
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {alerts.map((alert, i) => (
        <div
          key={i}
          className={`${styles.alert} ${alert.type === 'danger' ? styles.alertDanger : styles.alertWarning}`}
        >
          <AlertTriangle size={16} className={styles.alertIcon} />
          <span className={styles.alertMessage}>{alert.message}</span>
        </div>
      ))}
    </div>
  );
}
