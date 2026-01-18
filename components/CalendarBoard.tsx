import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalIcon, MapPin, Plus, List, LayoutList } from 'lucide-react';
import { Task, CalendarDateState, DashboardView, TaskStatus } from '../types';
import { MONTH_NAMES, DAYS_OF_WEEK, STATUS_COLORS } from '../constants';

interface CalendarBoardProps {
  tasks: Task[];
  setCurrentView: (view: DashboardView) => void;
}

export const CalendarBoard: React.FC<CalendarBoardProps> = ({ tasks, setCurrentView }) => {
  const [calendarState, setCalendarState] = useState<CalendarDateState>({
    currentDate: new Date(),
    viewMode: 'month'
  });
  const [animating, setAnimating] = useState(false);

  // Trigger animation on month change
  const changeDate = (modifier: (d: Date) => void) => {
    setAnimating(true);
    setTimeout(() => {
      const newDate = new Date(calendarState.currentDate);
      modifier(newDate);
      setCalendarState({ ...calendarState, currentDate: newDate });
      setAnimating(false);
    }, 200); // Wait for exit animation
  };

  const handlePrev = () => {
    changeDate((d) => {
       if (calendarState.viewMode === 'day') d.setDate(d.getDate() - 1);
       if (calendarState.viewMode === 'month') d.setMonth(d.getMonth() - 1);
       if (calendarState.viewMode === 'year') d.setFullYear(d.getFullYear() - 1);
    });
  };

  const handleNext = () => {
    changeDate((d) => {
       if (calendarState.viewMode === 'day') d.setDate(d.getDate() + 1);
       if (calendarState.viewMode === 'month') d.setMonth(d.getMonth() + 1);
       if (calendarState.viewMode === 'year') d.setFullYear(d.getFullYear() + 1);
    });
  };

  const jumpToToday = () => {
    changeDate((d) => {
       const now = new Date();
       d.setFullYear(now.getFullYear(), now.getMonth(), now.getDate());
    });
  };

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const renderMonthView = () => {
    const year = calendarState.currentDate.getFullYear();
    const month = calendarState.currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const blanks = Array(firstDay).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
      <div className={`transition-all duration-300 ${animating ? 'opacity-0 translate-x-10 scale-95' : 'opacity-100 translate-x-0 scale-100'}`}>
        <div className="grid grid-cols-7 mb-2">
          {DAYS_OF_WEEK.map(day => (
            <div key={day} className="text-center text-[10px] md:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest py-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 md:gap-2 lg:gap-3">
          {blanks.map((_, i) => (
            <div key={`blank-${i}`} className="min-h-[80px] md:min-h-[100px] rounded-2xl bg-slate-50/50 dark:bg-slate-900/20 border border-transparent" />
          ))}
          {days.map(day => {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayTasks = tasks.filter(t => t.date === dateStr);
            const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
            const hasTasks = dayTasks.length > 0;

            return (
              <div 
                key={day} 
                className={`
                  relative min-h-[80px] md:min-h-[100px] p-1.5 md:p-3 rounded-xl md:rounded-2xl border transition-all duration-300 cursor-pointer group flex flex-col justify-between overflow-hidden
                  ${isToday 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40 border-blue-500 transform scale-[1.02]' 
                    : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-lg hover:-translate-y-1'
                  }
                `}
                onClick={() => setCalendarState({ currentDate: new Date(year, month, day), viewMode: 'day' })}
              >
                {/* Background Decoration for Today */}
                {isToday && <div className="absolute -right-4 -top-4 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>}

                <div className="flex justify-between items-start">
                  <span className={`text-xs md:text-sm font-bold w-5 h-5 md:w-6 md:h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
                    {day}
                  </span>
                  {hasTasks && (
                     <span className={`text-[9px] md:text-[10px] font-bold px-1.5 rounded ${isToday ? 'bg-white text-blue-600' : 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300'}`}>
                       {dayTasks.length}
                     </span>
                  )}
                </div>

                {/* Desktop: Show Text */}
                <div className="hidden md:block space-y-1 mt-2 relative z-10">
                  {dayTasks.slice(0, 2).map(task => (
                    <div 
                      key={task.id} 
                      className={`text-[10px] truncate px-1.5 py-0.5 rounded font-medium backdrop-blur-sm ${
                        isToday 
                          ? 'bg-white/20 text-white' 
                          : `${STATUS_COLORS[task.status].replace('border-', '')} border-l-2 bg-opacity-40`
                      }`}
                    >
                      {task.title}
                    </div>
                  ))}
                  {dayTasks.length > 2 && (
                    <div className={`text-[10px] text-center ${isToday ? 'text-white/70' : 'text-slate-400'}`}>
                      + {dayTasks.length - 2} more
                    </div>
                  )}
                </div>
                
                {/* Mobile: Show Dots */}
                <div className="md:hidden flex flex-wrap gap-1 mt-1 justify-center relative z-10">
                  {dayTasks.slice(0, 4).map(task => {
                    let dotColor = 'bg-slate-400';
                    if (task.status === TaskStatus.DONE) dotColor = 'bg-green-500';
                    else if (task.status === TaskStatus.ON_GOING) dotColor = 'bg-blue-500';
                    else if (task.status === TaskStatus.PENDING) dotColor = 'bg-yellow-500';
                    else if (task.status === TaskStatus.CANCELED) dotColor = 'bg-red-500';
                    
                    return (
                      <div key={task.id} className={`w-1.5 h-1.5 rounded-full ${isToday ? 'bg-white' : dotColor}`} />
                    );
                  })}
                  {dayTasks.length > 4 && <div className={`w-1.5 h-1.5 rounded-full ${isToday ? 'bg-white' : 'bg-slate-300'}`} >+</div>}
                </div>
                
                {/* Hover Add Button */}
                <div className={`hidden md:block absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${isToday ? 'text-white' : 'text-slate-400'}`}>
                   <Plus size={14} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const dateStr = calendarState.currentDate.toISOString().split('T')[0];
    const dayTasks = tasks.filter(t => t.date === dateStr);

    return (
      <div className={`max-w-3xl mx-auto transition-all duration-300 ${animating ? 'opacity-0 translate-y-10' : 'opacity-100 translate-y-0'}`}>
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
           <div className="bg-slate-50 dark:bg-slate-800/50 p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                 <h3 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">{calendarState.currentDate.toLocaleDateString(undefined, {weekday: 'long'})}</h3>
                 <p className="text-sm md:text-base text-slate-500 dark:text-slate-400">{calendarState.currentDate.toLocaleDateString(undefined, {month: 'long', day: 'numeric', year: 'numeric'})}</p>
              </div>
              <div className="bg-white dark:bg-slate-900 px-4 py-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-center">
                 <div className="text-xs text-slate-400 uppercase font-bold">Tasks</div>
                 <div className="text-xl md:text-2xl font-black text-blue-600 dark:text-blue-400">{dayTasks.length}</div>
              </div>
           </div>

           <div className="p-4 md:p-6 min-h-[400px]">
             {dayTasks.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 py-20 space-y-4">
                   <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <List size={24} />
                   </div>
                   <p>No tasks scheduled. Enjoy your day!</p>
                </div>
             ) : (
                <div className="space-y-4">
                   {dayTasks.map((task, idx) => (
                      <div 
                        key={task.id} 
                        className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all group animate-slide-up"
                        style={{animationDelay: `${idx * 100}ms`}}
                      >
                         <div className={`mt-1 w-3 h-3 rounded-full shrink-0 ${
                            task.status === 'DONE' ? 'bg-green-500' : 
                            task.status === 'ON-GOING' ? 'bg-blue-500' : 'bg-slate-300'
                         }`} />
                         <div className="flex-1 min-w-0">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-1">
                               <h4 className={`text-base md:text-lg font-bold truncate w-full md:w-auto ${
                                 task.status === 'DONE' 
                                   ? 'text-slate-400 dark:text-slate-500' 
                                   : task.status === 'CANCELED' 
                                     ? 'text-slate-400 dark:text-slate-500 line-through'
                                     : 'text-slate-800 dark:text-white'
                               }`}>
                                 {task.title}
                               </h4>
                               <span className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider ${STATUS_COLORS[task.status]}`}>
                                 {task.status}
                               </span>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{task.description}</p>
                            {task.location && (
                               <div className="flex items-center gap-1 text-xs text-slate-400 mt-2">
                                  <MapPin size={12} /> {task.location}
                               </div>
                            )}
                         </div>
                      </div>
                   ))}
                </div>
             )}
           </div>
        </div>
      </div>
    );
  };

  const renderYearView = () => {
    const year = calendarState.currentDate.getFullYear();
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 transition-all duration-300 ${animating ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`}>
        {MONTH_NAMES.map((monthName, index) => {
          const count = tasks.filter(t => {
            const d = new Date(t.date);
            return d.getFullYear() === year && d.getMonth() === index;
          }).length;
          
          return (
            <div 
              key={monthName} 
              onClick={() => setCalendarState({ currentDate: new Date(year, index, 1), viewMode: 'month' })}
              className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-xl hover:-translate-y-1 cursor-pointer transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                 <CalIcon size={60} />
              </div>
              
              <div className="font-bold text-xl text-slate-700 dark:text-slate-200 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{monthName}</div>
              
              <div className="flex items-end gap-2">
                 <span className="text-4xl font-black text-slate-800 dark:text-white">{count}</span>
                 <span className="text-sm text-slate-400 mb-1 font-medium">tasks</span>
              </div>
              
              <div className="mt-4 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                 <div className="h-full bg-blue-500 rounded-full" style={{width: `${Math.min(count * 5, 100)}%`}}></div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-4 md:space-y-8 pb-10">
      {/* Calendar Toolbar */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-2 pl-4 pr-2 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors sticky top-0 z-20">
        <div className="flex items-center justify-between w-full lg:w-auto gap-4">
           <div className="flex items-center gap-4">
             <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button onClick={handlePrev} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition-all shadow-sm"><ChevronLeft size={18} /></button>
                <button onClick={handleNext} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition-all shadow-sm"><ChevronRight size={18} /></button>
             </div>
             <h2 className="text-lg md:text-2xl font-black text-slate-800 dark:text-white tracking-tight truncate max-w-[150px] md:max-w-none">
                {calendarState.viewMode === 'day' && calendarState.currentDate.toLocaleDateString(undefined, {month: 'long', day: 'numeric'})}
                {calendarState.viewMode === 'month' && MONTH_NAMES[calendarState.currentDate.getMonth()]}
                {calendarState.viewMode === 'year' && "Year Overview"}
                <span className="text-slate-400 dark:text-slate-600 ml-2 font-medium">{calendarState.currentDate.getFullYear()}</span>
             </h2>
           </div>
           
           {/* Mobile List Toggle */}
           <button 
             onClick={() => setCurrentView(DashboardView.TASKS)}
             className="lg:hidden p-2 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 bg-slate-100 dark:bg-slate-800 rounded-lg"
           >
             <LayoutList size={20} />
           </button>
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto justify-between lg:justify-end">
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-xl p-1.5 flex-1 lg:flex-none justify-center">
            {['day', 'month', 'year'].map((mode) => (
              <button
                key={mode}
                onClick={() => setCalendarState({ ...calendarState, viewMode: mode as any })}
                className={`flex-1 lg:flex-none px-4 md:px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                  calendarState.viewMode === mode 
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-md transform scale-105' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                } capitalize`}
              >
                {mode}
              </button>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-2">
             <button 
              onClick={jumpToToday}
              className="text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-95"
            >
              Today
            </button>
            <button 
              onClick={() => setCurrentView(DashboardView.TASKS)}
              className="p-2.5 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 bg-slate-100 dark:bg-slate-800 rounded-xl hover:shadow-sm transition-all"
              title="Switch to List View"
            >
              <LayoutList size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* View Content */}
      <div className="min-h-[500px]">
        {calendarState.viewMode === 'month' && renderMonthView()}
        {calendarState.viewMode === 'day' && renderDayView()}
        {calendarState.viewMode === 'year' && renderYearView()}
      </div>
    </div>
  );
};