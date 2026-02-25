import type { NodeLocation, TreeNode } from '../types/tree';

export function findNode(nodes: TreeNode[], id: string): TreeNode | undefined {
  for (const node of nodes) {
    if (node.id === id) {
      return node;
    }

    if (node.children?.length) {
      const childMatch = findNode(node.children, id);
      if (childMatch) {
        return childMatch;
      }
    }
  }

  return undefined;
}

export function findNodeLocation(
  nodes: TreeNode[],
  id: string,
  parentId: string | null = null
): NodeLocation | undefined {
  for (let index = 0; index < nodes.length; index += 1) {
    const node = nodes[index];

    if (node.id === id) {
      return { node, parentId, index };
    }

    if (node.children?.length) {
      const childMatch = findNodeLocation(node.children, id, node.id);
      if (childMatch) {
        return childMatch;
      }
    }
  }

  return undefined;
}

export function updateNode(
  nodes: TreeNode[],
  id: string,
  updater: (node: TreeNode) => TreeNode
): TreeNode[] {
  return nodes.map((node) => {
    if (node.id === id) {
      return updater(node);
    }

    if (!node.children?.length) {
      return node;
    }

    return {
      ...node,
      children: updateNode(node.children, id, updater),
    };
  });
}

export function addNode(nodes: TreeNode[], parentId: string | null, nodeToAdd: TreeNode): TreeNode[] {
  if (!parentId) {
    return [...nodes, nodeToAdd];
  }

  return updateNode(nodes, parentId, (node) => ({
    ...node,
    children: [...(node.children ?? []), nodeToAdd],
  }));
}

export function removeNode(nodes: TreeNode[], id: string): TreeNode[] {
  return nodes
    .filter((node) => node.id !== id)
    .map((node) => {
      if (!node.children?.length) {
        return node;
      }

      return {
        ...node,
        children: removeNode(node.children, id),
      };
    });
}

function insertNodeAt(
  nodes: TreeNode[],
  parentId: string | null,
  index: number,
  nodeToInsert: TreeNode
): TreeNode[] {
  if (parentId === null) {
    const next = [...nodes];
    next.splice(index, 0, nodeToInsert);
    return next;
  }

  return updateNode(nodes, parentId, (node) => {
    const children = [...(node.children ?? [])];
    children.splice(index, 0, nodeToInsert);

    return {
      ...node,
      children,
    };
  });
}

export function moveNode(
  nodes: TreeNode[],
  nodeId: string,
  targetParentId: string | null,
  targetIndex: number
): TreeNode[] {
  const location = findNodeLocation(nodes, nodeId);
  if (!location) {
    return nodes;
  }

  const withoutNode = removeNode(nodes, nodeId);
  return insertNodeAt(withoutNode, targetParentId, targetIndex, location.node);
}

export function isDescendant(nodes: TreeNode[], ancestorId: string, targetId: string): boolean {
  const ancestor = findNode(nodes, ancestorId);
  if (!ancestor?.children?.length) {
    return false;
  }

  return Boolean(findNode(ancestor.children, targetId));
}

export function getChildrenLength(nodes: TreeNode[], parentId: string | null): number {
  if (parentId === null) {
    return nodes.length;
  }

  return findNode(nodes, parentId)?.children?.length ?? 0;
}
