
import React from 'react';

interface TabsProps<T extends string> {
  views: T[];
  activeView: T;
  setActiveView: (view: T) => void;
}

const Tabs = <T extends string,>({ views, activeView, setActiveView }: TabsProps<T>): React.ReactElement => {
  return (
    <div className="border-b border-slate-200">
      <nav className="-mb-px flex space-x-6" aria-label="Tabs">
        {views.map((view) => (
          <button
            key={view}
            onClick={() => setActiveView(view)}
            className={`${
              activeView === view
                ? 'border-sky-500 text-sky-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500 rounded-t-sm`}
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
