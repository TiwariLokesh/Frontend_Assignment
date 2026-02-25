import { memo } from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { TreeNode } from '../../types/tree';
import { cn } from '../../utils/cn';

const INDENT = 28;

const avatarPalette = [
  'bg-sky-100 text-sky-700 dark:bg-sky-900/70 dark:text-sky-200',
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/70 dark:text-emerald-200',
  'bg-violet-100 text-violet-700 dark:bg-violet-900/70 dark:text-violet-200',
  'bg-amber-100 text-amber-700 dark:bg-amber-900/70 dark:text-amber-200',
  'bg-rose-100 text-rose-700 dark:bg-rose-900/70 dark:text-rose-200',
  'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/70 dark:text-cyan-200',
];

type TreeNodeItemProps = {
  node: TreeNode;
  level: number;
  isLastSibling: boolean;
  ancestorHasNext: boolean[];
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

const TreeNodeItem = memo(function TreeNodeItem({
  node,
  level,
  isLastSibling,
  ancestorHasNext,
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
  const canToggle = Boolean(node.children?.length || node.isLazy);

  const draggable = useDraggable({ id: `node:${node.id}` });
  const rowDroppable = useDroppable({ id: `row:${node.id}` });
  const childrenDroppable = useDroppable({ id: `children:${node.id}` });

  const nodeMarginLeft = level * INDENT;
  const rowCenterY = 24;
  const isDragActive = activeDragId === node.id;
  const iconColor = avatarPalette[level % avatarPalette.length];

  const style = draggable.transform
    ? {
        transform: CSS.Translate.toString(draggable.transform),
      }
    : undefined;

  const setRowRef = (element: HTMLDivElement | null) => {
    draggable.setNodeRef(element);
    rowDroppable.setNodeRef(element);
  };

  return (
    <div className="relative animate-fadeIn pb-2">
      {ancestorHasNext.map(
        (hasNext, depth) =>
          hasNext && (
            <span
              key={`${node.id}-ancestor-${depth}`}
              className="pointer-events-none absolute bottom-0 top-0 border-l border-dashed border-slate-300/80 dark:border-slate-600/80"
              style={{ left: depth * INDENT + 13 }}
            />
          )
      )}

      {level > 0 && (
        <>
          <span
            className="pointer-events-none absolute border-l border-dashed border-slate-300/80 dark:border-slate-600/80"
            style={{
              left: nodeMarginLeft - 15,
              top: 0,
              height: isLastSibling ? rowCenterY : '100%',
            }}
          />
          <span
            className="pointer-events-none absolute border-t border-dashed border-slate-300/80 dark:border-slate-600/80"
            style={{
              left: nodeMarginLeft - 15,
              top: rowCenterY,
              width: 15,
            }}
          />
        </>
      )}

      <div
        ref={setRowRef}
        style={{ ...style, marginLeft: nodeMarginLeft }}
        {...draggable.attributes}
        {...draggable.listeners}
        className={cn(
          'group flex min-h-12 items-center gap-2 rounded-xl border border-slate-200/90 bg-white/90 px-3 py-2',
          'cursor-pointer transition-all duration-200 hover:border-slate-300 hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-900/90 dark:hover:bg-slate-800/90',
          rowDroppable.isOver && 'ring-2 ring-blue-300 dark:ring-blue-500/60',
          isDragActive && 'opacity-60',
          draggable.isDragging && 'scale-[1.03] shadow-xl opacity-90'
        )}
      >
        <button
          type="button"
          onClick={() => onToggle(node.id)}
          disabled={!canToggle}
          className="flex h-6 w-6 items-center justify-center rounded-md text-slate-500 transition-all duration-300 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          <span
            className={cn(
              'text-sm transition-transform duration-300 ease-in-out',
              canToggle ? 'opacity-100' : 'opacity-30',
              isExpanded && 'rotate-90'
            )}
          >
            ▶
          </span>
        </button>

        <div className={cn('flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold', iconColor)}>
          {(node.name.slice(0, 1) || 'N').toUpperCase()}
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
              className="w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-sm font-medium outline-none ring-blue-300 transition-all focus:ring dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            />
          ) : (
            <p onDoubleClick={() => onStartEdit(node)} className="truncate text-sm font-semibold text-slate-700 dark:text-slate-100">
              {node.name}
            </p>
          )}
        </div>

        <button
          type="button"
          title="Add child"
          onClick={() => onStartAdd(node.id)}
          className="h-7 w-7 rounded-md border border-slate-300 bg-white text-base leading-none text-slate-600 transition-all duration-200 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          +
        </button>

        <button
          type="button"
          title="Delete"
          onClick={() => onDelete(node.id)}
          className="h-7 w-7 rounded-md border border-red-200 bg-red-50 text-sm text-red-600 opacity-0 transition-all duration-200 hover:bg-red-100 group-hover:opacity-100 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300"
        >
          🗑
        </button>
      </div>

      {isAdding && (
        <div className="mt-2" style={{ marginLeft: nodeMarginLeft + 40 }}>
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
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-blue-300 transition-all focus:ring dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            placeholder="Child node name"
          />
        </div>
      )}

      <div
        ref={childrenDroppable.setNodeRef}
        className={cn(
          'overflow-hidden pl-0 transition-all duration-300 ease-in-out',
          isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0',
          childrenDroppable.isOver && 'rounded-lg bg-blue-100/60 dark:bg-blue-900/30'
        )}
      >
        <div className="mt-2 space-y-1">
          {isExpanded && isLoading && (
            <div className="ml-10 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
              <div className="mb-2 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-300">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700 dark:border-slate-600 dark:border-t-slate-200" />
                Loading children...
              </div>
              <div className="space-y-2">
                <div className="h-3 rounded bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 bg-[length:200%_100%] animate-shimmer dark:from-slate-800 dark:via-slate-700 dark:to-slate-800" />
                <div className="h-3 w-3/4 rounded bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 bg-[length:200%_100%] animate-shimmer dark:from-slate-800 dark:via-slate-700 dark:to-slate-800" />
              </div>
            </div>
          )}

          {isExpanded &&
            node.children?.map((child, index) => (
              <TreeNodeItem
                key={child.id}
                node={child}
                level={level + 1}
                isLastSibling={index === node.children!.length - 1}
                ancestorHasNext={[...ancestorHasNext, !isLastSibling]}
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
            ))}
        </div>
      </div>
    </div>
  );
});

export default TreeNodeItem;
