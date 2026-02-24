import { useState } from 'react';
import { Link } from 'react-router-dom';
import TreeView from '../components/tree/TreeView';
import { initialTreeData } from '../utils/mockData';
import { TreeNode } from '../types/tree';

function TreePage() {
  const [nodes, setNodes] = useState<TreeNode[]>(initialTreeData);

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Tree View Project</h1>
          <p className="mt-1 text-sm text-slate-500">Reusable tree component with lazy loading and hierarchy drag-and-drop.</p>
        </div>
        <Link
          to="/"
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          ← Back Home
        </Link>
      </div>

      <TreeView nodes={nodes} onChange={setNodes} />
    </main>
  );
}

export default TreePage;
