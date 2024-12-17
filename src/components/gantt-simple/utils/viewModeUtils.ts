import { startOfDay, startOfWeek, startOfMonth } from 'date-fns';
import { SimpleTask } from '../types';

export type ViewMode = 'day' | 'week' | 'month';

interface ViewConfig {
  pixelsPerUnit: number;  // pixels per hour/day/week depending on view
  unitsInView: number;    // number of units to show in view
  getStart: (date: Date) => Date;
}

const VIEW_CONFIGS: Record<ViewMode, ViewConfig> = {
  day: {
    pixelsPerUnit: 100,    // 100px per hour
    unitsInView: 24,       // 24 hours
    getStart: startOfDay
  },
  week: {
    pixelsPerUnit: 200,    // 200px per day
    unitsInView: 7,        // 7 days
    getStart: startOfWeek
  },
  month: {
    pixelsPerUnit: 300,    // 300px per week
    unitsInView: 4,        // ~4 weeks
    getStart: startOfMonth
  }
};

export const getTimelineConfig = (viewMode: ViewMode): ViewConfig => {
  return VIEW_CONFIGS[viewMode];
};

export const calculateTaskPosition = (task: SimpleTask, viewStart: Date, viewMode: ViewMode): number => {
  console.log('Calculating position for task:', task.id);
  const config = getTimelineConfig(viewMode);
  
  // Calculate milliseconds from view start to task start
  const msFromStart = task.startTime.getTime() - viewStart.getTime();
  
  // Convert to hours/days/weeks based on view mode
  let units;
  switch (viewMode) {
    case 'day':
      units = msFromStart / (1000 * 60 * 60); // Convert to hours
      break;
    case 'week':
      units = msFromStart / (1000 * 60 * 60 * 24); // Convert to days
      break;
    case 'month':
      units = msFromStart / (1000 * 60 * 60 * 24 * 7); // Convert to weeks
      break;
  }
  
  console.log(`Task ${task.id} position: ${units * config.pixelsPerUnit}px`);
  return units * config.pixelsPerUnit;
};

export const calculateTaskWidth = (duration: number, viewMode: ViewMode): number => {
  const config = getTimelineConfig(viewMode);
  let units;
  
  switch (viewMode) {
    case 'day':
      units = duration; // Duration is in hours
      break;
    case 'week':
      units = duration / 24; // Convert hours to days
      break;
    case 'month':
      units = duration / (24 * 7); // Convert hours to weeks
      break;
  }
  
  return units * config.pixelsPerUnit;
};