export enum TaskStatus {
  PENDING = 'PENDING',
  ON_GOING = 'ON-GOING',
  DONE = 'DONE',
  CANCELED = 'CANCELED',
  TO_RESCHEDULE = 'TO RESCHEDULE'
}

export enum DashboardView {
  CALENDAR = 'CALENDAR',
  TASKS = 'TASKS',
  MEETINGS = 'MEETINGS',
  HISTORY = 'HISTORY',
  NOTES = 'NOTES',
  REPORTS = 'REPORTS',
  ANALYTICS = 'ANALYTICS',
  GAMES = 'GAMES'
}

export type Theme = 'light' | 'dark' | 'system';

export interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  location?: string;
  date: string; // ISO Date String YYYY-MM-DD
  status: TaskStatus;
  remarks: string;
  reminder: boolean;
  createdAt: number;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  description: string;
  platform: string;
}

export interface NoteFolder {
  id: string;
  name: string;
  color: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
  folderId?: string;
}

export interface CalendarDateState {
  currentDate: Date;
  viewMode: 'day' | 'month' | 'year';
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: number;
  read: boolean;
}

export type GameType = 'EXERCISE' | 'MATH' | 'BREATHING' | 'REFLEX' | 'MEMORY' | 'PUZZLE';

export interface BrainGame {
  id: string;
  title: string;
  type: GameType;
  durationSeconds: number;
  instructions: string;
  active: boolean;
  frequency: 'RANDOM' | 'SCHEDULED';
  scheduledTime?: string;
}

export interface GameSettings {
  enabled: boolean;
  minIntervalMinutes: number;
  maxIntervalMinutes: number;
  gamesPerDay: number;
  volume: number;
}

export interface GameScore {
  id: string;
  gameTitle: string;
  type: GameType;
  score: number;
  date: number;
}