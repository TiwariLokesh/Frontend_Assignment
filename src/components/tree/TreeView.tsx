import { useCallback, useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import TreeNodeItem from './TreeNodeItem';
import type { TreeNode } from '../../types/tree';
import {
  addNode,
  findNode,
  findNodeLocation,
  getChildrenLength,
  isDescendant,
  moveNode,
  removeNode,
  updateNode,
} from '../../utils/treeUtils';
import ConfirmModal from '../ui/ConfirmModal';
import Button from '../ui/Button';
import { cn } from '../../utils/cn';

type TreeViewProps = {
  nodes: TreeNode[];
  onChange: React.Dispatch<React.SetStateAction<TreeNode[]>>;
};

const makeId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const createLazyChildren = (parentName: string): TreeNode[] => [
  { id: makeId('lazy'), name: `${parentName} Child 1` },
  { id: makeId('lazy'), name: `${parentName} Child 2`, isLazy: true },
];

function TreeView({ nodes, onChange }: TreeViewProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(nodes.map((node) => node.id)));
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const [loadedLazyIds, setLoadedLazyIds] = useState<Set<string>>(new Set());

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');

  const [addingFor, setAddingFor] = useState<string | null>(null);
  const [addingValue, setAddingValue] = useState('');

  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [deleteCandidateId, setDeleteCandidateId] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const rootDrop = useDroppable({ id: 'children:root' });

  const expandNode = useCallback((nodeId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.add(nodeId);
      return next;
    });
  }, []);

  const handleToggle = useCallback((nodeId: string) => {
    const node = findNode(nodes, nodeId);
    if (!node) {
      return;
    }

    const isExpanded = expandedIds.has(nodeId);

    if (isExpanded) {
      setExpandedIds((prev) => {
        const next = new Set(prev);
        next.delete(nodeId);
        return next;
      });
      return;
    }

    expandNode(nodeId);

    if (!node.isLazy || loadedLazyIds.has(nodeId)) {
      return;
    }

    setLoadingIds((prev) => {
      const next = new Set(prev);
      next.add(nodeId);
      return next;
    });

    // Simulated first-load API request for lazy nodes.
    window.setTimeout(() => {
      onChange((prevNodes) =>
        updateNode(prevNodes, nodeId, (currentNode) => ({
          ...currentNode,
          children: [...(currentNode.children ?? []), ...createLazyChildren(currentNode.name)],
        }))
      );

      setLoadedLazyIds((prev) => {
        const next = new Set(prev);
        next.add(nodeId);
        return next;
      });

      setLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(nodeId);
        return next;
      });
    }, 1000);
  }, [expandNode, expandedIds, loadedLazyIds, nodes, onChange]);

  const resetInlineStates = useCallback(() => {
    setAddingFor(null);
    setAddingValue('');
    setEditingId(null);
    setEditingValue('');
  }, []);

  const handleSaveAdd = useCallback((parentId: string | null) => {
    const name = addingValue.trim();
    if (!name) {
      setAddingFor(null);
      setAddingValue('');
      return;
    }

    const newNode: TreeNode = {
      id: makeId('node'),
      name,
    };

    onChange((prevNodes) => addNode(prevNodes, parentId, newNode));

    if (parentId) {
      expandNode(parentId);
    }

    setAddingFor(null);
    setAddingValue('');
  }, [addingValue, expandNode, onChange]);

  const handleSaveEdit = useCallback(() => {
    const name = editingValue.trim();
    if (!editingId || !name) {
      resetInlineStates();
      return;
    }

    onChange((prevNodes) =>
      updateNode(prevNodes, editingId, (node) => ({
        ...node,
        name,
      }))
    );

    setEditingId(null);
    setEditingValue('');
  }, [editingId, editingValue, onChange, resetInlineStates]);

  const handleDeleteRequest = useCallback((nodeId: string) => {
    setDeleteCandidateId(nodeId);
  }, []);

  const confirmDelete = useCallback(() => {
    if (!deleteCandidateId) {
      return;
    }

    const deletingId = deleteCandidateId;
    setDeleteCandidateId(null);

    onChange((prevNodes) => removeNode(prevNodes, deletingId));

    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.delete(deletingId);
      return next;
    });
  }, [deleteCandidateId, onChange]);

  const parseId = useCallback((id: string, prefix: string) => (id.startsWith(prefix) ? id.slice(prefix.length) : null), []);

  const handleStartEdit = useCallback((currentNode: TreeNode) => {
    setEditingId(currentNode.id);
    setEditingValue(currentNode.name);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
    setEditingValue('');
  }, []);

  const handleStartAdd = useCallback((parentId: string) => {
    setAddingFor(parentId);
    setAddingValue('');
  }, []);

  const handleCancelAdd = useCallback(() => {
    setAddingFor(null);
    setAddingValue('');
  }, []);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const rawId = event.active.id;
    if (typeof rawId !== 'string') {
      return;
    }

    setActiveDragId(parseId(rawId, 'node:'));
  }, [parseId]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveDragId(null);

    const activeRaw = event.active.id;
    const overRaw = event.over?.id;

    if (typeof activeRaw !== 'string' || typeof overRaw !== 'string') {
      return;
    }

    const activeNodeId = parseId(activeRaw, 'node:');
    if (!activeNodeId) {
      return;
    }

    onChange((prevNodes) => {
      const sourceLocation = findNodeLocation(prevNodes, activeNodeId);
      if (!sourceLocation) {
        return prevNodes;
      }

      let targetParentId: string | null = null;
      let targetIndex = 0;

      const overRowId = parseId(overRaw, 'row:');
      const overContainerId = parseId(overRaw, 'children:');

      if (overRowId) {
        const overLocation = findNodeLocation(prevNodes, overRowId);
        if (!overLocation) {
          return prevNodes;
        }

        targetParentId = overLocation.parentId;
        targetIndex = overLocation.index;
      } else if (overContainerId !== null) {
        targetParentId = overContainerId === 'root' ? null : overContainerId;
        targetIndex = getChildrenLength(prevNodes, targetParentId);
      } else {
        return prevNodes;
      }

      // Critical hierarchy guard: disallow moving a node under its own subtree.
      if (targetParentId && isDescendant(prevNodes, activeNodeId, targetParentId)) {
        return prevNodes;
      }

      if (
        sourceLocation.parentId === targetParentId &&
        sourceLocation.index === targetIndex
      ) {
        return prevNodes;
      }

      if (
        sourceLocation.parentId === targetParentId &&
        sourceLocation.index < targetIndex
      ) {
        targetIndex -= 1;
      }

      return moveNode(prevNodes, activeNodeId, targetParentId, targetIndex);
    });
  }, [onChange, parseId]);

  const activeNode = useMemo(() => (activeDragId ? findNode(nodes, activeDragId) : undefined), [activeDragId, nodes]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-premium transition-colors duration-300 dark:border-slate-700 dark:bg-slate-900/95">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-wide text-slate-800 dark:text-slate-100">Tree View</h2>
        <Button
          variant="primary"
          onClick={() => {
            setAddingFor('root');
            setAddingValue('');
          }}
        >
          + Add Root Node
        </Button>
      </div>

      {addingFor === 'root' && (
        <div className="mb-4">
          <input
            autoFocus
            value={addingValue}
            onChange={(event) => setAddingValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                handleSaveAdd(null);
              }

              if (event.key === 'Escape') {
                setAddingFor(null);
                setAddingValue('');
              }
            }}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-blue-300 transition-all focus:ring dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            placeholder="Root node name"
          />
        </div>
      )}

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div
          ref={rootDrop.setNodeRef}
          className={cn(
            'relative min-h-20 rounded-xl border border-dashed border-slate-300/80 p-3 transition-all duration-200 dark:border-slate-700',
            rootDrop.isOver ? 'border-blue-300 bg-blue-50/70 dark:border-blue-500 dark:bg-blue-900/20' : 'bg-slate-50 dark:bg-slate-950/40'
          )}
        >
          {nodes.map((node, index) => (
            <div key={node.id} className="mb-2 last:mb-0">
              <TreeNodeItem
                node={node}
                level={0}
                isLastSibling={index === nodes.length - 1}
                ancestorHasNext={[]}
                expandedIds={expandedIds}
                loadingIds={loadingIds}
                activeDragId={activeDragId}
                editingId={editingId}
                editingValue={editingValue}
                addingFor={addingFor}
                addingValue={addingValue}
                onToggle={handleToggle}
                onStartEdit={handleStartEdit}
                onEditValueChange={setEditingValue}
                onSaveEdit={handleSaveEdit}
                onCancelEdit={handleCancelEdit}
                onStartAdd={handleStartAdd}
                onAddValueChange={setAddingValue}
                onSaveAdd={handleSaveAdd}
                onCancelAdd={handleCancelAdd}
                onDelete={handleDeleteRequest}
              />
            </div>
          ))}
        </div>

        <DragOverlay>
          {activeNode ? (
            <div className="flex min-h-12 w-[260px] scale-[1.03] items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 opacity-90 shadow-xl dark:border-slate-600 dark:bg-slate-900">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sm font-semibold text-sky-700 dark:bg-sky-900/70 dark:text-sky-200">
                {(activeNode.name.slice(0, 1) || 'N').toUpperCase()}
              </div>
              <span className="truncate text-sm font-semibold text-slate-700 dark:text-slate-100">{activeNode.name}</span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <ConfirmModal
        open={Boolean(deleteCandidateId)}
        title="Delete node"
        description="This will permanently remove the node and its full subtree."
        onCancel={() => setDeleteCandidateId(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

export default TreeView;
