import { TaskStatus } from './types';

export const STATUS_COLORS = {
  [TaskStatus.PENDING]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  [TaskStatus.ON_GOING]: 'bg-blue-100 text-blue-800 border-blue-200',
  [TaskStatus.DONE]: 'bg-green-100 text-green-800 border-green-200',
  [TaskStatus.CANCELED]: 'bg-red-100 text-red-800 border-red-200',
  [TaskStatus.TO_RESCHEDULE]: 'bg-orange-100 text-orange-800 border-orange-200',
};

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];