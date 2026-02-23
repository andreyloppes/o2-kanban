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
import {
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import useDragAndDrop from "@/hooks/useDragAndDrop";
import useBoardStore from "@/stores/useBoardStore";
import Card from "./Card";

/**
 * Wrapper que encapsula DndContext, sensores e DragOverlay.
 * Toda a lógica de DnD vive aqui + useDragAndDrop hook.
 * Suporta drag de tasks e drag de colunas para reordenar.
 */
export default function DndProvider({ children }) {
  const { activeId, activeType, handleDragStart, handleDragOver, handleDragEnd } =
    useDragAndDrop();

  const activeTask = useBoardStore((state) =>
    activeId && activeType === 'task' ? state.getTaskById(activeId) : null
  );

  const columns = useBoardStore((state) => state.columns);
  const sortedColumnIds = columns
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((c) => c.id);

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
      <SortableContext items={sortedColumnIds} strategy={horizontalListSortingStrategy}>
        {children}
      </SortableContext>

      <DragOverlay>
        {activeTask ? <Card task={activeTask} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
