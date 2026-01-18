import React, { useState } from 'react';
import { Task } from '../types';
import { FileDown, FileText, FileSpreadsheet, Printer, Info, Calendar } from 'lucide-react';
import { STATUS_COLORS } from '../constants';

interface ReportsBoardProps {
  tasks: Task[];
}

type Period = 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';

export const ReportsBoard: React.FC<ReportsBoardProps> = ({ tasks }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('WEEK');
  // Initialize with today's date as ISO string for input compatibility
  const [referenceDateStr, setReferenceDateStr] = useState(new Date().toISOString().split('T')[0]);

  // Helper to find the start date (Tuesday) of the current weekly cycle relative to a given date
  const getTuesdayStart = (date: Date) => {
    const day = date.getDay();
    // Calculate days elapsed since the last Tuesday (where Tuesday is day 2)
    // If today is Tue(2), diff=0. Wed(3), diff=1... Mon(1), diff=6. Sun(0), diff=5.
    const daysSinceTue = (day + 7 - 2) % 7;
    const start = new Date(date);
    start.setDate(date.getDate() - daysSinceTue);
    start.setHours(0,0,0,0);
    return start;
  };

  const getReferenceDate = () => new Date(referenceDateStr);

  const filterTasks = (period: Period) => {
    const refDate = getReferenceDate();
    
    return tasks.filter(task => {
      const taskDate = new Date(task.date);
      // Fix timezone offset issues for day comparison by ensuring we operate on midnight boundaries in local time
      // or simply compare ISO date strings for equality/range
      
      const taskDay = taskDate.getDay(); // 0-6 Sun-Sat

      if (period === 'DAY') {
        return task.date === referenceDateStr;
      } else if (period === 'WEEK') {
        // Range: Tuesday to Monday
        const start = getTuesdayStart(refDate);
        const end = new Date(start);
        end.setDate(start.getDate() + 6); // Set to following Monday
        end.setHours(23, 59, 59, 999);

        // Reset task date time for accurate comparison
        taskDate.setHours(12,0,0,0); 
        
        // Filter by Range (Tue-Mon) AND Exclude Weekends (Sat=6, Sun=0)
        // taskDate must be >= start (Tue 00:00) and <= end (Mon 23:59)
        // And day must not be Sat or Sun
        return taskDate >= start && taskDate <= end && taskDay !== 0 && taskDay !== 6;
      } else if (period === 'MONTH') {
        return taskDate.getMonth() === refDate.getMonth() && taskDate.getFullYear() === refDate.getFullYear();
      } else if (period === 'YEAR') {
        return taskDate.getFullYear() === refDate.getFullYear();
      }
      return true;
    });
  };

  const displayedTasks = filterTasks(selectedPeriod);

  // Get date range string for display
  const getDateRangeString = () => {
    const refDate = getReferenceDate();
    if (selectedPeriod === 'WEEK') {
       const start = getTuesdayStart(refDate);
       const end = new Date(start);
       end.setDate(start.getDate() + 6); // End on Monday
       
       // Calculate explicit days excluding weekends
       // Tuesday(start) -> Friday, Monday(end)
       const startStr = start.toLocaleDateString(undefined, {month:'long', day:'numeric'});
       const endStr = end.toLocaleDateString(undefined, {month:'long', day:'numeric', year:'numeric'});
       
       return `${startStr} - ${endStr} (Tue-Mon, Excluding Weekends)`;
    }
    if (selectedPeriod === 'DAY') return refDate.toLocaleDateString(undefined, {weekday: 'long', month:'long', day:'numeric', year:'numeric'});
    if (selectedPeriod === 'MONTH') return refDate.toLocaleDateString(undefined, {month:'long', year:'numeric'});
    if (selectedPeriod === 'YEAR') return refDate.getFullYear().toString();
    return '';
  };

  // Export Logic
  const exportToCSV = () => {
    const headers = ['ID', 'Title', 'Location', 'Description', 'Date', 'Status', 'Remarks'];
    const rows = displayedTasks.map(t => [t.id, `"${t.title}"`, `"${t.location || ''}"`, `"${t.description}"`, t.date, t.status, `"${t.remarks}"`]);
    const csvContent = "data:text/csv;charset=utf-8," + 
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `tasks_report_${selectedPeriod.toLowerCase()}_${referenceDateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToDoc = () => {
    const html = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <title>Task Report</title>
        <style>
          body { font-family: Arial, sans-serif; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .status { font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>Task Report - ${selectedPeriod}</h1>
        <h3>Period: ${getDateRangeString()}</h3>
        <table>
          <tr><th>Title</th><th>Location</th><th>Date</th><th>Status</th><th>Description</th><th>Remarks</th></tr>
          ${displayedTasks.map(t => `
            <tr>
              <td>${t.title}</td>
              <td>${t.location || '-'}</td>
              <td>${t.date}</td>
              <td class="status">${t.status}</td>
              <td>${t.description}</td>
              <td>${t.remarks}</td>
            </tr>`).join('')}
        </table>
      </body></html>
    `;
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tasks_report_${selectedPeriod.toLowerCase()}_${referenceDateStr}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header and Controls */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 no-print transition-colors">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Generate Report</h2>
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Period Selector */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              {(['DAY', 'WEEK', 'MONTH', 'YEAR'] as Period[]).map(p => (
                <button
                  key={p}
                  onClick={() => setSelectedPeriod(p)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    selectedPeriod === p 
                    ? 'bg-white dark:bg-slate-600 shadow-sm text-blue-600 dark:text-blue-300' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Reference Date Picker */}
            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg">
              <Calendar size={16} className="text-slate-400" />
              <input 
                type="date"
                value={referenceDateStr}
                onChange={(e) => setReferenceDateStr(e.target.value)}
                className="text-sm text-slate-700 dark:text-slate-300 outline-none bg-transparent font-medium"
              />
            </div>
          </div>

          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            <button onClick={exportToCSV} className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40 rounded-lg border border-green-200 dark:border-green-800 transition-colors whitespace-nowrap">
              <FileSpreadsheet size={18} /> Excel (CSV)
            </button>
            <button onClick={exportToDoc} className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg border border-blue-200 dark:border-blue-800 transition-colors whitespace-nowrap">
              <FileText size={18} /> Word
            </button>
            <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors whitespace-nowrap">
              <Printer size={18} /> PDF / Print
            </button>
          </div>
        </div>
        
        {selectedPeriod === 'WEEK' && (
           <div className="mt-4 flex items-start gap-2 text-sm text-slate-500 dark:text-slate-400 bg-blue-50 dark:bg-blue-900/10 p-3 rounded-lg border border-blue-100 dark:border-blue-900/30">
              <Info size={16} className="mt-0.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <p>Weekly reports cover <strong>Tuesday through Monday</strong> based on the selected date ({referenceDateStr}). Tasks scheduled on <strong>weekends (Saturday & Sunday)</strong> are automatically excluded from this report.</p>
           </div>
        )}
      </div>

      {/* Preview / Printable Area */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 print-container">
        <div className="mb-6 border-b border-slate-200 pb-4">
          <h1 className="text-2xl font-bold text-slate-800">OmniTask Report</h1>
          <p className="text-slate-500 mt-1">
            Period: <span className="font-semibold text-slate-700">{getDateRangeString()}</span> <br/>
            Generated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {displayedTasks.length === 0 ? (
          <div className="text-center py-12 text-slate-400">No tasks found for this period.</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="pb-3 font-medium w-1/4">Task</th>
                <th className="pb-3 font-medium w-1/6">Location</th>
                <th className="pb-3 font-medium w-1/6">Date</th>
                <th className="pb-3 font-medium w-1/6">Status</th>
                <th className="pb-3 font-medium">Description/Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedTasks.map(task => (
                <tr key={task.id} className="group break-inside-avoid">
                  <td className="py-4 pr-4 align-top">
                    <div className="font-medium text-slate-800">{task.title}</div>
                    {task.reminder && <span className="text-[10px] bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded-full inline-block mt-1 print:border print:border-yellow-200">Reminder Set</span>}
                  </td>
                  <td className="py-4 text-slate-600 align-top">{task.location || '-'}</td>
                  <td className="py-4 text-slate-600 align-top">{task.date}</td>
                  <td className="py-4 align-top">
                    <span className={`px-2 py-1 rounded text-xs font-bold border ${STATUS_COLORS[task.status]} print:border print:bg-transparent print:text-black`}>
                      {task.status}
                    </span>
                  </td>
                  <td className="py-4 text-slate-600 align-top">
                    <div className="whitespace-pre-wrap">{task.description}</div>
                    {task.remarks && <div className="text-xs text-indigo-500 mt-1 italic print:text-slate-600">Note: {task.remarks}</div>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};