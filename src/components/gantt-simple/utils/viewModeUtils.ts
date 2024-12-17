import { addDays, addWeeks, addMonths, startOfDay, startOfWeek, startOfMonth } from 'date-fns';
import { SimpleTask } from '../types';

export type ViewMode = 'day' | 'week' | 'month';

interface ViewConfig {
  pixelsPerUnit: number;  // pixels per hour/day/week depending on view
  unitsInView: number;    // number of units to show in view
  getStart: (date: Date) => Date;
  addUnit: (date: Date, amount: number) => Date;
}

const VIEW_CONFIGS: Record<ViewMode, ViewConfig> = {
  day: {
    pixelsPerUnit: 100,    // 100px per hour
    unitsInView: 24,       // 24 hours
    getStart: startOfDay,
    addUnit: (date, amount) => addDays(date, amount)
  },
  week: {
    pixelsPerUnit: 200,    // 200px per day
    unitsInView: 7,        // 7 days
    getStart: startOfWeek,
    addUnit: (date, amount) => addWeeks(date, amount)
  },
  month: {
    pixelsPerUnit: 300,    // 300px per week
    unitsInView: 4,        // ~4 weeks
    getStart: startOfMonth,
    addUnit: (date, amount) => addMonths(date, amount)
  }
};

export const getTimelineConfig = (viewMode: ViewMode) => {
  return VIEW_CONFIGS[viewMode];
};

export const calculateTaskPosition = (
  task: SimpleTask,
  viewStart: Date,
  viewMode: ViewMode
): { left: number; width: number } => {
  const config = VIEW_CONFIGS[viewMode];
  
  let left: number;
  let width: number;
  
  switch (viewMode) {
    case 'day':
      // Calculate hours from start of day
      const hoursFromStart = (task.startTime.getTime() - viewStart.getTime()) / (1000 * 60 * 60);
      left = hoursFromStart * config.pixelsPerUnit;
      width = task.duration * config.pixelsPerUnit;
      break;
      
    case 'week':
      // Calculate days from start of week
      const daysFromStart = (task.startTime.getTime() - viewStart.getTime()) / (1000 * 60 * 60 * 24);
      left = daysFromStart * config.pixelsPerUnit;
      width = (task.duration / 24) * config.pixelsPerUnit; // Convert hours to days
      break;
      
    case 'month':
      // Calculate weeks from start of month
      const weeksFromStart = (task.startTime.getTime() - viewStart.getTime()) / (1000 * 60 * 60 * 24 * 7);
      left = weeksFromStart * config.pixelsPerUnit;
      width = (task.duration / (24 * 7)) * config.pixelsPerUnit; // Convert hours to weeks
      break;
  }

  return { left, width };
};

export const getTimelineWidth = (viewMode: ViewMode): number => {
  const config = VIEW_CONFIGS[viewMode];
  return config.pixelsPerUnit * config.unitsInView;
};

export const getTimeMarkers = (viewStart: Date, viewMode: ViewMode) => {
  const config = VIEW_CONFIGS[viewMode];
  const markers = [];
  
  for (let i = 0; i <= config.unitsInView; i++) {
    const date = config.addUnit(viewStart, i);
    markers.push({
      date,
      position: i * config.pixelsPerUnit
    });
  }
  
  return markers;
};