import React, { useState, useEffect, useRef } from 'react';
import { Layout } from './components/Layout';
import { CalendarBoard } from './components/CalendarBoard';
import { TaskBoard } from './components/TaskBoard';
import { HistoryBoard } from './components/HistoryBoard';
import { NotesBoard } from './components/NotesBoard';
import { ReportsBoard } from './components/ReportsBoard';
import { MeetingsBoard } from './components/MeetingsBoard';
import { AnalyticsBoard } from './components/AnalyticsBoard';
import { GameDashboard } from './components/GameDashboard';
import { GamePopup } from './components/GamePopup';
import { AuthScreen } from './components/AuthScreen';
import { DashboardView, Task, Note, TaskStatus, Meeting, AppNotification, NoteFolder, BrainGame, GameSettings, GameScore, User, Theme } from './types';

// Initial Mock Data
const MOCK_TASKS: Task[] = [
  { id: '1', title: 'Project Kickoff', description: 'Initial meeting with stakeholders', location: 'Conference Room A', date: new Date().toISOString().split('T')[0], status: TaskStatus.DONE, remarks: 'Went well', reminder: false, createdAt: Date.now() },
  { id: '2', title: 'Submit Budget', description: 'Q4 Financial planning', location: 'Finance Dept', date: new Date(Date.now() + 86400000).toISOString().split('T')[0], status: TaskStatus.ON_GOING, remarks: 'Waiting for approval', reminder: true, createdAt: Date.now() },
  { id: '3', title: 'Client Review', description: 'Review designs with client', location: 'Online / Zoom', date: new Date(Date.now() + 172800000).toISOString().split('T')[0], status: TaskStatus.PENDING, remarks: '', reminder: false, createdAt: Date.now() }
];

const MOCK_FOLDERS: NoteFolder[] = [
  { id: '1', name: 'Personal', color: 'bg-rose-500' },
  { id: '2', name: 'Work', color: 'bg-blue-500' },
  { id: '3', name: 'Ideas', color: 'bg-amber-500' }
];

const MOCK_NOTES: Note[] = [
  { id: '1', title: 'Meeting Ideas', content: 'Discuss timeline extension and budget constraints.', updatedAt: Date.now(), folderId: '2' }
];

const MOCK_MEETINGS: Meeting[] = [
  { id: '1', title: 'Team Standup', date: new Date().toISOString().split('T')[0], time: '10:00', description: 'Daily sync', platform: 'Google Meet' }
];

const MOCK_GAMES: BrainGame[] = [
  { id: '1', title: 'Quick Stretch', type: 'EXERCISE', durationSeconds: 60, instructions: 'Stand up and touch your toes. Hold for 10 seconds, repeat.', active: true, frequency: 'RANDOM' },
  { id: '2', title: 'Box Breathing', type: 'BREATHING', durationSeconds: 45, instructions: 'Inhale for 4s, hold for 4s, exhale for 4s, hold for 4s.', active: true, frequency: 'RANDOM' },
  { id: '3', title: 'Mental Math', type: 'MATH', durationSeconds: 30, instructions: 'Solve the problem as fast as you can.', active: true, frequency: 'RANDOM' },
  { id: '4', title: 'Reflex Test', type: 'REFLEX', durationSeconds: 20, instructions: 'Click the red button 5 times as it moves around.', active: true, frequency: 'RANDOM' },
  { id: '5', title: 'Digit Span', type: 'MEMORY', durationSeconds: 30, instructions: 'Memorize the 6-digit number shown, then type it in.', active: true, frequency: 'RANDOM' },
  { id: '6', title: 'Word Scramble', type: 'PUZZLE', durationSeconds: 45, instructions: 'Unscramble the productivity-related word.', active: true, frequency: 'RANDOM' },
];

