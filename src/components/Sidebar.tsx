import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Receipt, Truck, FileText, Settings, LogOut, MessageSquare, FileInput } from 'lucide-react';
import { cn } from '../lib/utils';

export function Sidebar() {
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Receipt, label: 'Financeiro', path: '/financeiro' },
    { icon: FileInput, label: 'Emissão CTE', path: '/cte' },
    { icon: Truck, label: 'Frota', path: '/frota' },
    { icon: MessageSquare, label: 'Chat / Reunião', path: '/chat' },
    { icon: FileText, label: 'Relatórios', path: '/relatorios' },
    { icon: Settings, label: 'Configurações', path: '/configuracoes' },
  ];

  return (
    <aside className="w-64 bg-zinc-900 text-white flex flex-col h-screen fixed left-0 top-0 border-r border-zinc-800">
      <div className="p-6 border-b border-zinc-800 flex items-center gap-3">
        <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center text-zinc-900 font-bold text-xl">
          R
        </div>
        <div>
          <h1 className="font-bold text-lg tracking-tight">RODOVAR</h1>
          <p className="text-xs text-zinc-400 uppercase tracking-wider">Logística</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
                isActive
                  ? "bg-yellow-500 text-zinc-900 font-medium shadow-lg shadow-yellow-500/20"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
              )
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-zinc-800">
        <button className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors">
          <LogOut className="w-5 h-5" />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}
