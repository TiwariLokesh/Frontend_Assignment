import { Link } from 'react-router-dom';

const cards = [
  {
    title: 'Tree View Project',
    subtitle: 'Reusable hierarchy editor with lazy loading and drag-and-drop',
    to: '/tree',
    gradient: 'from-indigo-500 via-blue-500 to-cyan-400',
  },
  {
    title: 'Kanban Board Project',
    subtitle: 'Modern workflow board with inline editing and card movement',
    to: '/kanban',
    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
  },
];

function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-5xl">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-800">Frontend Assignment Showcase</h1>
          <p className="mt-3 text-base text-slate-500">Choose a project to open its fully interactive implementation.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {cards.map((card) => (
            <Link
              key={card.to}
              to={card.to}
              className="group relative overflow-hidden rounded-xl shadow-lg transition duration-300 hover:scale-[1.02] hover:shadow-premium"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-95`} />
              <div className="relative rounded-xl border border-white/30 bg-white/10 p-8 backdrop-blur-sm">
                <h2 className="text-3xl font-bold text-white">{card.title}</h2>
                <p className="mt-3 text-sm text-white/90">{card.subtitle}</p>
                <div className="mt-8 inline-flex items-center rounded-md bg-white/20 px-3 py-2 text-sm font-semibold text-white transition group-hover:bg-white/30">
                  Open Project →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

export default HomePage;
