import React, { useState, useMemo } from 'react';
import { Task, TaskStatus, DashboardView } from '../types';
import { TrendingUp, Award, Quote, Calendar, ArrowRight, Activity, CheckCircle2, PieChart, Info, HelpCircle, MapPin, Zap, BarChart3, ArrowUpRight, ArrowDownRight, Minus, Medal } from 'lucide-react';
import { DAYS_OF_WEEK } from '../constants';

interface AnalyticsBoardProps {
  tasks: Task[];
  setCurrentView: (view: DashboardView) => void;
}

type TimeFrame = 'WEEK' | 'MONTH' | 'YEAR';

const INSPIRATIONAL_QUOTES = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Productivity is being able to do things that you were never able to do before.", author: "Franz Kafka" },
  { text: "It’s not always that we need to do more but rather that we need to focus on less.", author: "Nathan W. Morris" },
  { text: "Amateurs sit and wait for inspiration, the rest of us just get up and go to work.", author: "Stephen King" },
  { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
  { text: "You don't have to see the whole staircase, just take the first step.", author: "Martin Luther King Jr." },
  { text: "Starve your distractions, feed your focus.", author: "Unknown" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" }
];

export const AnalyticsBoard: React.FC<AnalyticsBoardProps> = ({ tasks, setCurrentView }) => {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('WEEK');
  const [showDefinitions, setShowDefinitions] = useState(false);

  // Daily Quote Logic (Seeded by date)
  const today = new Date();
  const quoteIndex = (today.getFullYear() + today.getMonth() + today.getDate()) % INSPIRATIONAL_QUOTES.length;
  const dailyQuote = INSPIRATIONAL_QUOTES[quoteIndex];

  // Logic: Get Current and Previous Period Tasks
  const { currentTasks, previousTasks } = useMemo(() => {
    const startOfCurrent = new Date();
    startOfCurrent.setHours(0,0,0,0);
    
    const startOfPrevious = new Date();
    startOfPrevious.setHours(0,0,0,0);
    
    const endOfPrevious = new Date(); // End of previous is right before start of current
    endOfPrevious.setHours(23,59,59,999);

    if (timeFrame === 'WEEK') {
      // Logic: Current week starts Monday. Previous week is the 7 days before that.
      const day = startOfCurrent.getDay(); // 0 is Sunday
      const diff = startOfCurrent.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
      startOfCurrent.setDate(diff);
      
      startOfPrevious.setDate(startOfCurrent.getDate() - 7);
      endOfPrevious.setDate(startOfCurrent.getDate() - 1);
    } else if (timeFrame === 'MONTH') {
      startOfCurrent.setDate(1); // 1st of current month
      
      startOfPrevious.setMonth(startOfCurrent.getMonth() - 1); // 1st of previous month
      startOfPrevious.setDate(1);

      endOfPrevious.setDate(0); // Last day of previous month
    } else if (timeFrame === 'YEAR') {
      startOfCurrent.setMonth(0, 1); // Jan 1st of current year
      
      startOfPrevious.setFullYear(startOfCurrent.getFullYear() - 1);
      startOfPrevious.setMonth(0, 1);

      endOfPrevious.setFullYear(startOfCurrent.getFullYear() - 1);
      endOfPrevious.setMonth(11, 31);
    }

    // Filter
    const current = tasks.filter(t => new Date(t.date) >= startOfCurrent);
    // Note: For previous, we enforce an upper bound to only count that specific previous window
    const previous = tasks.filter(t => {
      const d = new Date(t.date);
      return d >= startOfPrevious && d <= endOfPrevious;
    });

    return { currentTasks: current, previousTasks: previous };
  }, [tasks, timeFrame]);

  // --- KPI Calculators ---

  const calculateMetrics = (taskList: Task[]) => {
    const total = taskList.length;
    const completed = taskList.filter(t => t.status === TaskStatus.DONE).length;
    const inProgress = taskList.filter(t => t.status === TaskStatus.ON_GOING).length;
    const pending = taskList.filter(t => t.status === TaskStatus.PENDING).length;
    
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const efficiency = total > 0 ? Math.round(((completed + (inProgress * 0.5)) / total) * 100) : 0;
    
    return { total, completed, inProgress, pending, rate, efficiency };
  };

  const currentMetrics = calculateMetrics(currentTasks);
  const previousMetrics = calculateMetrics(previousTasks);

  // --- Deep Dive Metrics (Current Period) ---
  
  // 1. Peak Productivity Day
  const getProductiveDay = () => {
    const counts = Array(7).fill(0);
    currentTasks.filter(t => t.status === TaskStatus.DONE).forEach(t => {
      const d = new Date(t.date).getDay();
      counts[d]++;
    });
    const max = Math.max(...counts);
    if (max === 0) return { day: 'N/A', count: 0 };
    const index = counts.indexOf(max);
    return { day: DAYS_OF_WEEK[index], count: max };
  };
  const bestDay = getProductiveDay();

  // 2. Top Location
  const getTopLocation = () => {
    const locs: Record<string, number> = {};
    currentTasks.forEach(t => {
      if (t.location) {
        const l = t.location.trim();
        locs[l] = (locs[l] || 0) + 1;
      }
    });
    const entries = Object.entries(locs).sort((a,b) => b[1] - a[1]);
    return entries.length > 0 ? { name: entries[0][0], count: entries[0][1] } : { name: 'N/A', count: 0 };
  };
  const topLoc = getTopLocation();

  // --- Gamification Level ---
  const getProductivityLevel = () => {
    const score = currentMetrics.efficiency;
    if (currentMetrics.total === 0) return { label: 'Newcomer', color: 'text-slate-400 dark:text-slate-500', icon: Medal };
    if (score >= 90) return { label: 'Grandmaster', color: 'text-yellow-500 dark:text-yellow-400', icon: Award };
    if (score >= 75) return { label: 'Expert', color: 'text-purple-500 dark:text-purple-400', icon: Award };
    if (score >= 50) return { label: 'Achiever', color: 'text-blue-500 dark:text-blue-400', icon: Medal };
    return { label: 'Apprentice', color: 'text-green-500 dark:text-green-400', icon: Medal };
  };
  const level = getProductivityLevel();

  // --- Charts Logic ---

  const getChartData = () => {
    if (timeFrame === 'WEEK') {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const counts = Array(7).fill(0);
      const startOfWeek = new Date();
      startOfWeek.setHours(0,0,0,0);
      const day = startOfWeek.getDay() || 7; 
      startOfWeek.setDate(startOfWeek.getDate() - day + 1);

      currentTasks.forEach(t => {
        const tDate = new Date(t.date);
        const dayIndex = (tDate.getDay() + 6) % 7; 
        if (tDate >= startOfWeek) {
           counts[dayIndex]++;
        }
      });
      const max = Math.max(...counts, 1);
      return days.map((d, i) => ({ label: d, value: counts[i], height: `${(counts[i]/max)*100}%` }));
    } else {
       // Simple status distribution for Month/Year in bar format
       const { completed, inProgress, pending } = currentMetrics;
       const canceled = currentTasks.filter(t => t.status === TaskStatus.CANCELED).length;
       const total = currentMetrics.total || 1;
       
       return [
         { label: 'Done', value: completed, height: `${(completed/total)*100}%`, color: 'bg-green-500' },
         { label: 'WIP', value: inProgress, height: `${(inProgress/total)*100}%`, color: 'bg-blue-500' },
         { label: 'Todo', value: pending, height: `${(pending/total)*100}%`, color: 'bg-yellow-400' },
         { label: 'Cancel', value: canceled, height: `${(canceled/total)*100}%`, color: 'bg-red-400' },
       ];
    }
  };
  const chartData = getChartData();

  // Suggestions Logic
  const getSuggestions = () => {
    const suggestions = [];
    if (currentMetrics.rate < 40 && currentMetrics.total > 3) {
      suggestions.push({
        title: "Boost Completion Rate",
        text: "Your completion rate is below 40%. Try breaking down large tasks into smaller sub-tasks.",
        type: "warning"
      });
    }
    if (currentMetrics.inProgress > 3) {
      suggestions.push({
        title: "Too Many Active Tasks",
        text: "You have multiple tasks 'On-Going'. focusing on one at a time increases efficiency.",
        type: "info"
      });
    }
    const canceled = currentTasks.filter(t => t.status === TaskStatus.CANCELED).length;
    if (canceled > (currentMetrics.total * 0.2)) {
      suggestions.push({
        title: "High Cancellation Rate",
        text: "Review your planning process. You are cancelling more than 20% of tasks.",
        type: "alert"
      });
    }
    if (currentMetrics.total === 0) {
      suggestions.push({
        title: "Plan Your Week",
        text: "No tasks found for this period. Start by adding your key priorities.",
        type: "info"
      });
    } else if (currentMetrics.rate > 80) {
      suggestions.push({
        title: "Excellent Momentum",
        text: "You are crushing it! Consider taking on a more challenging project.",
        type: "success"
      });
    }
    return suggestions;
  };

  // Donut Chart Data
  const donutData = [
    { label: 'Done', value: currentMetrics.completed, color: '#22c55e' },
    { label: 'On-Going', value: currentMetrics.inProgress, color: '#3b82f6' },
    { label: 'Pending', value: currentMetrics.pending, color: '#eab308' },
    { label: 'Canceled', value: currentTasks.filter(t => t.status === TaskStatus.CANCELED).length, color: '#f87171' },
    { label: 'Reschedule', value: currentTasks.filter(t => t.status === TaskStatus.TO_RESCHEDULE).length, color: '#f97316' },
  ].filter(d => d.value > 0);

  let cumulativePercent = 0;
  const donutSegments = donutData.map(d => {
    const startPercent = cumulativePercent;
    const percent = d.value / (currentMetrics.total || 1);
    cumulativePercent += percent;
    
    // SVG Circle Math
    const dashArray = `${percent * 100} 100`;
    const dashOffset = 25 - (startPercent * 100); 

    return { ...d, percent, dashArray, dashOffset };
  });

  // Narrative Analysis Logic
  const getAnalysisText = () => {
    if (currentMetrics.total === 0) return "No activity recorded for this period. Add tasks to your calendar or list to generate performance data.";
    
    const sortedStatus = [...donutData].sort((a,b) => b.value - a.value);
    const dominantStatus = sortedStatus[0];
    const dominantPercent = dominantStatus ? Math.round((dominantStatus.value / currentMetrics.total) * 100) : 0;

    let text = `Based on your activity over this ${timeFrame === 'WEEK' ? 'week' : timeFrame === 'MONTH' ? 'month' : 'year'}, you have managed a total of ${currentMetrics.total} items. `;
    
    if (dominantStatus) {
        text += `Your current focus is predominantly on '${dominantStatus.label}' tasks, which account for ${dominantPercent}% of your workload. `;
    }

    if (currentMetrics.rate > 66) {
      text += `You are demonstrating high efficiency with a ${currentMetrics.rate}% completion rate. Keep up this momentum. `;
    } else if (currentMetrics.rate > 33) {
      text += `Your progress is steady with ${currentMetrics.rate}% of tasks completed. `;
    } else {
      text += `With a ${currentMetrics.rate}% completion rate, it appears many tasks are still pending or in early stages. `;
    }

    // Add deep dive context
    if (bestDay.day !== 'N/A') {
      text += `Your most productive day was ${bestDay.day} with ${bestDay.count} tasks completed. `;
    }
    
    if (topLoc.name !== 'N/A') {
       text += `A significant portion of your work (${Math.round((topLoc.count/currentMetrics.total)*100)}%) happens at "${topLoc.name}". `;
    }

    return text;
  };

  // --- Sub-Components ---
  
  const TrendDisplay = ({ current, previous, inverse = false }: { current: number, previous: number, inverse?: boolean }) => {
     if (previous === 0) return <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 flex items-center gap-1"><Minus size={10} /> No prev data</div>;
     
     const diff = current - previous;
     const percent = Math.round((Math.abs(diff) / previous) * 100);
     const isPositive = diff > 0;
     const isNeutral = diff === 0;

     if (isNeutral) return <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 flex items-center gap-1"><Minus size={10} /> Same as last period</div>;

     // Logic: 
     // Standard (e.g. Rate, Efficiency): Increase = Good (Green), Decrease = Bad (Red)
     // Inverse (e.g. Pending): Increase = Bad (Red), Decrease = Good (Green)
     // Workload (Total): Increase = Neutral/Blue (Busy), Decrease = Neutral/Slate
     
     let color = '';
     let Icon = isPositive ? ArrowUpRight : ArrowDownRight;
     
     if (inverse) {
         // Good to go down
         color = isPositive ? 'text-red-500 bg-red-50 dark:bg-red-900/20' : 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
     } else {
         // Good to go up
         color = isPositive ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20' : 'text-red-500 bg-red-50 dark:bg-red-900/20';
     }

     return (
       <div className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium mt-2 flex items-center gap-1 w-fit ${color}`}>
          <Icon size={10} />
          {percent}%
          <span className="opacity-75 font-normal">vs last period</span>
       </div>
     );
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-500">
      
      {/* Daily Inspiration Hero */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-800 dark:to-indigo-800 rounded-2xl p-8 text-white shadow-lg dark:shadow-indigo-900/30 relative overflow-hidden transition-all hover:shadow-xl hover:scale-[1.01] duration-300 group">
        <div className="absolute top-0 right-0 p-8 opacity-10 animate-pulse transition-opacity group-hover:opacity-20">
          <Quote size={120} />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 text-indigo-200 text-sm font-medium mb-3 uppercase tracking-wider">
            <Award size={16} /> Daily Inspiration
          </div>
          <h1 className="text-2xl md:text-3xl font-serif italic leading-relaxed mb-4">
            "{dailyQuote.text}"
          </h1>
          <p className="text-indigo-100 font-medium">— {dailyQuote.author}</p>
        </div>
      </div>

      {/* Analytics Controls & Productivity Level */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Activity className="text-indigo-600 dark:text-indigo-400" />
            Productivity Dashboard
            </h2>
            <div className={`text-xs font-bold mt-1 flex items-center gap-1.5 ${level.color}`}>
               <level.icon size={12} />
               Level: {level.label}
            </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowDefinitions(!showDefinitions)}
            className={`p-2 rounded-lg transition-colors ${showDefinitions ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            title="Metrics Guide"
          >
            <HelpCircle size={20} />
          </button>
          <div className="bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm flex transition-colors">
            {(['WEEK', 'MONTH', 'YEAR'] as TimeFrame[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeFrame(tf)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  timeFrame === tf 
                  ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                {tf === 'WEEK' ? 'Weekly' : tf === 'MONTH' ? 'Monthly' : 'Yearly'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Metrics Definitions Panel */}
      {showDefinitions && (
        <div className="bg-slate-800 dark:bg-slate-900 text-slate-200 p-4 rounded-xl shadow-lg border border-slate-700 dark:border-slate-800 animate-in slide-in-from-top-2">
          <h4 className="font-bold text-white mb-2 flex items-center gap-2"><Info size={16} /> How we measure success</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs leading-relaxed">
             <div>
               <strong className="text-indigo-300 block mb-1">Completion Rate</strong>
               The percentage of tasks marked as 'DONE' out of all tasks created in the selected period. Aim for {'>'}70%.
             </div>
             <div>
               <strong className="text-indigo-300 block mb-1">Efficiency Score</strong>
               A weighted score: Completed tasks count 100%, On-Going tasks count 50%. Gives credit for work in progress.
             </div>
             <div>
               <strong className="text-indigo-300 block mb-1">Status Distribution</strong>
               A breakdown of your workflow stages. High 'Pending' counts indicate potential bottlenecks.
             </div>
          </div>
        </div>
      )}

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all group">
           <div className="text-slate-500 dark:text-slate-400 text-sm font-medium group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Completion Rate</div>
           <div>
             <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-slate-800 dark:text-white">{currentMetrics.rate}%</span>
                <div className="h-2 flex-1 bg-slate-100 dark:bg-slate-800 rounded-full mb-2 ml-2 overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full transition-all duration-1000" style={{width: `${currentMetrics.rate}%`}}></div>
                </div>
             </div>
             <TrendDisplay current={currentMetrics.rate} previous={previousMetrics.rate} />
           </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all group">
           <div className="text-slate-500 dark:text-slate-400 text-sm font-medium group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Total Workload</div>
           <div>
               <div className="text-3xl font-bold text-slate-800 dark:text-white">{currentMetrics.total}</div>
               <div className="text-xs text-slate-400 dark:text-slate-500 mt-1 mb-1">Tasks Created</div>
               {/* For workload, increase is neutral/blue */}
               <div className="text-[10px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded-full w-fit flex items-center gap-1">
                  {currentMetrics.total >= previousMetrics.total ? <ArrowUpRight size={10}/> : <ArrowDownRight size={10}/>}
                  {previousMetrics.total > 0 ? Math.round(((currentMetrics.total - previousMetrics.total)/previousMetrics.total)*100) : 0}% vs last
               </div>
           </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all group">
           <div className="text-slate-500 dark:text-slate-400 text-sm font-medium group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Pending Items</div>
           <div>
              <div className="text-3xl font-bold text-slate-800 dark:text-white">{currentMetrics.pending}</div>
              <TrendDisplay current={currentMetrics.pending} previous={previousMetrics.pending} inverse={true} />
           </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all group">
           <div className="text-slate-500 dark:text-slate-400 text-sm font-medium group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Efficiency Score</div>
           <div>
              <div className="text-3xl font-bold text-slate-800 dark:text-white">{currentMetrics.efficiency}</div>
              <TrendDisplay current={currentMetrics.efficiency} previous={previousMetrics.efficiency} />
           </div>
        </div>
      </div>

      {/* Performance Summary & Deep Dive */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {/* Narrative Text */}
         <div className="md:col-span-2 bg-indigo-50/50 dark:bg-indigo-900/10 p-6 rounded-xl border border-indigo-100 dark:border-indigo-800/50 shadow-sm flex gap-4 items-start">
            <div className="p-3 bg-white dark:bg-slate-800 rounded-lg text-indigo-600 dark:text-indigo-400 shadow-sm mt-1 flex-shrink-0">
               <Info size={20} />
            </div>
            <div>
               <h3 className="font-bold text-slate-800 dark:text-white mb-2">Executive Summary</h3>
               <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                  {getAnalysisText()}
               </p>
            </div>
         </div>

         {/* Mini Stats: Key Drivers */}
         <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center space-y-4">
            <h3 className="font-bold text-slate-700 dark:text-slate-300 text-xs uppercase tracking-wider mb-1">Key Performance Drivers</h3>
            
            <div className="flex items-center gap-3">
               <div className="p-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg"><Zap size={18} /></div>
               <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Peak Performance Day</div>
                  <div className="font-bold text-slate-800 dark:text-white">{bestDay.day} <span className="text-xs font-normal text-slate-400">({bestDay.count} done)</span></div>
               </div>
            </div>

            <div className="flex items-center gap-3">
               <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg"><MapPin size={18} /></div>
               <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Primary Workspace</div>
                  <div className="font-bold text-slate-800 dark:text-white">{topLoc.name} <span className="text-xs font-normal text-slate-400">({topLoc.count} tasks)</span></div>
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Bar Chart Section */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-center mb-6">
             <h3 className="font-bold text-slate-700 dark:text-white flex items-center gap-2">
               <BarChart3 size={18} className="text-slate-400" />
               {timeFrame === 'WEEK' ? 'Activity Overview' : 'Status Breakdown'}
             </h3>
             <span className="text-xs font-medium text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded">
               Last {timeFrame === 'WEEK' ? '7 Days' : timeFrame === 'MONTH' ? '30 Days' : '12 Months'}
             </span>
          </div>
          
          <div className="h-64 flex items-end justify-between gap-2 md:gap-4 px-2">
             {chartData.map((data, idx) => (
               <div key={idx} className="flex flex-col items-center gap-2 flex-1 group">
                 <div className="relative w-full flex justify-end flex-col items-center h-full">
                    <div className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full whitespace-nowrap bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 px-2 py-1 rounded z-10 pointer-events-none">
                      {data.value} tasks ({data.label})
                    </div>
                    <div 
                      className={`w-full max-w-[40px] rounded-t-md transition-all duration-700 ease-out relative overflow-hidden ${
                        // @ts-ignore
                        data.color || (idx === 6 ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-indigo-300 dark:bg-indigo-800/60 group-hover:bg-indigo-400 dark:group-hover:bg-indigo-600')
                      }`}
                      style={{ height: data.value === 0 ? '4px' : data.height }}
                    >
                       <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    </div>
                 </div>
                 <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">{data.label}</span>
               </div>
             ))}
          </div>
        </div>

        {/* Status Distribution Pie/Donut Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
            <h3 className="font-bold text-slate-700 dark:text-white mb-4 flex items-center gap-2">
               <PieChart size={18} className="text-slate-400" />
               Status Distribution
            </h3>
            
            <div className="flex-1 flex flex-col items-center justify-center">
              {currentMetrics.total === 0 ? (
                <div className="text-center text-slate-400 dark:text-slate-500 my-8">No data available</div>
              ) : (
                <div className="flex flex-col items-center gap-6 w-full">
                   {/* SVG Donut */}
                   <div className="relative w-40 h-40 group">
                      <svg viewBox="0 0 42 42" className="w-full h-full transform -rotate-90">
                        {/* Background Circle */}
                        <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="currentColor" strokeWidth="5" className="text-slate-100 dark:text-slate-800"></circle>
                        {/* Segments */}
                        {donutSegments.map((segment, i) => (
                          <circle 
                            key={i}
                            cx="21" cy="21" r="15.91549430918954" 
                            fill="transparent" 
                            stroke={segment.color} 
                            strokeWidth="5"
                            strokeDasharray={segment.dashArray}
                            strokeDashoffset={segment.dashOffset}
                            className="transition-all duration-1000 ease-out hover:opacity-80"
                          >
                             <title>{segment.label}: {segment.value}</title>
                          </circle>
                        ))}
                      </svg>
                      {/* Center Text */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                         <span className="text-3xl font-bold text-slate-800 dark:text-white">{currentMetrics.total}</span>
                         <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wide">Total</span>
                      </div>
                   </div>
                   
                   {/* Legend */}
                   <div className="w-full space-y-2">
                      {donutData.map((d, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                           <div className="flex items-center gap-2">
                             <span className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: d.color}}></span>
                             <span className="text-slate-600 dark:text-slate-300 font-medium">{d.label}</span>
                           </div>
                           <div className="flex items-center gap-3">
                              <span className="font-bold text-slate-700 dark:text-slate-200">{d.value}</span>
                              <span className="text-slate-400 w-8 text-right">{Math.round((d.value/currentMetrics.total)*100)}%</span>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              )}
            </div>
        </div>

        {/* Suggestions / Insights Panel */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
           <h3 className="font-bold text-slate-700 dark:text-white mb-4 flex items-center gap-2">
             <CheckCircle2 size={18} className="text-slate-400" />
             AI Insights & Improvements
           </h3>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {getSuggestions().length > 0 ? (
               getSuggestions().map((sugg, i) => (
                 <div key={i} className={`p-4 rounded-lg border-l-4 transition-all hover:translate-x-1 ${
                   sugg.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 border-green-500' : 
                   sugg.type === 'warning' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-500' : 
                   sugg.type === 'alert' ? 'bg-red-50 dark:bg-red-900/20 border-red-500' : 
                   'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                 }`}>
                   <h4 className={`text-sm font-bold mb-1 ${
                     sugg.type === 'success' ? 'text-green-800 dark:text-green-300' : 
                     sugg.type === 'warning' ? 'text-orange-800 dark:text-orange-300' : 
                     sugg.type === 'alert' ? 'text-red-800 dark:text-red-300' : 
                     'text-blue-800 dark:text-blue-300'
                   }`}>{sugg.title}</h4>
                   <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{sugg.text}</p>
                 </div>
               ))
             ) : (
                <div className="col-span-3 text-center text-slate-400 dark:text-slate-500 py-10 text-sm">
                  Add more tasks to generate smart insights.
                </div>
             )}
           </div>

           <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
             <button 
               onClick={() => setCurrentView(DashboardView.REPORTS)}
               className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
             >
               View Full Detailed Report <ArrowRight size={16} />
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};