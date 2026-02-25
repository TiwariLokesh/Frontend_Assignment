import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Column } from '../../types/kanban';
import KanbanCard from './KanbanCard';
import Button from '../ui/Button';
import { cn } from '../../utils/cn';

type KanbanColumnProps = {
  column: Column;
  colorClass: string;
  isAdding: boolean;
  addValue: string;
  editingCardId: string | null;
  editingValue: string;
  onStartAdd: (columnId: string) => void;
  onAddValueChange: (value: string) => void;
  onSaveAdd: (columnId: string) => void;
  onCancelAdd: () => void;
  onStartEditCard: (cardId: string, title: string) => void;
  onEditCardValueChange: (value: string) => void;
  onSaveEditCard: () => void;
  onCancelEditCard: () => void;
  onDeleteCard: (columnId: string, cardId: string) => void;
};

function KanbanColumn({
  column,
  colorClass,
  isAdding,
  addValue,
  editingCardId,
  editingValue,
  onStartAdd,
  onAddValueChange,
  onSaveAdd,
  onCancelAdd,
  onStartEditCard,
  onEditCardValueChange,
  onSaveEditCard,
  onCancelEditCard,
  onDeleteCard,
}: KanbanColumnProps) {
  const columnDrop = useDroppable({ id: `column:${column.id}` });

  return (
    <section className="min-w-[280px] rounded-2xl border border-slate-200 bg-slate-100 shadow-md transition-all duration-200 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900/60">
      <header className={`${colorClass} flex items-center justify-between rounded-t-2xl px-4 py-3 text-white`}>
        <h2 className="text-lg font-semibold tracking-wide">{column.title}</h2>
        <span className="rounded-md bg-white/20 px-2 py-0.5 text-xs font-semibold">{column.cards.length}</span>
      </header>

      <div className="p-4">
        <Button variant="secondary" fullWidth className="mb-3 justify-start" onClick={() => onStartAdd(column.id)}>
          + Add Card
        </Button>

        {isAdding && (
          <input
            autoFocus
            value={addValue}
            onChange={(event) => onAddValueChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                onSaveAdd(column.id);
              }

              if (event.key === 'Escape') {
                onCancelAdd();
              }
            }}
            className="mb-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-300 transition-all focus:ring-2 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            placeholder="Card title"
          />
        )}

        <div
          ref={columnDrop.setNodeRef}
          className={cn(
            'min-h-20 space-y-3 rounded-lg p-1 transition-all duration-200',
            columnDrop.isOver && 'bg-blue-100/70 ring-1 ring-blue-300 dark:bg-blue-900/20 dark:ring-blue-500/50'
          )}
        >
          <SortableContext
            items={column.cards.map((card) => `card:${card.id}`)}
            strategy={verticalListSortingStrategy}
          >
            {column.cards.map((card) => (
              <KanbanCard
                key={card.id}
                card={card}
                isEditing={editingCardId === card.id}
                editingValue={editingValue}
                onStartEdit={() => onStartEditCard(card.id, card.title)}
                onEditValueChange={onEditCardValueChange}
                onSaveEdit={onSaveEditCard}
                onCancelEdit={onCancelEditCard}
                onDelete={(cardId) => onDeleteCard(column.id, cardId)}
              />
            ))}
          </SortableContext>
        </div>
      </div>
    </section>
  );
}

export default KanbanColumn;
