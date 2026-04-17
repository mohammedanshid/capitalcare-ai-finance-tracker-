import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { House, Rows, Target, ArrowsClockwise, DownloadSimple } from '@phosphor-icons/react';

export const BottomNav = ({ onExport }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const current = location.pathname;

  const items = [
    { icon: House, label: 'Home', path: '/dashboard' },
    { icon: Rows, label: 'Categories', path: '/categories' },
    { icon: Target, label: 'Budgets', path: '/budgets' },
    { icon: ArrowsClockwise, label: 'Recurring', path: '/recurring' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--nav-bg)] backdrop-blur-xl border-t border-[var(--border-default)] pb-safe" data-testid="bottom-nav">
      <div className="flex items-center justify-around h-16 px-2">
        {items.map(item => {
          const active = current === item.path;
          return (
            <button key={item.path} onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center gap-0.5 w-16 py-1 rounded-lg transition-all ${active ? 'text-[var(--accent-blue)]' : 'text-[var(--text-tertiary)] active:text-[var(--text-primary)]'}`}
              data-testid={`bottomnav-${item.label.toLowerCase()}`}>
              <item.icon size={22} weight={active ? 'fill' : 'regular'} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
        <button onClick={() => onExport && onExport('csv')}
          className="flex flex-col items-center justify-center gap-0.5 w-16 py-1 rounded-lg text-[var(--text-tertiary)] active:text-[var(--text-primary)] transition-all"
          data-testid="bottomnav-export">
          <DownloadSimple size={22} />
          <span className="text-[10px] font-medium">Export</span>
        </button>
      </div>
    </nav>
  );
};
