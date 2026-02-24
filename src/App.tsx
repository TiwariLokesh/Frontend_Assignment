import { Navigate, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import TreePage from './pages/TreePage';
import KanbanPage from './pages/KanbanPage';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/tree" element={<TreePage />} />
        <Route path="/kanban" element={<KanbanPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
