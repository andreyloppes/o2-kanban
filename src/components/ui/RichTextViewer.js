'use client';

import styles from './RichTextEditor.module.css';

export default function RichTextViewer({ content }) {
  if (!content) return null;

  return (
    <div
      className={styles.viewer}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
