import type { Column } from '../types/kanban';
import type { TreeNode } from '../types/tree';

export const initialTreeData: TreeNode[] = [
  {
    id: 'a',
    name: 'Level A',
    children: [
      {
        id: 'b-1',
        name: 'Level A',
        children: [
          {
            id: 'c-1',
            name: 'Level A',
            children: [
              {
                id: 'd-1',
                name: 'Level A',
                isLazy: true,
              },
            ],
          },
          {
            id: 'c-2',
            name: 'Level A',
          },
          {
            id: 'c-3',
            name: 'Level A',
          },
        ],
      },
      {
        id: 'b-2',
        name: 'Level A',
        isLazy: true,
      },
    ],
  },
];

export const initialKanbanColumns: Column[] = [
  {
    id: 'todo',
    title: 'Todo',
    cards: [
      { id: 'todo-1', title: 'Create initial project plan' },
      { id: 'todo-2', title: 'Design landing page' },
      { id: 'todo-3', title: 'Review codebase structure' },
    ],
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    cards: [
      { id: 'prog-1', title: 'Implement authentication' },
      { id: 'prog-2', title: 'Set up database schema' },
      { id: 'prog-3', title: 'Fix navbar bugs' },
    ],
  },
  {
    id: 'done',
    title: 'Done',
    cards: [
      { id: 'done-1', title: 'Organize project repository' },
      { id: 'done-2', title: 'Write API documentation' },
    ],
  },
];
