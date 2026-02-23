'use client';

import styles from './ChatMessage.module.css';

function formatContent(text) {
  // Bold: **text**
  let html = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // Inline code: `text`
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  // Unordered lists: lines starting with - or *
  html = html.replace(/^[\-\*]\s+(.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
  // Line breaks
  html = html.replace(/\n/g, '<br/>');
  return html;
}

function formatTime(dateStr) {
  const d = new Date(dateStr);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export default function ChatMessage({ role, content, createdAt }) {
  const isUser = role === 'user';

  return (
    <div className={`${styles.message} ${isUser ? styles.messageUser : styles.messageAssistant}`}>
      <div
        className={`${styles.bubble} ${isUser ? styles.bubbleUser : styles.bubbleAssistant}`}
        dangerouslySetInnerHTML={{ __html: formatContent(content) }}
      />
      {createdAt && (
        <span className={`${styles.timestamp} ${isUser ? styles.timestampUser : styles.timestampAssistant}`}>
          {formatTime(createdAt)}
        </span>
      )}
    </div>
  );
}
