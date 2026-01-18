import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Calendar, ListTodo, History, NotebookPen, FileBarChart, Menu, X, Users, Bell, ChevronLeft, ChevronRight, PieChart, Gamepad2, LogOut, Sun, Moon, Laptop, Palette, Search, Command } from 'lucide-react';
import { DashboardView, AppNotification, User, Theme } from '../types';
import { ProfileModal } from './ProfileModal';

interface LayoutProps {
  currentView: DashboardView;
  setCurrentView: (view: DashboardView) => void;
  children: React.ReactNode;
  notifications: AppNotification[];
  markNotificationsRead: () => void;
  user: User;
  onLogout: () => void;
  onUpdateUser: (user: User) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const Layout: React.FC<LayoutProps> = ({ currentView, setCurrentView, children, notifications, markNotificationsRead, user, onLogout, onUpdateUser, theme, setTheme }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [animatingView, setAnimatingView] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const navItems = [
    { view: DashboardView.ANALYTICS, label: 'Analytics', icon: PieChart },
    { view: DashboardView.CALENDAR, label: 'Calendar', icon: Calendar },
    { view: DashboardView.TASKS, label: 'Task List', icon: ListTodo },
    { view: DashboardView.MEETINGS, label: 'Meetings', icon: Users },
    { view: DashboardView.GAMES, label: 'Brain Break', icon: Gamepad2 },
    { view: DashboardView.HISTORY, label: 'History', icon: History },
    { view: DashboardView.NOTES, label: 'Notes', icon: NotebookPen },
    { view: DashboardView.REPORTS, label: 'Reports', icon: FileBarChart },
  ];

  // Trigger view animation
  useEffect(() => {
    setAnimatingView(true);
    const timeout = setTimeout(() => setAnimatingView(false), 400);
    return () => clearTimeout(timeout);
  }, [currentView]);

  const ThemeIcon = () => {
    if (theme === 'light') return <Sun size={20} />;
    if (theme === 'dark') return <Moon size={20} />;
    return <Laptop size={20} />;
  };

  return (
    <div className="flex h-screen h-[100dvh] w-full bg-[#f8fafc] dark:bg-[#020617] transition-colors duration-500 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden animate-in fade-in"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800
        text-slate-600 dark:text-slate-300
        transform transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)
        flex flex-col shadow-2xl md:shadow-none
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
        ${isSidebarCollapsed ? 'w-20' : 'w-64'}
      `}>
        <div className="h-16 flex items-center justify-center relative border-b border-slate-100 dark:border-slate-800/50">
          {!isSidebarCollapsed ? (
            <div className="flex items-center gap-2.5 font-extrabold text-xl tracking-tight animate-in fade-in duration-300">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30 text-white">
                <LayoutDashboard size={18} />
              </div>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-400">OmniTask</span>
            </div>
          ) : (
             <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 text-white animate-scale-in">
               <LayoutDashboard size={20} />
             </div>
          )}
          
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden absolute right-4 text-slate-400 hover:text-slate-900 dark:hover:text-white p-2">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 space-y-1 px-3 scrollbar-hide">
          {navItems.map((item) => {
            const isActive = currentView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => {
                  setCurrentView(item.view);
                  setIsSidebarOpen(false);
                }}
                title={isSidebarCollapsed ? item.label : undefined}
                className={`
                  w-full flex items-center gap-3 py-3 rounded-xl text-left transition-all duration-300 group relative overflow-hidden
                  ${isActive 
                    ? 'text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-900/20' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'}
                  ${isSidebarCollapsed ? 'justify-center px-0' : 'px-4'}
                `}
              >
                {/* Active Indicator Line */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full" />
                )}

                <div className={`relative z-10 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                  <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                
                {!isSidebarCollapsed && (
                  <span className="relative z-10 animate-in fade-in slide-in-from-left-2 duration-300">
                    {item.label}
                  </span>
                )}
                
                {/* Hover Glow Effect */}
                <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700`} />
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer Controls */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/50 flex flex-col gap-4 hidden md:flex">
           {/* Collapse Button */}
           <button 
             onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
             className="w-full flex items-center justify-center py-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
             title="Toggle Sidebar"
           >
             {isSidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Top Navbar */}
        <header className="h-16 px-4 md:px-6 flex items-center justify-between bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 z-30 sticky top-0 transition-colors duration-500">
           <div className="flex items-center gap-4">
             <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 -ml-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors rounded-lg active:bg-slate-100 dark:active:bg-slate-800">
               <Menu size={24} />
             </button>
             <div className="hidden md:flex items-center gap-2 text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700/50 transition-colors">
               <Search size={14} />
               <input type="text" placeholder="Quick search..." className="bg-transparent border-none outline-none text-sm w-48 text-slate-600 dark:text-slate-300 placeholder-slate-400" />
               <div className="flex items-center gap-0.5 text-[10px] font-mono border border-slate-300 dark:border-slate-600 rounded px-1.5 bg-white dark:bg-slate-900">
                  <Command size={10} /> K
               </div>
             </div>
           </div>

           <div className="flex items-center gap-2 md:gap-4">
              {/* Theme Toggle */}
              <div className="relative">
                 <button 
                   onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                   className="p-2 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-all active:scale-95"
                 >
                   <ThemeIcon />
                 </button>
                 
                 {isThemeMenuOpen && (
                   <>
                   <div className="fixed inset-0 z-10" onClick={() => setIsThemeMenuOpen(false)}></div>
                   <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 z-20 overflow-hidden animate-in zoom-in-95 duration-200">
                      {(['light', 'dark', 'system'] as Theme[]).map(t => (
                        <button
                          key={t}
                          onClick={() => { setTheme(t); setIsThemeMenuOpen(false); }}
                          className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${theme === t ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                        >
                          {t === 'light' ? <Sun size={14} /> : t === 'dark' ? <Moon size={14} /> : <Laptop size={14} />}
                          <span className="capitalize">{t}</span>
                        </button>
                      ))}
                   </div>
                   </>
                 )}
              </div>

              {/* Notifications */}
              <div className="relative">
                <button 
                  onClick={() => { setIsNotifOpen(!isNotifOpen); markNotificationsRead(); }}
                  className="p-2 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-all relative active:scale-95"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 animate-bounce"></span>
                  )}
                </button>

                {isNotifOpen && (
                  <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsNotifOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 z-20 overflow-hidden animate-in zoom-in-95 slide-in-from-top-2 duration-200">
                     <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-sm">
                       <h3 className="font-bold text-slate-800 dark:text-white">Notifications</h3>
                       <span className="text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">{notifications.length} Total</span>
                     </div>
                     <div className="max-h-[300px] overflow-y-auto">
                       {notifications.length === 0 ? (
                         <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-sm">No new notifications</div>
                       ) : (
                         notifications.map(n => (
                           <div key={n.id} className={`p-4 border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${!n.read ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}>
                             <div className="flex justify-between items-start mb-1">
                               <h4 className={`text-sm font-semibold ${!n.read ? 'text-blue-700 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>{n.title}</h4>
                               <span className="text-[10px] text-slate-400">{new Date(n.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                             </div>
                             <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{n.message}</p>
                           </div>
                         ))
                       )}
                     </div>
                  </div>
                  </>
                )}
              </div>

              {/* Vertical Divider */}
              <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden md:block"></div>

              {/* User Profile & Logout */}
              <div className="flex items-center gap-2">
                 <button 
                   onClick={() => setIsProfileOpen(true)}
                   className="flex items-center gap-3 pl-1 pr-2 py-1 rounded-full hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all group"
                 >
                   <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 p-0.5 shadow-sm group-hover:shadow-md transition-shadow">
                      <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden">
                         {user.avatar && user.avatar.length > 2 ? (
                            <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                         ) : (
                            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-tr from-blue-600 to-purple-600 text-xs">{user.avatar || user.name[0]}</span>
                         )}
                      </div>
                   </div>
                   <div className="hidden md:block text-left">
                     <div className="text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{user.name}</div>
                   </div>
                 </button>

                 <button 
                   onClick={onLogout}
                   className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                   title="Sign Out"
                 >
                   <LogOut size={20} />
                 </button>
              </div>
           </div>
        </header>

        {/* Content Body with View Transition */}
        <div className="flex-1 overflow-auto p-4 md:p-8 scrollbar-hide">
           <div className={`max-w-7xl mx-auto min-h-full transition-all duration-500 ease-out ${animatingView ? 'opacity-0 translate-y-4 scale-95 filter blur-sm' : 'opacity-100 translate-y-0 scale-100 filter blur-0'}`}>
              {children}
           </div>
        </div>

      </main>

      {/* Profile Modal */}
      <ProfileModal 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)}
        user={user}
        onUpdate={(updatedUser) => {
           onUpdateUser(updatedUser);
        }}
      />
      
    </div>
  );
};