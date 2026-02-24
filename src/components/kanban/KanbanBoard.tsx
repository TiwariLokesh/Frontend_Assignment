import { useState } from 'react';
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Column } from '../../types/kanban';
import KanbanColumn from './KanbanColumn';

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

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const findColumnByCardId = (allColumns: Column[], cardId: string) =>
    allColumns.find((column) => column.cards.some((card) => card.id === cardId));

  const handleSaveAdd = (columnId: string) => {
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
  };

  const handleDeleteCard = (columnId: string, cardId: string) => {
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
  };

  const handleSaveEdit = () => {
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
  };

  const handleDragEnd = (event: DragEndEvent) => {
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
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            colorClass={columnColorMap[column.id] ?? 'bg-slate-600'}
            isAdding={addingColumnId === column.id}
            addValue={addValue}
            editingCardId={editingCardId}
            editingValue={editingValue}
            onStartAdd={(columnId) => {
              setAddingColumnId(columnId);
              setAddValue('');
            }}
            onAddValueChange={setAddValue}
            onSaveAdd={handleSaveAdd}
            onCancelAdd={() => {
              setAddingColumnId(null);
              setAddValue('');
            }}
            onStartEditCard={(cardId, title) => {
              setEditingCardId(cardId);
              setEditingValue(title);
            }}
            onEditCardValueChange={setEditingValue}
            onSaveEditCard={handleSaveEdit}
            onCancelEditCard={() => {
              setEditingCardId(null);
              setEditingValue('');
            }}
            onDeleteCard={handleDeleteCard}
          />
        ))}
      </div>
    </DndContext>
  );
}

export default KanbanBoard;
