import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, X, Check, Filter, ChevronDown, Calendar, Bell, MapPin, Clock, Sparkles, Timer, Ban, RefreshCw, AlertCircle, ArrowUpDown, CalendarDays } from 'lucide-react';
import { Task, TaskStatus, DashboardView } from '../types';
import { STATUS_COLORS } from '../constants';

interface TaskBoardProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  setCurrentView: (view: DashboardView) => void;
}

type DateFilterType = 'ALL' | 'TODAY' | 'WEEK' | 'MONTH';
type ReminderFilterType = 'ALL' | 'HAS_REMINDER' | 'NO_REMINDER';
type SortOptionType = 'NEWEST' | 'OLDEST' | 'DUE_SOON' | 'DUE_LATE' | 'A_Z' | 'Z_A';

export const TaskBoard: React.FC<TaskBoardProps> = ({ tasks, setTasks, setCurrentView }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'ALL'>('ALL');
  const [dateFilter, setDateFilter] = useState<DateFilterType>('ALL');
  const [reminderFilter, setReminderFilter] = useState<ReminderFilterType>('ALL');
  const [sortOption, setSortOption] = useState<SortOptionType>('NEWEST');
  
  // State for transient animation when status changes
  const [justUpdated, setJustUpdated] = useState<{id: string, status: TaskStatus} | null>(null);

  // Empty task template
  const initialTaskState: Task = {
    id: '',
    title: '',
    description: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
    status: TaskStatus.PENDING,
    remarks: '',
    reminder: false,
    createdAt: Date.now()
  };

  const [currentTask, setCurrentTask] = useState<Task>(initialTaskState);
  const [isEditing, setIsEditing] = useState(false);

  const handleOpenModal = (task?: Task) => {
    if (task) {
      setCurrentTask(task);
      setIsEditing(true);
    } else {
      setCurrentTask({ ...initialTaskState, id: crypto.randomUUID(), createdAt: Date.now() });
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      setTasks(tasks.map(t => t.id === currentTask.id ? currentTask : t));
    } else {
      setTasks([...tasks, currentTask]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteTask = (id: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      setTasks(tasks.filter(t => t.id !== id));
    }
  };

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    setJustUpdated({ id: taskId, status: newStatus });
    // Remove the animation state after animation completes
    setTimeout(() => setJustUpdated(null), 800);
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
  };

  const handleDateChange = (taskId: string, newDate: string) => {
     setTasks(tasks.map(t => t.id === taskId ? { ...t, date: newDate } : t));
  }

  const checkDateFilter = (timestamp: number) => {
    if (dateFilter === 'ALL') return true;
    
    const date = new Date(timestamp);
    const now = new Date();
    
    // Normalize to start of day for accurate day comparisons
    const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    const nowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    if (dateFilter === 'TODAY') {
      return dateStart === nowStart;
    }
    
    if (dateFilter === 'WEEK') {
      const dayOfWeek = now.getDay(); // 0 (Sun) - 6 (Sat)
      const diffToMonday = (dayOfWeek + 6) % 7; // Distance to previous Monday
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - diffToMonday);
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      
      return date.getTime() >= startOfWeek.getTime() && date.getTime() <= endOfWeek.getTime();
    }
    
    if (dateFilter === 'MONTH') {
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }
    
    return true;
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task.location && task.location.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'ALL' || task.status === statusFilter;
    
    const matchesDate = checkDateFilter(task.createdAt);
    
    const matchesReminder = reminderFilter === 'ALL' || 
                           (reminderFilter === 'HAS_REMINDER' && task.reminder) ||
                           (reminderFilter === 'NO_REMINDER' && !task.reminder);

    return matchesSearch && matchesStatus && matchesDate && matchesReminder;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortOption) {
      case 'NEWEST': // New to Past (Creation Date)
        return b.createdAt - a.createdAt;
      case 'OLDEST': // Past to New (Creation Date)
        return a.createdAt - b.createdAt;
      case 'DUE_SOON': // Date Ascending
        return a.date.localeCompare(b.date);
      case 'DUE_LATE': // Date Descending
        return b.date.localeCompare(a.date);
      case 'A_Z': // Alphabetical
        return a.title.localeCompare(b.title);
      case 'Z_A': // Alphabetical
        return b.title.localeCompare(a.title);
      default:
        return 0;
    }
  });

  const getAnimationClass = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.DONE:
        return 'scale-[1.03] ring-2 ring-green-500 shadow-lg shadow-green-500/20 bg-green-50/80 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case TaskStatus.ON_GOING:
        return 'scale-[1.03] ring-2 ring-blue-500 shadow-lg shadow-blue-500/20 bg-blue-50/80 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      case TaskStatus.CANCELED:
        return 'scale-[0.98] opacity-80 ring-2 ring-red-500 bg-red-50/50 dark:bg-red-900/10 border-red-200 dark:border-red-800 grayscale-[0.5]';
      case TaskStatus.TO_RESCHEDULE:
        return 'scale-[1.03] ring-2 ring-orange-500 shadow-lg shadow-orange-500/20 bg-orange-50/80 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
      case TaskStatus.PENDING:
        return 'scale-100 ring-2 ring-yellow-400 bg-yellow-50/50 dark:bg-yellow-900/10';
      default:
        return '';
    }
  };

  const getStatusIcon = (status: TaskStatus) => {
      switch(status) {
          case TaskStatus.DONE: return <Sparkles size={16} className="text-green-500 animate-spin-slow" />;
          case TaskStatus.ON_GOING: return <Timer size={16} className="text-blue-500 animate-pulse" />;
          case TaskStatus.CANCELED: return <Ban size={16} className="text-red-500 animate-bounce" />;
          case TaskStatus.TO_RESCHEDULE: return <RefreshCw size={16} className="text-orange-500 animate-spin" />;
          case TaskStatus.PENDING: return <AlertCircle size={16} className="text-yellow-500" />;
          default: return null;
      }
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-10">
      {/* Controls Bar */}
      <div className="flex flex-col xl:flex-row justify-between gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors sticky top-0 z-10">
        <div className="flex flex-col md:flex-row items-center gap-3 w-full xl:w-auto">
          {/* Search */}
          <div className="relative w-full md:w-64 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white dark:focus:bg-slate-900 dark:text-white transition-all shadow-sm"
            />
          </div>

          {/* Filters Row */}
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
            
            {/* Filter Pills */}
            {[
              { value: statusFilter, setValue: setStatusFilter, options: Object.values(TaskStatus), label: 'Status' },
              { value: dateFilter, setValue: setDateFilter, options: ['ALL', 'TODAY', 'WEEK', 'MONTH'], label: 'Created' },
              { value: reminderFilter, setValue: setReminderFilter, options: ['ALL', 'HAS_REMINDER', 'NO_REMINDER'], label: 'Reminder' }
            ].map((filter, idx) => (
               <div key={idx} className="relative min-w-[130px]">
                  <select
                    value={filter.value}
                    onChange={(e) => filter.setValue(e.target.value as any)}
                    className="w-full appearance-none pl-4 pr-8 py-2.5 bg-slate-50 dark:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 rounded-xl text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer transition-all shadow-sm"
                  >
                    <option value="ALL">{filter.label}: All</option>
                    {filter.options.map(o => o !== 'ALL' && <option key={o} value={o}>{o.replace('_', ' ')}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
               </div>
            ))}

            {/* Sorting Dropdown */}
            <div className="relative min-w-[150px]">
               <ArrowUpDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
               <select
                 value={sortOption}
                 onChange={(e) => setSortOption(e.target.value as SortOptionType)}
                 className="w-full appearance-none pl-9 pr-8 py-2.5 bg-slate-50 dark:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 rounded-xl text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer transition-all shadow-sm"
               >
                 <option value="NEWEST">New to Past (Created)</option>
                 <option value="OLDEST">Past to New (Created)</option>
                 <option value="DUE_SOON">Date: Due Soon</option>
                 <option value="DUE_LATE">Date: Due Later</option>
                 <option value="A_Z">Alphabetical (A-Z)</option>
                 <option value="Z_A">Alphabetical (Z-A)</option>
               </select>
               <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
             onClick={() => setCurrentView(DashboardView.CALENDAR)}
             className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-all"
             title="Switch to Calendar"
          >
             <CalendarDays size={20} />
          </button>

          <button
            onClick={() => handleOpenModal()}
            className="flex-1 md:flex-none flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/30 transition-all active:scale-95 whitespace-nowrap justify-center group"
          >
            <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
            New Task
          </button>
        </div>
      </div>

      {/* Task Grid with Staggered Animation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedTasks.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 transition-colors animate-in fade-in zoom-in-95">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
               <Filter size={32} className="opacity-40" />
            </div>
            <p className="text-lg font-medium">No tasks found matching criteria.</p>
            <button 
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('ALL');
                setDateFilter('ALL');
                setReminderFilter('ALL');
              }}
              className="mt-2 text-blue-600 dark:text-blue-400 hover:underline text-sm font-bold"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          sortedTasks.map((task, idx) => (
            <div 
               key={task.id} 
               className={`bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-700 hover:-translate-y-1 transition-all duration-300 p-5 flex flex-col gap-3 group animate-slide-up break-inside-avoid relative overflow-hidden ${
                 justUpdated?.id === task.id ? getAnimationClass(justUpdated.status) : ''
               }`}
               style={{ animationDelay: `${idx * 75}ms` }}
            >
               {/* Accent Gradient Line */}
               <div className={`absolute top-0 left-0 w-full h-1 ${task.status === TaskStatus.DONE ? 'bg-green-500' : task.status === TaskStatus.CANCELED ? 'bg-red-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500'}`} />

              <div className="flex justify-between items-start mt-2">
                {/* Status Button Dropdown */}
                <div className="relative group/status inline-block">
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                    className={`appearance-none cursor-pointer pl-3 pr-8 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 hover:shadow-md ${STATUS_COLORS[task.status]}`}
                  >
                    {Object.values(TaskStatus).map(status => (
                      <option key={status} value={status} className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium text-sm py-1">
                        {status}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-60 text-current">
                     <ChevronDown size={12} strokeWidth={3} />
                  </div>
                </div>

                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-4 group-hover:translate-x-0 duration-200">
                  <button onClick={() => handleOpenModal(task)} className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDeleteTask(task.id)} className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <div className="flex-1">
                <h3 className={`font-bold text-lg leading-tight flex items-center gap-2 transition-all ${
                  task.status === TaskStatus.DONE 
                    ? 'text-slate-400 dark:text-slate-500' 
                    : task.status === TaskStatus.CANCELED 
                      ? 'text-slate-400 dark:text-slate-500 line-through' 
                      : 'text-slate-800 dark:text-slate-100'
                }`}>
                   {task.title}
                   {task.reminder && <Bell size={14} className="text-yellow-500 fill-yellow-500 animate-bounce-small" />}
                   {justUpdated?.id === task.id && getStatusIcon(justUpdated.status)}
                </h3>
                {task.location && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
                    <MapPin size={12} className="text-slate-400" />
                    <span>{task.location}</span>
                  </div>
                )}
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 line-clamp-2 leading-relaxed">{task.description || "No description provided."}</p>
              </div>

              {/* Editable Date and Remarks */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
                 <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 group/date cursor-pointer">
                        <Calendar size={14} className="text-slate-400 group-hover/date:text-blue-500 transition-colors" />
                        <input 
                          type="date"
                          value={task.date}
                          onChange={(e) => handleDateChange(task.id, e.target.value)}
                          className="text-xs font-bold text-slate-600 dark:text-slate-400 bg-transparent border-none focus:ring-0 cursor-pointer p-0"
                        />
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-300 dark:text-slate-600 font-mono" title="Created Date">
                       <Clock size={10} />
                       {new Date(task.createdAt).toLocaleDateString()}
                    </div>
                 </div>
                {task.remarks && (
                  <div className="text-[10px] text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-md inline-block w-fit max-w-full truncate font-medium border border-indigo-100 dark:border-indigo-800/50" title={task.remarks}>
                    {task.remarks}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg max-h-[90dvh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-300 border border-slate-200 dark:border-slate-800 transform transition-all flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50 sticky top-0 z-10 backdrop-blur-md">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                {isEditing ? 'Edit Task' : 'New Task'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 bg-white dark:bg-slate-800 p-1.5 rounded-full shadow-sm hover:shadow transition-all">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveTask} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Title</label>
                <input
                  required
                  autoFocus
                  type="text"
                  value={currentTask.title}
                  onChange={e => setCurrentTask({...currentTask, title: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white outline-none transition-shadow text-lg font-medium placeholder-slate-400"
                  placeholder="e.g., Submit Quarterly Report"
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Due Date</label>
                  <input
                    required
                    type="date"
                    value={currentTask.date}
                    onChange={e => setCurrentTask({...currentTask, date: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Status</label>
                  <select
                    value={currentTask.status}
                    onChange={e => setCurrentTask({...currentTask, status: e.target.value as TaskStatus})}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white outline-none"
                  >
                    {Object.values(TaskStatus).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Location</label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={currentTask.location || ''}
                    onChange={e => setCurrentTask({...currentTask, location: e.target.value})}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white outline-none transition-shadow"
                    placeholder="e.g. Head Office, Zoom"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Description</label>
                <textarea
                  value={currentTask.description}
                  onChange={e => setCurrentTask({...currentTask, description: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white outline-none resize-none transition-shadow"
                  placeholder="Add details..."
                />
              </div>

              <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/30 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                 <div className="flex-1">
                   <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Remarks</label>
                   <input
                     type="text"
                     value={currentTask.remarks}
                     onChange={e => setCurrentTask({...currentTask, remarks: e.target.value})}
                     className="w-full bg-transparent border-b border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:text-white outline-none py-1 text-sm"
                     placeholder="Optional notes..."
                   />
                 </div>
                 <div className="flex items-center gap-2 pl-4 border-l border-slate-200 dark:border-slate-700">
                    <label className="relative inline-flex items-center cursor-pointer group">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={currentTask.reminder}
                        onChange={e => setCurrentTask({...currentTask, reminder: e.target.checked})}
                      />
                      <div className="w-10 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 shadow-inner"></div>
                      <span className="ml-2 text-xs font-bold text-slate-500 dark:text-slate-400 group-hover:text-blue-600 transition-colors">Reminder</span>
                    </label>
                 </div>
              </div>

              <div className="pt-2 flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-slate-900 pb-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all active:scale-95 flex items-center gap-2"
                >
                  <Check size={18} />
                  {isEditing ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};