import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  GitCompareArrows,
  Map,
  Smartphone,
  SlidersHorizontal,
} from 'lucide-react';

const navItems = [
  { to: '/', label: 'Executive Overview', icon: LayoutDashboard },
  { to: '/comparison', label: 'Branch Comparison', icon: GitCompareArrows },
  { to: '/map', label: 'Geographic Map', icon: Map },
  { to: '/digital', label: 'Digital Transformation', icon: Smartphone },
  { to: '/what-if', label: 'What-If Analysis', icon: SlidersHorizontal },
];

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-800 bg-slate-950 flex flex-col">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-lg font-bold text-slate-100">FI Branch</h1>
        <p className="text-xs text-slate-400 mt-1">Performance Dashboard</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-500/10 text-blue-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`
            }
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
