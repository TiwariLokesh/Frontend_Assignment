import { useState } from 'react';
import { Link } from 'react-router-dom';
import KanbanBoard from '../components/kanban/KanbanBoard';
import { initialKanbanColumns } from '../utils/mockData';
import type { Column } from '../types/kanban';
import ThemeToggle from '../components/ui/ThemeToggle';
import Button from '../components/ui/Button';

function KanbanPage() {
  const [columns, setColumns] = useState<Column[]>(initialKanbanColumns);

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl animate-fadeIn px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-semibold tracking-wide text-slate-800 dark:text-slate-100">Kanban Board Project</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">Drag cards across columns, edit inline, and manage workflow efficiently.</p>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link to="/">
            <Button variant="secondary">← Back Home</Button>
          </Link>
        </div>
      </div>

      <KanbanBoard columns={columns} onChange={setColumns} />
    </main>
  );
}

export default KanbanPage;
