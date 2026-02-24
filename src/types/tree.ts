export type TreeNode = {
  id: string;
  name: string;
  children?: TreeNode[];
  isLazy?: boolean;
};

export type NodeLocation = {
  node: TreeNode;
  parentId: string | null;
  index: number;
};
