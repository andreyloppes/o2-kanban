"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Trash2 } from "lucide-react";
import useBoardStore from "@/stores/useBoardStore";
import useUIStore from "@/stores/useUIStore";
import { COMMENT_AUTHOR_KEY } from "@/lib/constants";
import CommentItem from "@/components/ui/CommentItem";
import CommentInput from "@/components/ui/CommentInput";
import Select from "@/components/ui/Select";
import styles from "./CommentSection.module.css";

const EMPTY_COMMENTS = [];

export default function CommentSection({ taskId }) {
  const comments = useBoardStore((state) => state.commentsCache[taskId]) ?? EMPTY_COMMENTS;
  const isLoading = useBoardStore(
    (state) => !!state.commentsLoading[taskId]
  );
  const members = useBoardStore((state) => state.members);
  const [author, setAuthor] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const authorOptions = members
    .filter((m) => m.user)
    .map((m) => ({ value: m.user.name, label: m.user.name }));

  // Load saved author from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(COMMENT_AUTHOR_KEY);
    if (saved) {
      setAuthor(saved);
    } else if (members.length > 0 && members[0].user) {
      setAuthor(members[0].user.name);
    }
  }, [members]);

  // Persist author selection
  useEffect(() => {
    if (author) {
      localStorage.setItem(COMMENT_AUTHOR_KEY, author);
    }
  }, [author]);

  // Lazy-load comments when taskId changes
  useEffect(() => {
    if (taskId) {
      useBoardStore.getState().fetchComments(taskId);
    }
  }, [taskId]);

  async function handleSubmit(content) {
    if (!author) {
      useUIStore.getState().addToast("Selecione um autor", "error");
      return;
    }
    setIsSubmitting(true);
    await useBoardStore.getState().addComment(taskId, author, content);
    setIsSubmitting(false);
  }

  function handleDelete(commentId) {
    useUIStore.getState().showConfirmDialog({
      title: "Excluir comentario",
      message: "Tem certeza que deseja excluir este comentario?",
      confirmLabel: "Excluir",
      onConfirm: async () => {
        await useBoardStore.getState().deleteComment(taskId, commentId);
        useUIStore.getState().hideConfirmDialog();
      },
    });
  }

  return (
    <div className={styles.commentSection}>
      <div className={styles.sectionHeader}>
        <MessageSquare size={16} />
        <span>Comentarios</span>
        {comments.length > 0 && (
          <span className={styles.commentCount}>{comments.length}</span>
        )}
      </div>

      {isLoading ? (
        <div className={styles.loadingState}>Carregando comentarios...</div>
      ) : comments.length === 0 ? (
        <div className={styles.emptyState}>Nenhum comentario ainda</div>
      ) : (
        <div className={styles.commentList}>
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              author={comment.author}
              content={comment.content}
              timestamp={comment.created_at}
              isOptimistic={String(comment.id).startsWith("temp-")}
              actions={
                <button
                  className={styles.deleteBtn}
                  onClick={() => handleDelete(comment.id)}
                  aria-label="Excluir comentario"
                  title="Excluir comentario"
                >
                  <Trash2 size={14} />
                </button>
              }
            />
          ))}
        </div>
      )}

      <div className={styles.authorSelect}>
        <span className={styles.authorLabel}>Comentar como:</span>
        <Select
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          options={authorOptions}
          placeholder="Selecione..."
        />
      </div>

      <CommentInput
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        disabled={!author}
      />
    </div>
  );
}
