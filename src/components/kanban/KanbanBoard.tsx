import { useCallback, useMemo, useState } from 'react';
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import type { Card, Column } from '../../types/kanban';
import KanbanColumn from './KanbanColumn';
import { cn } from '../../utils/cn';

type KanbanBoardProps = {
  columns: Column[];
  onChange: React.Dispatch<React.SetStateAction<Column[]>>;
};

const columnColorMap: Record<string, string> = {
  todo: 'bg-blue-500',
  'in-progress': 'bg-amber-500',
  done: 'bg-emerald-500',
};

const makeCardId = () => `card-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

function KanbanBoard({ columns, onChange }: KanbanBoardProps) {
  const [addingColumnId, setAddingColumnId] = useState<string | null>(null);
  const [addValue, setAddValue] = useState('');

  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [activeCardId, setActiveCardId] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const findColumnByCardId = useCallback(
    (allColumns: Column[], cardId: string) =>
      allColumns.find((column) => column.cards.some((card) => card.id === cardId)),
    []
  );

  const activeCard = useMemo(() => {
    if (!activeCardId) {
      return null;
    }

    return columns.flatMap((column) => column.cards).find((card) => card.id === activeCardId) ?? null;
  }, [activeCardId, columns]);

  const handleSaveAdd = useCallback((columnId: string) => {
    const title = addValue.trim();
    if (!title) {
      setAddingColumnId(null);
      setAddValue('');
      return;
    }

    onChange((prevColumns) =>
      prevColumns.map((column) => {
        if (column.id !== columnId) {
          return column;
        }

        return {
          ...column,
          cards: [...column.cards, { id: makeCardId(), title }],
        };
      })
    );

    setAddingColumnId(null);
    setAddValue('');
  }, [addValue, onChange]);

  const handleDeleteCard = useCallback((columnId: string, cardId: string) => {
    onChange((prevColumns) =>
      prevColumns.map((column) => {
        if (column.id !== columnId) {
          return column;
        }

        return {
          ...column,
          cards: column.cards.filter((card) => card.id !== cardId),
        };
      })
    );
  }, [onChange]);

  const handleSaveEdit = useCallback(() => {
    const title = editingValue.trim();
    if (!editingCardId || !title) {
      setEditingCardId(null);
      setEditingValue('');
      return;
    }

    onChange((prevColumns) =>
      prevColumns.map((column) => ({
        ...column,
        cards: column.cards.map((card) =>
          card.id === editingCardId
            ? {
                ...card,
                title,
              }
            : card
        ),
      }))
    );

    setEditingCardId(null);
    setEditingValue('');
  }, [editingCardId, editingValue, onChange]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const activeIdRaw = event.active.id;
    if (typeof activeIdRaw !== 'string') {
      return;
    }

    const cardId = activeIdRaw.startsWith('card:') ? activeIdRaw.slice(5) : null;
    setActiveCardId(cardId);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveCardId(null);

    const activeIdRaw = event.active.id;
    const overIdRaw = event.over?.id;

    if (typeof activeIdRaw !== 'string' || typeof overIdRaw !== 'string') {
      return;
    }

    const activeCardId = activeIdRaw.startsWith('card:') ? activeIdRaw.slice(5) : null;
    if (!activeCardId) {
      return;
    }

    onChange((prevColumns) => {
      const sourceColumn = findColumnByCardId(prevColumns, activeCardId);
      if (!sourceColumn) {
        return prevColumns;
      }

      const sourceIndex = sourceColumn.cards.findIndex((card) => card.id === activeCardId);
      if (sourceIndex < 0) {
        return prevColumns;
      }

      let destinationColumnId: string | null = null;
      let destinationIndex = 0;

      if (overIdRaw.startsWith('card:')) {
        const overCardId = overIdRaw.slice(5);
        const destinationColumn = findColumnByCardId(prevColumns, overCardId);
        if (!destinationColumn) {
          return prevColumns;
        }

        destinationColumnId = destinationColumn.id;
        destinationIndex = destinationColumn.cards.findIndex((card) => card.id === overCardId);
      } else if (overIdRaw.startsWith('column:')) {
        destinationColumnId = overIdRaw.slice(7);
        const destinationColumn = prevColumns.find((column) => column.id === destinationColumnId);
        if (!destinationColumn) {
          return prevColumns;
        }

        destinationIndex = destinationColumn.cards.length;
      } else {
        return prevColumns;
      }

      if (!destinationColumnId) {
        return prevColumns;
      }

      if (sourceColumn.id === destinationColumnId) {
        if (sourceIndex === destinationIndex) {
          return prevColumns;
        }

        return prevColumns.map((column) => {
          if (column.id !== sourceColumn.id) {
            return column;
          }

          return {
            ...column,
            cards: arrayMove(column.cards, sourceIndex, destinationIndex),
          };
        });
      }

      // Cross-column move: remove from source and insert into destination preserving order.
      const sourceCard = sourceColumn.cards[sourceIndex];
      return prevColumns.map((column) => {
        if (column.id === sourceColumn.id) {
          return {
            ...column,
            cards: column.cards.filter((card) => card.id !== activeCardId),
          };
        }

        if (column.id === destinationColumnId) {
          const nextCards = [...column.cards];
          nextCards.splice(destinationIndex, 0, sourceCard);

          return {
            ...column,
            cards: nextCards,
          };
        }

        return column;
      });
    });
  }, [findColumnByCardId, onChange]);

  const handleStartAdd = useCallback((columnId: string) => {
    setAddingColumnId(columnId);
    setAddValue('');
  }, []);

  const handleCancelAdd = useCallback(() => {
    setAddingColumnId(null);
    setAddValue('');
  }, []);

  const handleStartEditCard = useCallback((cardId: string, title: string) => {
    setEditingCardId(cardId);
    setEditingValue(title);
  }, []);

  const handleCancelEditCard = useCallback(() => {
    setEditingCardId(null);
    setEditingValue('');
  }, []);

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="overflow-x-auto pb-1">
        <div className="grid min-w-[280px] grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              colorClass={columnColorMap[column.id] ?? 'bg-slate-600'}
              isAdding={addingColumnId === column.id}
              addValue={addValue}
              editingCardId={editingCardId}
              editingValue={editingValue}
              onStartAdd={handleStartAdd}
              onAddValueChange={setAddValue}
              onSaveAdd={handleSaveAdd}
              onCancelAdd={handleCancelAdd}
              onStartEditCard={handleStartEditCard}
              onEditCardValueChange={setEditingValue}
              onSaveEditCard={handleSaveEdit}
              onCancelEditCard={handleCancelEditCard}
              onDeleteCard={handleDeleteCard}
            />
          ))}
        </div>
      </div>

      <DragOverlay>
        {activeCard ? (
          <KanbanDragPreview card={activeCard} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function KanbanDragPreview({ card }: { card: Card }) {
  return (
    <article
      className={cn(
        'w-[260px] scale-[1.03] rounded-lg border border-slate-300 bg-white p-3 opacity-90 shadow-xl',
        'dark:border-slate-600 dark:bg-slate-900'
      )}
    >
      <div className="flex items-start gap-2">
        <span className="mt-1 h-3 w-1 rounded-full bg-slate-300 dark:bg-slate-600" />
        <p className="text-sm font-medium text-slate-700 dark:text-slate-100">{card.title}</p>
      </div>
    </article>
  );
}

export default KanbanBoard;