const App: React.FC = () => {
  // Theme State
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('omniTheme') as Theme) || 'system';
  });

  // Auth State
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('omniUser');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentView, setCurrentView] = useState<DashboardView>(DashboardView.ANALYTICS);
  
  // State with LocalStorage Persistence
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('omniTasks');
    return saved ? JSON.parse(saved) : MOCK_TASKS;
  });

  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('omniNotes');
    return saved ? JSON.parse(saved) : MOCK_NOTES;
  });

  const [folders, setFolders] = useState<NoteFolder[]>(() => {
    const saved = localStorage.getItem('omniNoteFolders');
    return saved ? JSON.parse(saved) : MOCK_FOLDERS;
  });

  const [meetings, setMeetings] = useState<Meeting[]>(() => {
     const saved = localStorage.getItem('omniMeetings');
     return saved ? JSON.parse(saved) : MOCK_MEETINGS;
  });

  const [games, setGames] = useState<BrainGame[]>(() => {
    const saved = localStorage.getItem('omniGames');
    return saved ? JSON.parse(saved) : MOCK_GAMES;
  });

  const [gameSettings, setGameSettings] = useState<GameSettings>(() => {
    const saved = localStorage.getItem('omniGameSettings');
    return saved ? JSON.parse(saved) : { enabled: true, minIntervalMinutes: 30, maxIntervalMinutes: 120, gamesPerDay: 2, volume: 1 };
  });

  const [scores, setScores] = useState<GameScore[]>(() => {
    const saved = localStorage.getItem('omniGameScores');
    return saved ? JSON.parse(saved) : [];
  });

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [activeGamePopup, setActiveGamePopup] = useState<BrainGame | null>(null);

  // Refs
  const tasksRef = useRef(tasks);
  const notificationsRef = useRef(notifications);
  const gamesRef = useRef(games);
  const gameSettingsRef = useRef(gameSettings);
  const userRef = useRef(user);

  // Theme Handling Effect
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
    localStorage.setItem('omniTheme', theme);
  }, [theme]);

  // Persist Data Effects
  useEffect(() => {
    if (user) {
      localStorage.setItem('omniUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('omniUser');
    }
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    localStorage.setItem('omniTasks', JSON.stringify(tasks));
    tasksRef.current = tasks;
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('omniNotes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('omniNoteFolders', JSON.stringify(folders));
  }, [folders]);

  useEffect(() => {
    localStorage.setItem('omniMeetings', JSON.stringify(meetings));
  }, [meetings]);

  useEffect(() => {
    localStorage.setItem('omniGames', JSON.stringify(games));
    gamesRef.current = games;
  }, [games]);

  useEffect(() => {
    localStorage.setItem('omniGameSettings', JSON.stringify(gameSettings));
    gameSettingsRef.current = gameSettings;
  }, [gameSettings]);

  useEffect(() => {
    localStorage.setItem('omniGameScores', JSON.stringify(scores));
  }, [scores]);
  
  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  // Notifications and Game Logic
  useEffect(() => {
    if (!user) return;

    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }

    const checkReminders = () => {
      const currentTasks = tasksRef.current;
      const currentNotifs = notificationsRef.current;
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];

      const dueTasks = currentTasks.filter(t => 
        t.date === todayStr && 
        t.reminder && 
        (t.status === TaskStatus.PENDING || t.status === TaskStatus.ON_GOING)
      );

      if (dueTasks.length > 0) {
        if ('Notification' in window && Notification.permission === 'granted') {
           new Notification("OmniTask Reminder", {
             body: `Check your dashboard. ${dueTasks.length} tasks pending.`,
             tag: 'omnitask-daily-reminder'
           });
        }

        const newNotifs: AppNotification[] = [];
        dueTasks.forEach(task => {
           const alreadyNotified = currentNotifs.some(n => n.title === `Reminder: ${task.title}` && new Date(n.time).toDateString() === todayStr);
           if (!alreadyNotified) {
              newNotifs.push({
                id: crypto.randomUUID(),
                title: `Reminder: ${task.title}`,
                message: `This task is due today. Status: ${task.status}`,
                time: Date.now(),
                read: false
              });
           }
        });

        if (newNotifs.length > 0) {
           setNotifications(prev => [...newNotifs, ...prev]);
        }
      }
    };

    const checkGameTrigger = () => {
       const settings = gameSettingsRef.current;
       if (!userRef.current) return;
       if (!settings.enabled || activeGamePopup) return;

       const availableGames = gamesRef.current.filter(g => g.active);
       if (availableGames.length === 0) return;

       const chance = Math.random();
       if (chance < 0.02) { 
          const randomGame = availableGames[Math.floor(Math.random() * availableGames.length)];
          setActiveGamePopup(randomGame);
       }
    };

    const initialCheck = setTimeout(checkReminders, 3000);
    const interval = setInterval(checkReminders, 60 * 60 * 1000);
    const gameInterval = setInterval(checkGameTrigger, 30 * 1000);

    return () => {
      clearTimeout(initialCheck);
      clearInterval(interval);
      clearInterval(gameInterval);
    };
  }, [user]);

  const markNotificationsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleGameComplete = (result: { completed: boolean; score: number }) => {
    if (result.completed && activeGamePopup) {
       const newScore: GameScore = {
         id: crypto.randomUUID(),
         gameTitle: activeGamePopup.title,
         type: activeGamePopup.type,
         score: result.score,
         date: Date.now()
       };
       setScores(prev => [newScore, ...prev]);
    }
    setActiveGamePopup(null);
  };

  const triggerGameManually = () => {
     const availableGames = games.filter(g => g.active);
     if (availableGames.length > 0) {
        const randomGame = availableGames[Math.floor(Math.random() * availableGames.length)];
        setActiveGamePopup(randomGame);
     } else {
        alert("No active games enabled. Enable some in the settings!");
     }
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    setActiveGamePopup(null);
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const renderView = () => {
    switch (currentView) {
      case DashboardView.ANALYTICS:
        return <AnalyticsBoard tasks={tasks} setCurrentView={setCurrentView} />;
      case DashboardView.CALENDAR:
        return <CalendarBoard tasks={tasks} setCurrentView={setCurrentView} />;
      case DashboardView.TASKS:
        return <TaskBoard tasks={tasks} setTasks={setTasks} setCurrentView={setCurrentView} />;
      case DashboardView.MEETINGS:
        return <MeetingsBoard meetings={meetings} setMeetings={setMeetings} />;
      case DashboardView.GAMES:
        return <GameDashboard games={games} setGames={setGames} settings={gameSettings} setSettings={setGameSettings} triggerGameNow={triggerGameManually} scores={scores} />;
      case DashboardView.HISTORY:
        return <HistoryBoard tasks={tasks} />;
      case DashboardView.NOTES:
        return <NotesBoard notes={notes} setNotes={setNotes} folders={folders} setFolders={setFolders} />;
      case DashboardView.REPORTS:
        return <ReportsBoard tasks={tasks} />;
      default:
        return <TaskBoard tasks={tasks} setTasks={setTasks} setCurrentView={setCurrentView} />;
    }
  };

  if (!user) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return (
    <Layout 
      currentView={currentView} 
      setCurrentView={setCurrentView}
      notifications={notifications}
      markNotificationsRead={markNotificationsRead}
      user={user}
      onLogout={handleLogout}
      onUpdateUser={handleUpdateUser}
      theme={theme}
      setTheme={setTheme}
    >
      {renderView()}
      {activeGamePopup && (
         <GamePopup game={activeGamePopup} onClose={handleGameComplete} />
      )}
    </Layout>
  );
};

export default App;