import React, { useState } from 'react';
import { Meeting } from '../types';
import { Plus, Video, Trash2, Calendar, Clock, Link as LinkIcon, X, Edit2, CalendarDays, ArrowRight } from 'lucide-react';

interface MeetingCardProps {
  meeting: Meeting;
  isToday?: boolean;
  onEdit: (meeting: Meeting) => void;
  onDelete: (id: string) => void;
}

const MeetingCard: React.FC<MeetingCardProps> = ({ meeting, isToday = false, onEdit, onDelete }) => (
  <div className={`p-5 rounded-xl border transition-all hover:shadow-md group flex justify-between items-start ${
    isToday 
    ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/20' 
    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700'
  }`}>
     <div className="flex items-start gap-4">
        <div className={`p-3 rounded-lg ${
          isToday 
          ? 'bg-white/20 text-white' 
          : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
        }`}>
          <Video size={24} />
        </div>
        <div>
          <h4 className={`font-bold text-lg ${isToday ? 'text-white' : 'text-slate-800 dark:text-white'}`}>{meeting.title}</h4>
          <div className={`flex items-center gap-4 text-sm mt-1 ${isToday ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>
            <span className="flex items-center gap-1"><Calendar size={14}/> {meeting.date}</span>
            <span className="flex items-center gap-1"><Clock size={14}/> {meeting.time}</span>
          </div>
          <div className={`mt-3 text-sm inline-block px-2 py-1 rounded border ${
            isToday 
            ? 'bg-blue-700 border-blue-500 text-blue-50' 
            : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300'
          }`}>
             <span className="font-semibold">{meeting.platform}</span>
             {meeting.description && <span> - {meeting.description}</span>}
          </div>
        </div>
     </div>
     
     <div className={`flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity ${isToday ? 'text-white' : 'text-slate-400'}`}>
       <button onClick={() => onEdit(meeting)} className={`hover:scale-110 transition-transform ${isToday ? 'hover:text-blue-200' : 'hover:text-indigo-500'}`}>
          <Edit2 size={18} />
       </button>
       <button onClick={() => onDelete(meeting.id)} className={`hover:scale-110 transition-transform ${isToday ? 'hover:text-red-200' : 'hover:text-red-500'}`}>
         <Trash2 size={18} />
       </button>
     </div>
  </div>
);

interface MeetingsBoardProps {
  meetings: Meeting[];
  setMeetings: React.Dispatch<React.SetStateAction<Meeting[]>>;
}

export const MeetingsBoard: React.FC<MeetingsBoardProps> = ({ meetings, setMeetings }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentMeeting, setCurrentMeeting] = useState<Meeting>({
    id: '',
    title: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    description: '',
    platform: 'Zoom'
  });

  const handleOpenModal = (meeting?: Meeting) => {
    if (meeting) {
      setCurrentMeeting(meeting);
      setIsEditing(true);
    } else {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      
      setCurrentMeeting({
        id: '',
        title: '',
        date: `${year}-${month}-${day}`,
        time: '09:00',
        description: '',
        platform: 'Zoom'
      });
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const handleSaveMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      setMeetings(meetings.map(m => m.id === currentMeeting.id ? currentMeeting : m).sort((a, b) => 
        new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime()
      ));
    } else {
      const newMeeting = { ...currentMeeting, id: crypto.randomUUID() };
      setMeetings([...meetings, newMeeting].sort((a, b) => 
        new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime()
      ));
    }
    setIsModalOpen(false);
  };

  const handleDeleteMeeting = (id: string) => {
    if (confirm('Delete this meeting?')) {
      setMeetings(meetings.filter(m => m.id !== id));
    }
  };

  // Determine Today's date string in local time YYYY-MM-DD
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;

  // Categorize Meetings
  const todayMeetings = meetings.filter(m => m.date === todayStr);
  const upcomingMeetings = meetings.filter(m => m.date > todayStr);
  const pastMeetings = meetings.filter(m => m.date < todayStr).reverse(); // Show most recent past first

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
        <div>
           <h2 className="text-xl font-bold text-slate-800 dark:text-white">Schedules & Meetings</h2>
           <p className="text-slate-500 dark:text-slate-400 text-sm">Organize your daily standups and client calls</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm shadow-indigo-200 dark:shadow-indigo-900/30"
        >
          <Plus size={18} />
          Schedule Meeting
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Today & Upcoming */}
        <div className="lg:col-span-8 space-y-8">
            
            {/* Today's Section */}
            <div className="space-y-4">
               <div className="flex items-center gap-2 mb-2">
                 <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
                 <h3 className="text-xl font-bold text-slate-800 dark:text-white">Today's Schedule</h3>
                 <span className="text-sm font-medium text-slate-400 ml-2">{new Date().toLocaleDateString(undefined, {weekday: 'long', month: 'long', day: 'numeric'})}</span>
               </div>
               
               {todayMeetings.length === 0 ? (
                 <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-slate-400 dark:text-slate-500">
                    <CalendarDays size={48} className="mx-auto mb-3 opacity-20" />
                    <p>No meetings scheduled for today.</p>
                 </div>
               ) : (
                 <div className="space-y-4">
                    {todayMeetings.map(meeting => (
                       <MeetingCard key={meeting.id} meeting={meeting} isToday={true} onEdit={handleOpenModal} onDelete={handleDeleteMeeting} />
                    ))}
                 </div>
               )}
            </div>

            {/* Upcoming Section */}
            <div className="space-y-4 pt-4">
               <div className="flex items-center gap-2 mb-2">
                 <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                   Upcoming <ArrowRight size={16} className="text-slate-400" />
                 </h3>
               </div>

               {upcomingMeetings.length === 0 ? (
                 <div className="text-slate-400 dark:text-slate-600 text-sm italic pl-4">No upcoming meetings.</div>
               ) : (
                 <div className="space-y-3">
                    {upcomingMeetings.map(meeting => (
                       <MeetingCard key={meeting.id} meeting={meeting} onEdit={handleOpenModal} onDelete={handleDeleteMeeting} />
                    ))}
                 </div>
               )}
            </div>

        </div>

        {/* Right Column: Past History */}
        <div className="lg:col-span-4 space-y-4">
            <h3 className="font-bold text-slate-500 dark:text-slate-400 text-sm uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-2">
               Past Meetings
            </h3>
            
            <div className="space-y-3">
               {pastMeetings.length === 0 ? (
                  <div className="text-slate-400 text-sm py-4">No history available.</div>
               ) : (
                  pastMeetings.map(meeting => (
                    <div key={meeting.id} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 opacity-70 hover:opacity-100 transition-all group">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-slate-700 dark:text-slate-300 text-sm line-clamp-1">{meeting.title}</h4>
                          <div className="text-xs text-slate-500 dark:text-slate-500 mt-1 flex flex-col gap-0.5">
                            <span>{meeting.date} at {meeting.time}</span>
                            <span className="italic">{meeting.platform}</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleOpenModal(meeting)} className="text-slate-400 hover:text-blue-500">
                              <Edit2 size={14} />
                            </button>
                            <button onClick={() => handleDeleteMeeting(meeting.id)} className="text-slate-400 hover:text-red-500">
                              <Trash2 size={14} />
                            </button>
                        </div>
                      </div>
                    </div>
                  ))
               )}
            </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in duration-200 border border-slate-200 dark:border-slate-800">
             <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                {isEditing ? 'Edit Meeting' : 'Schedule Meeting'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveMeeting} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
                <input required type="text" value={currentMeeting.title} onChange={e => setCurrentMeeting({...currentMeeting, title: e.target.value})} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white" placeholder="e.g. Weekly Sync" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
                   <input required type="date" value={currentMeeting.date} onChange={e => setCurrentMeeting({...currentMeeting, date: e.target.value})} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white" />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Time</label>
                   <input required type="time" value={currentMeeting.time} onChange={e => setCurrentMeeting({...currentMeeting, time: e.target.value})} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Platform / Location</label>
                <input required type="text" value={currentMeeting.platform} onChange={e => setCurrentMeeting({...currentMeeting, platform: e.target.value})} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white" placeholder="e.g. Zoom, Google Meet" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description / Link</label>
                <textarea rows={2} value={currentMeeting.description} onChange={e => setCurrentMeeting({...currentMeeting, description: e.target.value})} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 resize-none dark:text-white" placeholder="Meeting link or agenda..." />
              </div>
              <button type="submit" className="w-full py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 mt-2 transition-colors shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30">
                {isEditing ? 'Save Changes' : 'Schedule Meeting'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};