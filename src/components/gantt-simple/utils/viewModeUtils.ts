import { startOfDay, startOfWeek, startOfMonth } from 'date-fns';

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