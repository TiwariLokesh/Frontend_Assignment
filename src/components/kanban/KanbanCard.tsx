import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Card } from '../../types/kanban';
import { cn } from '../../utils/cn';

type KanbanCardProps = {
  card: Card;
  isEditing: boolean;
  editingValue: string;
  onStartEdit: (card: Card) => void;
  onEditValueChange: (value: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDelete: (cardId: string) => void;
};

function KanbanCard({
  card,
  isEditing,
  editingValue,
  onStartEdit,
  onEditValueChange,
  onSaveEdit,
  onCancelEdit,
  onDelete,
}: KanbanCardProps) {
  const sortable = useSortable({ id: `card:${card.id}` });

  const style = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition,
  };

  return (
    <article
      ref={sortable.setNodeRef}
      style={style}
      {...sortable.attributes}
      {...sortable.listeners}
      className={cn(
        'group animate-fadeIn cursor-grab rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-all duration-200 active:cursor-grabbing',
        'hover:shadow-md dark:border-slate-700 dark:bg-slate-900',
        sortable.isDragging && 'scale-[1.03] opacity-30 shadow-xl ring-2 ring-blue-300 dark:ring-blue-500/50'
      )}
    >
      <div className="flex items-start gap-2">
        <span className="mt-1 h-3 w-1 rounded-full bg-slate-300 dark:bg-slate-600" />

        <div className="flex-1">
          {isEditing ? (
            <input
              autoFocus
              value={editingValue}
              onChange={(event) => onEditValueChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  onSaveEdit();
                }

                if (event.key === 'Escape') {
                  onCancelEdit();
                }
              }}
              onBlur={onSaveEdit}
              className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm outline-none ring-blue-300 transition-all focus:ring-2 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            />
          ) : (
            <p
              onDoubleClick={() => onStartEdit(card)}
              className="cursor-text text-sm font-medium text-slate-700 dark:text-slate-100"
            >
              {card.title}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => onDelete(card.id)}
          className="rounded-md p-1 text-red-500 opacity-0 transition-opacity duration-200 hover:bg-red-50 group-hover:opacity-100 dark:hover:bg-red-900/40"
          title="Delete card"
        >
          🗑
        </button>
      </div>
    </article>
  );
}

export default KanbanCard;
