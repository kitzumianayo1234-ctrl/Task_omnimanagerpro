import React from 'react';
import { Task, TaskStatus } from '../types';
import { STATUS_COLORS } from '../constants';
import { History, CalendarDays, Rocket } from 'lucide-react';

interface HistoryBoardProps {
  tasks: Task[];
}

const TaskListItem: React.FC<{ task: Task }> = ({ task }) => (
  <div className="flex items-center p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg hover:shadow-sm hover:border-slate-200 dark:hover:border-slate-600 transition-all mb-2 group">
    <div className={`w-2 h-2 rounded-full mr-3 shrink-0 ${
      task.status === TaskStatus.DONE ? 'bg-green-500' :
      task.status === TaskStatus.ON_GOING ? 'bg-blue-500' :
      task.status === TaskStatus.CANCELED ? 'bg-red-500' :
      task.status === TaskStatus.TO_RESCHEDULE ? 'bg-orange-500' :
      'bg-yellow-500'
    }`} />
    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-center">
        <h4 className={`font-medium text-sm truncate pr-2 ${
          task.status === TaskStatus.CANCELED ? 'text-slate-500 dark:text-slate-400 line-through' : 
          task.status === TaskStatus.DONE ? 'text-slate-500 dark:text-slate-400' : 
          'text-slate-800 dark:text-slate-200'
        }`}>
          {task.title}
        </h4>
        <span className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap">{task.date}</span>
      </div>
      <div className="flex justify-between items-center mt-1">
        <span className={`text-[9px] px-1.5 py-0.5 rounded border dark:bg-transparent ${STATUS_COLORS[task.status]}`}>
          {task.status}
        </span>
      </div>
      {task.remarks && (
        <div className="mt-1 text-[10px] text-indigo-500 dark:text-indigo-400 truncate opacity-80">
          Note: {task.remarks}
        </div>
      )}
    </div>
  </div>
);

export const HistoryBoard: React.FC<HistoryBoardProps> = ({ tasks }) => {
  const today = new Date().toISOString().split('T')[0];

  const oldTasks = tasks.filter(t => t.date < today).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const presentTasks = tasks.filter(t => t.date === today);
  const futureTasks = tasks.filter(t => t.date > today).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full animate-in fade-in duration-300">
      {/* Old / Past */}
      <div className="flex flex-col h-full bg-slate-100/50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-200 dark:border-slate-800 transition-colors">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-300 dark:border-slate-700">
          <History className="text-slate-500 dark:text-slate-400" size={20} />
          <h2 className="font-bold text-slate-600 dark:text-slate-300">Old / Past</h2>
          <span className="ml-auto bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold px-2 py-0.5 rounded-full">
            {oldTasks.length}
          </span>
        </div>
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
          {oldTasks.length > 0 ? (
            oldTasks.map(task => <TaskListItem key={task.id} task={task} />)
          ) : (
            <div className="text-center py-8 text-slate-400 dark:text-slate-600 text-sm">No past tasks.</div>
          )}
        </div>
      </div>

      {/* Present / Today */}
      <div className="flex flex-col h-full bg-blue-50/50 dark:bg-blue-900/10 rounded-xl p-4 border border-blue-100 dark:border-blue-900/30 transition-colors">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-blue-300 dark:border-blue-800">
          <CalendarDays className="text-blue-600 dark:text-blue-400" size={20} />
          <h2 className="font-bold text-blue-800 dark:text-blue-300">Present / Today</h2>
          <span className="ml-auto bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold px-2 py-0.5 rounded-full">
            {presentTasks.length}
          </span>
        </div>
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-blue-200 dark:scrollbar-thumb-blue-800">
          {presentTasks.length > 0 ? (
            presentTasks.map(task => <TaskListItem key={task.id} task={task} />)
          ) : (
            <div className="text-center py-8 text-slate-400 dark:text-slate-600 text-sm">No tasks for today.</div>
          )}
        </div>
      </div>

      {/* Future */}
      <div className="flex flex-col h-full bg-purple-50/50 dark:bg-purple-900/10 rounded-xl p-4 border border-purple-100 dark:border-purple-900/30 transition-colors">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-purple-300 dark:border-purple-800">
          <Rocket className="text-purple-600 dark:text-purple-400" size={20} />
          <h2 className="font-bold text-purple-800 dark:text-purple-300">Future</h2>
          <span className="ml-auto bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs font-bold px-2 py-0.5 rounded-full">
            {futureTasks.length}
          </span>
        </div>
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-purple-200 dark:scrollbar-thumb-purple-800">
          {futureTasks.length > 0 ? (
            futureTasks.map(task => <TaskListItem key={task.id} task={task} />)
          ) : (
            <div className="text-center py-8 text-slate-400 dark:text-slate-600 text-sm">No upcoming tasks.</div>
          )}
        </div>
      </div>
    </div>
  );
};