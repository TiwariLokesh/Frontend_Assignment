import { useState } from 'react';
import { Link } from 'react-router-dom';
import TreeView from '../components/tree/TreeView';
import { initialTreeData } from '../utils/mockData';
import type { TreeNode } from '../types/tree';
import ThemeToggle from '../components/ui/ThemeToggle';
import Button from '../components/ui/Button';

function TreePage() {
  const [nodes, setNodes] = useState<TreeNode[]>(initialTreeData);

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl animate-fadeIn px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-semibold tracking-wide text-slate-800 dark:text-slate-100">Tree View Project</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">Reusable tree component with lazy loading and hierarchy drag-and-drop.</p>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link to="/">
            <Button variant="secondary">← Back Home</Button>
          </Link>
        </div>
      </div>

      <TreeView nodes={nodes} onChange={setNodes} />
    </main>
  );
}

export default TreePage;
