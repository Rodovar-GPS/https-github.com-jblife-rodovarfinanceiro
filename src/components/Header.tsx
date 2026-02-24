import React, { useState } from 'react';
import { Bell, Search, User, X, Check } from 'lucide-react';
import { useData } from '../contexts/DataContext';

export function Header({ title }: { title: string }) {
  const { notifications, markAllNotificationsAsRead, searchTerm, setSearchTerm } = useData();
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="bg-white border-b border-zinc-200 h-16 flex items-center justify-between px-8 sticky top-0 z-10">
      <h2 className="text-xl font-semibold text-zinc-800">{title}</h2>
      
      <div className="flex items-center gap-6">
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input 
            type="text" 
            placeholder="Buscar..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/50 w-64 transition-all"
          />
        </div>

        <div className="flex items-center gap-4 border-l border-zinc-200 pl-6 relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 rounded-full transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
            )}
          </button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)}></div>
              <div className="absolute top-12 right-0 w-80 bg-white border border-zinc-200 rounded-xl shadow-xl z-20 overflow-hidden">
                <div className="p-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50">
                  <h3 className="font-semibold text-zinc-900">Notificações</h3>
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllNotificationsAsRead}
                      className="text-xs text-yellow-600 hover:text-yellow-700 font-medium flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" /> Marcar lidas
                    </button>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-zinc-500 text-sm">
                      Nenhuma notificação.
                    </div>
                  ) : (
                    notifications.map(notification => (
                      <div key={notification.id} className={`p-4 border-b border-zinc-50 hover:bg-zinc-50 transition-colors ${notification.read ? 'opacity-60' : 'bg-yellow-50/30'}`}>
                        <div className="flex justify-between items-start mb-1">
                          <h4 className={`text-sm font-medium ${notification.read ? 'text-zinc-700' : 'text-zinc-900'}`}>{notification.title}</h4>
                          <span className="text-[10px] text-zinc-400">{notification.time}</span>
                        </div>
                        <p className="text-xs text-zinc-500">{notification.message}</p>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-2 border-t border-zinc-100 text-center">
                  <button className="text-xs text-zinc-500 hover:text-zinc-900 font-medium py-1">
                    Ver todas
                  </button>
                </div>
              </div>
            </>
          )}
          
          <div className="flex items-center gap-3 cursor-pointer hover:bg-zinc-50 p-1.5 rounded-full pr-3 transition-colors">
            <div className="w-8 h-8 bg-zinc-900 rounded-full flex items-center justify-center text-white text-sm font-medium">
              AD
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-zinc-900">Admin</p>
              <p className="text-xs text-zinc-500">Financeiro</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
