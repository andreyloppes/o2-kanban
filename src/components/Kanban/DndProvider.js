"use client";

import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import useDragAndDrop from "@/hooks/useDragAndDrop";
import useBoardStore from "@/stores/useBoardStore";
import Card from "./Card";

/**
 * Wrapper que encapsula DndContext, sensores e DragOverlay.
 * Toda a lógica de DnD vive aqui + useDragAndDrop hook.
 */
export default function DndProvider({ children }) {
  const { activeId, handleDragStart, handleDragOver, handleDragEnd } =
    useDragAndDrop();

  const activeTask = useBoardStore((state) =>
    activeId ? state.getTaskById(activeId) : null
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <DndContext
      id="dnd-context"
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      {children}

      <DragOverlay>
        {activeTask ? <Card task={activeTask} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
