import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Column } from '../../types/kanban';
import KanbanCard from './KanbanCard';

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
    <section className="rounded-2xl border border-slate-200 bg-slate-100 shadow-premium">
      <header className={`${colorClass} flex items-center justify-between rounded-t-2xl px-4 py-3 text-white`}>
        <h2 className="text-lg font-bold">{column.title}</h2>
        <span className="rounded-md bg-white/20 px-2 py-0.5 text-xs font-semibold">{column.cards.length}</span>
      </header>

      <div className="p-4">
        <button
          type="button"
          onClick={() => onStartAdd(column.id)}
          className="mb-3 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-left text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          + Add Card
        </button>

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
            className="mb-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-300 focus:ring"
            placeholder="Card title"
          />
        )}

        <div
          ref={columnDrop.setNodeRef}
          className={[
            'min-h-20 space-y-3 rounded-lg p-1 transition',
            columnDrop.isOver ? 'bg-blue-100/70' : '',
          ].join(' ')}
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
