import React from 'react';

interface TabsProps<T extends string> {
  views: T[];
  activeView: T;
  setActiveView: (view: T) => void;
}

const Tabs = <T extends string,>({ views, activeView, setActiveView }: TabsProps<T>): React.ReactElement => {
  return (
    <div className="w-full overflow-x-auto scrollbar-hide">
      <nav className="flex space-x-1 p-1 bg-slate-100 rounded-xl" aria-label="Tabs">
        {views.map((view) => (
          <button
            key={view}
            onClick={() => setActiveView(view)}
            className={`${
              activeView === view
                ? 'bg-white text-sky-600 shadow-sm ring-1 ring-slate-900/5'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            } flex-1 min-w-fit whitespace-nowrap py-2.5 px-4 text-sm font-semibold rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500`}
            aria-current={activeView === view ? 'page' : undefined}
          >
            {view}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Tabs;