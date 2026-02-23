'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, Bot } from 'lucide-react';
import useUIStore from '@/stores/useUIStore';
import useBoardStore from '@/stores/useBoardStore';
import ChatMessage from './ChatMessage';
import styles from './ChatPanel.module.css';

export default function ChatPanel() {
  const aiChatOpen = useUIStore((state) => state.aiChatOpen);
  const boardId = useBoardStore((state) => state.board?.id);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  useEffect(() => {
    if (aiChatOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [aiChatOpen]);

  // Escape to close
  useEffect(() => {
    if (!aiChatOpen) return;
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        useUIStore.getState().closeAIChat();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [aiChatOpen]);

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || isLoading || !boardId) return;

    const userMessage = {
      role: 'user',
      content: trimmed,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boardId, message: trimmed, history }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao enviar mensagem');
      }

      const assistantMessage = {
        role: 'assistant',
        content: data.message,
        createdAt: new Date().toISOString(),
        actions: data.actions || [],
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Se houve acoes executadas, recarregar dados do board
      if (data.actions && data.actions.some((a) => a.success)) {
        // Recarregar board data
        try {
          const boardRes = await fetch(`/api/boards/${boardId}`);
          if (boardRes.ok) {
            const boardData = await boardRes.json();
            useBoardStore.getState().hydrate(
              boardData.board,
              boardData.columns,
              boardData.tasks,
              boardData.members
            );
          }
        } catch {
          // Silently fail — board will be stale until next refresh
        }
      }
    } catch (error) {
      const errorMessage = {
        role: 'assistant',
        content: `Erro: ${error.message}`,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) {
      useUIStore.getState().closeAIChat();
    }
  }

  if (!aiChatOpen) return null;

  const hasActions = (msg) => msg.actions && msg.actions.length > 0;

  return (
    <>
      <div className={styles.overlay} onClick={handleOverlayClick} />
      <div className={styles.panel} role="complementary" aria-label="Agente IA">
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <Bot size={18} className={styles.headerIcon} />
            <span>Agente IA</span>
          </div>
          <button
            className={styles.closeBtn}
            onClick={() => useUIStore.getState().closeAIChat()}
            aria-label="Fechar chat"
          >
            <X size={16} />
          </button>
        </div>

        <div className={styles.messages}>
          {messages.length === 0 && !isLoading && (
            <div className={styles.emptyState}>
              <Bot size={40} className={styles.emptyIcon} />
              <p className={styles.emptyText}>
                Ola! Sou o agente de IA deste board. Posso ajudar com resumos, sugestoes e gerenciamento de tarefas.
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i}>
              <ChatMessage
                role={msg.role}
                content={msg.content}
                createdAt={msg.createdAt}
              />
              {hasActions(msg) && (
                <div className={styles.actionResults}>
                  {msg.actions.map((action, j) => (
                    <span
                      key={j}
                      className={action.success ? styles.actionSuccess : styles.actionError}
                    >
                      {action.success ? action.result : action.error}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className={styles.loading}>
              <div className={styles.loadingDots}>
                <span className={styles.dot} />
                <span className={styles.dot} />
                <span className={styles.dot} />
              </div>
              <span className={styles.loadingText}>Pensando...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className={styles.inputBar}>
          <textarea
            ref={inputRef}
            className={styles.input}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pergunte algo sobre o board..."
            rows={1}
            disabled={isLoading}
          />
          <button
            className={styles.sendBtn}
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            aria-label="Enviar mensagem"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </>
  );
}
