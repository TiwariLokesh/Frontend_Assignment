import { useMemo, useState } from 'react';
import { DndContext, DragEndEvent, DragStartEvent, PointerSensor, useDroppable, useSensor, useSensors } from '@dnd-kit/core';
import TreeNodeItem from './TreeNodeItem';
import { TreeNode } from '../../types/tree';
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

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const rootDrop = useDroppable({ id: 'children:root' });

  const expandNode = (nodeId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.add(nodeId);
      return next;
    });
  };

  const handleToggle = (nodeId: string) => {
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
  };

  const resetInlineStates = () => {
    setAddingFor(null);
    setAddingValue('');
    setEditingId(null);
    setEditingValue('');
  };

  const handleSaveAdd = (parentId: string | null) => {
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
  };

  const handleSaveEdit = () => {
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
  };

  const handleDelete = (nodeId: string) => {
    if (!window.confirm('Delete this node and all of its children?')) {
      return;
    }

    onChange((prevNodes) => removeNode(prevNodes, nodeId));

    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.delete(nodeId);
      return next;
    });
  };

  const parseId = (id: string, prefix: string) => (id.startsWith(prefix) ? id.slice(prefix.length) : null);

  const handleDragStart = (event: DragStartEvent) => {
    const rawId = event.active.id;
    if (typeof rawId !== 'string') {
      return;
    }

    setActiveDragId(parseId(rawId, 'node:'));
  };

  const handleDragEnd = (event: DragEndEvent) => {
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
  };

  const sortedNodes = useMemo(() => nodes, [nodes]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-premium">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">Tree View</h2>
        <button
          type="button"
          onClick={() => {
            setAddingFor('root');
            setAddingValue('');
          }}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          + Add Root Node
        </button>
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
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-blue-300 focus:ring"
            placeholder="Root node name"
          />
        </div>
      )}

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div
          ref={rootDrop.setNodeRef}
          className={[
            'relative min-h-20 rounded-xl border border-dashed border-slate-200 p-3 transition',
            rootDrop.isOver ? 'border-blue-300 bg-blue-50/70' : 'bg-slate-50',
          ].join(' ')}
        >
          {sortedNodes.map((node) => (
            <div key={node.id} className="mb-2 last:mb-0">
              <TreeNodeItem
                node={node}
                level={0}
                expandedIds={expandedIds}
                loadingIds={loadingIds}
                activeDragId={activeDragId}
                editingId={editingId}
                editingValue={editingValue}
                addingFor={addingFor}
                addingValue={addingValue}
                onToggle={handleToggle}
                onStartEdit={(currentNode) => {
                  setEditingId(currentNode.id);
                  setEditingValue(currentNode.name);
                }}
                onEditValueChange={setEditingValue}
                onSaveEdit={handleSaveEdit}
                onCancelEdit={() => {
                  setEditingId(null);
                  setEditingValue('');
                }}
                onStartAdd={(parentId) => {
                  setAddingFor(parentId);
                  setAddingValue('');
                }}
                onAddValueChange={setAddingValue}
                onSaveAdd={handleSaveAdd}
                onCancelAdd={() => {
                  setAddingFor(null);
                  setAddingValue('');
                }}
                onDelete={handleDelete}
              />
            </div>
          ))}
        </div>
      </DndContext>
    </div>
  );
}

export default TreeView;
