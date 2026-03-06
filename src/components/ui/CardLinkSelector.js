"use client";

import { useState, useRef, useEffect } from "react";
import { Link2, X, Search } from "lucide-react";
import useBoardStore from "@/stores/useBoardStore";

export default function CardLinkSelector({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);
  const tasks = useBoardStore((state) => state.tasks);
  const columns = useBoardStore((state) => state.columns);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const grouped = columns
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((col) => ({
      ...col,
      tasks: tasks
        .filter(
          (t) =>
            t.column_id === col.id &&
            t.title.toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) => a.position - b.position),
    }))
    .filter((col) => col.tasks.length > 0);

  const selectedTask = value ? tasks.find((t) => t.id === value) : null;

  return (
    <div className="card-link-selector" ref={ref}>
      <button
        type="button"
        className="card-link-trigger"
        onClick={() => setOpen(!open)}
        title={selectedTask ? selectedTask.title : "Vincular a um card"}
      >
        <Link2 size={14} />
        <span className="card-link-label">
          {selectedTask ? selectedTask.title : "Vincular card"}
        </span>
        {selectedTask && (
          <span
            className="card-link-clear"
            onClick={(e) => {
              e.stopPropagation();
              onChange(null);
            }}
          >
            <X size={12} />
          </span>
        )}
      </button>

      {open && (
        <div className="card-link-dropdown">
          <div className="card-link-search">
            <Search size={14} />
            <input
              type="text"
              placeholder="Buscar card..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <div className="card-link-options">
            <button
              type="button"
              className={`card-link-option ${!value ? "selected" : ""}`}
              onClick={() => {
                onChange(null);
                setOpen(false);
                setSearch("");
              }}
            >
              Sem vinculo
            </button>
            {grouped.map((col) => (
              <div key={col.id} className="card-link-group">
                <div className="card-link-group-title">{col.title}</div>
                {col.tasks.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className={`card-link-option ${value === t.id ? "selected" : ""}`}
                    onClick={() => {
                      onChange(t.id, t.title);
                      setOpen(false);
                      setSearch("");
                    }}
                  >
                    {t.title}
                  </button>
                ))}
              </div>
            ))}
            {grouped.length === 0 && (
              <div className="card-link-empty">Nenhum card encontrado</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
