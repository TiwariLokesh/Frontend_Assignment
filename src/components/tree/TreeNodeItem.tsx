import { CSS } from '@dnd-kit/utilities';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { TreeNode } from '../../types/tree';

const levelColors = [
  'bg-sky-500',
  'bg-lime-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-violet-500',
  'bg-pink-500',
];

type TreeNodeItemProps = {
  node: TreeNode;
  level: number;
  expandedIds: Set<string>;
  loadingIds: Set<string>;
  activeDragId: string | null;
  editingId: string | null;
  editingValue: string;
  addingFor: string | null;
  addingValue: string;
  onToggle: (nodeId: string) => void;
  onStartEdit: (node: TreeNode) => void;
  onEditValueChange: (value: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onStartAdd: (nodeId: string) => void;
  onAddValueChange: (value: string) => void;
  onSaveAdd: (parentId: string) => void;
  onCancelAdd: () => void;
  onDelete: (nodeId: string) => void;
};

function TreeNodeItem({
  node,
  level,
  expandedIds,
  loadingIds,
  activeDragId,
  editingId,
  editingValue,
  addingFor,
  addingValue,
  onToggle,
  onStartEdit,
  onEditValueChange,
  onSaveEdit,
  onCancelEdit,
  onStartAdd,
  onAddValueChange,
  onSaveAdd,
  onCancelAdd,
  onDelete,
}: TreeNodeItemProps) {
  const isExpanded = expandedIds.has(node.id);
  const isLoading = loadingIds.has(node.id);
  const isEditing = editingId === node.id;
  const isAdding = addingFor === node.id;

  const draggable = useDraggable({ id: `node:${node.id}` });
  const rowDroppable = useDroppable({ id: `row:${node.id}` });
  const childrenDroppable = useDroppable({ id: `children:${node.id}` });

  const canToggle = Boolean(node.children?.length || node.isLazy);
  const transform = draggable.transform;

  const rowStyle = transform
    ? {
        transform: CSS.Translate.toString(transform),
      }
    : undefined;

  const isDragActive = activeDragId === node.id;
  const iconColor = levelColors[level % levelColors.length];

  const setRowRef = (element: HTMLDivElement | null) => {
    draggable.setNodeRef(element);
    rowDroppable.setNodeRef(element);
  };

  return (
    <div className="relative animate-fadeIn pl-7">
      {level > 0 && (
        <div className="pointer-events-none absolute left-0 top-5 h-px w-6 border-t border-dashed border-slate-300" />
      )}

      <div
        ref={setRowRef}
        style={rowStyle}
        {...draggable.attributes}
        {...draggable.listeners}
        className={[
          'group flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 shadow-sm transition',
          'hover:border-slate-300 hover:bg-white',
          rowDroppable.isOver ? 'ring-2 ring-blue-300' : '',
          isDragActive ? 'opacity-60' : '',
        ].join(' ')}
      >
        <button
          type="button"
          onClick={() => onToggle(node.id)}
          className="flex h-6 w-6 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-200"
          disabled={!canToggle}
        >
          {canToggle ? (isExpanded ? '⌄' : '›') : '·'}
        </button>

        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white ${iconColor}`}
        >
          {node.name.slice(0, 1).toUpperCase() || 'N'}
        </div>

        <div className="min-w-0 flex-1">
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
              className="w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-sm font-medium outline-none ring-blue-300 focus:ring"
            />
          ) : (
            <p
              onDoubleClick={() => onStartEdit(node)}
              className="truncate text-sm font-semibold text-slate-700"
            >
              {node.name}
            </p>
          )}
        </div>

        <button
          type="button"
          title="Add child"
          onClick={() => onStartAdd(node.id)}
          className="h-7 w-7 rounded-md border border-slate-300 bg-white text-base leading-none text-slate-600 transition hover:bg-slate-100"
        >
          +
        </button>

        <button
          type="button"
          title="Delete"
          onClick={() => onDelete(node.id)}
          className="h-7 w-7 rounded-md border border-red-200 bg-red-50 text-sm text-red-600 opacity-0 transition hover:bg-red-100 group-hover:opacity-100"
        >
          🗑
        </button>
      </div>

      {isAdding && (
        <div className="mt-2 pl-8">
          <input
            autoFocus
            value={addingValue}
            onChange={(event) => onAddValueChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                onSaveAdd(node.id);
              }

              if (event.key === 'Escape') {
                onCancelAdd();
              }
            }}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-blue-300 focus:ring"
            placeholder="Child node name"
          />
        </div>
      )}

      <div className="relative mt-2 pl-8">
        {isExpanded && (
          <div className="pointer-events-none absolute left-3 top-0 h-full border-l border-dashed border-slate-300" />
        )}

        <div
          ref={childrenDroppable.setNodeRef}
          className={[
            'min-h-3 rounded-lg transition',
            childrenDroppable.isOver ? 'bg-blue-100/60' : '',
          ].join(' ')}
        >
          {isExpanded && isLoading && (
            <div className="my-2 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
              Loading children...
            </div>
          )}

          {isExpanded &&
            node.children?.map((child) => (
              <div key={child.id} className="mb-2 last:mb-0">
                <TreeNodeItem
                  node={child}
                  level={level + 1}
                  expandedIds={expandedIds}
                  loadingIds={loadingIds}
                  activeDragId={activeDragId}
                  editingId={editingId}
                  editingValue={editingValue}
                  addingFor={addingFor}
                  addingValue={addingValue}
                  onToggle={onToggle}
                  onStartEdit={onStartEdit}
                  onEditValueChange={onEditValueChange}
                  onSaveEdit={onSaveEdit}
                  onCancelEdit={onCancelEdit}
                  onStartAdd={onStartAdd}
                  onAddValueChange={onAddValueChange}
                  onSaveAdd={onSaveAdd}
                  onCancelAdd={onCancelAdd}
                  onDelete={onDelete}
                />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default TreeNodeItem;
