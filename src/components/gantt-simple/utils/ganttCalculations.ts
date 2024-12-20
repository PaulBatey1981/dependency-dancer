import { SimpleTask } from '../types';

export const getTimeRange = (tasks: SimpleTask[]) => {
  const earliestStart = new Date(Math.min(
    ...tasks
      .filter(t => t.startTime)
      .map(t => t.startTime.getTime())
  ));

  const latestEnd = new Date(Math.max(
    ...tasks
      .filter(t => t.startTime)
      .map(t => t.startTime.getTime() + t.duration * 3600000)
  ));

  return { earliestStart, latestEnd };
};

export const getHoursForViewMode = (
  earliestStart: Date,
  latestEnd: Date,
  viewMode: 'day' | 'week' | 'month',
  MIN_HOURS_DISPLAY: number
) => {
  const totalTaskHours = Math.ceil((latestEnd.getTime() - earliestStart.getTime()) / (1000 * 60 * 60));
  console.log('Total task hours:', totalTaskHours);
  
  switch (viewMode) {
    case 'week':
      return Math.max(totalTaskHours, 24 * 7);
    case 'month':
      return Math.max(totalTaskHours, 24 * 30);
    case 'day':
    default:
      return Math.max(totalTaskHours, MIN_HOURS_DISPLAY);
  }
};

export const generateHourMarkers = (
  earliestStart: Date,
  totalHours: number,
  viewMode: 'day' | 'week' | 'month'
) => {
  const markers = [];
  const intervalHours = viewMode === 'month' ? 24 : viewMode === 'week' ? 12 : 1;
  
  for (let i = 0; i <= totalHours; i += intervalHours) {
    const markerTime = new Date(earliestStart.getTime() + i * 60 * 60 * 1000);
    const position = (i / totalHours) * 100;
    markers.push({ position, time: markerTime });
  }
  
  return markers;
};