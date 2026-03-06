"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import useBoardTaskStore from "@/stores/useBoardTaskStore";
import CardLinkSelector from "@/components/ui/CardLinkSelector";

export default function BoardTaskForm({ boardId }) {
  const [title, setTitle] = useState("");
  const [cardId, setCardId] = useState(null);
  const [cardTitle, setCardTitle] = useState(null);
  const [showLink, setShowLink] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    await useBoardTaskStore.getState().addBoardTask(boardId, {
      title: trimmed,
      card_id: cardId,
      card_title: cardTitle,
    });

    setTitle("");
    setCardId(null);
    setCardTitle(null);
    setShowLink(false);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  return (
    <form className="board-task-form" onSubmit={handleSubmit}>
      <div className="board-task-form-row">
        <input
          type="text"
          className="board-task-input"
          placeholder="Nova tarefa..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={500}
        />
        <button
          type="submit"
          className="board-task-add-btn"
          disabled={!title.trim()}
          title="Adicionar tarefa"
        >
          <Plus size={16} />
        </button>
      </div>
      {showLink ? (
        <CardLinkSelector
          value={cardId}
          onChange={(id, name) => {
            setCardId(id);
            setCardTitle(name || null);
          }}
        />
      ) : (
        <button
          type="button"
          className="board-task-link-toggle"
          onClick={() => setShowLink(true)}
        >
          Vincular a um card
        </button>
      )}
    </form>
  );
}
