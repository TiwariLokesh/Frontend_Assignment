import { useState } from 'react';
import { Link } from 'react-router-dom';
import KanbanBoard from '../components/kanban/KanbanBoard';
import { initialKanbanColumns } from '../utils/mockData';
import { Column } from '../types/kanban';

function KanbanPage() {
  const [columns, setColumns] = useState<Column[]>(initialKanbanColumns);

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Kanban Board Project</h1>
          <p className="mt-1 text-sm text-slate-500">Drag cards across columns, edit inline, and manage workflow efficiently.</p>
        </div>

        <Link
          to="/"
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          ← Back Home
        </Link>
      </div>

      <KanbanBoard columns={columns} onChange={setColumns} />
    </main>
  );
}

export default KanbanPage;
