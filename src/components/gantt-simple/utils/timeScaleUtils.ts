import { SimpleTask } from '../types';

export const MIN_HOURS_DISPLAY = 3; // Minimum 3 hours view
export const MAX_HOURS_DISPLAY = 24 * 30; // Maximum 1 month view
export const BASE_HOUR_WIDTH = 50; // Base width for 1 hour at zoom level 1

export const calculateTimelineWidth = (
  totalHours: number,
  hourWidth: number,
  zoom: number
): number => {
  // Adjust the total hours based on zoom level
  const adjustedHours = Math.min(
    Math.max(totalHours / zoom, MIN_HOURS_DISPLAY),
    MAX_HOURS_DISPLAY
  );
  
  console.log('Calculating timeline width:', {
    totalHours,
    zoom,
    adjustedHours,
    result: adjustedHours * hourWidth * zoom
  });
  
  return adjustedHours * hourWidth * zoom;
};

export const getHourMarkers = (
  startDate: Date,
  totalHours: number,
  zoom: number
): { position: number; time: Date }[] => {
  const adjustedHours = Math.min(
    Math.max(totalHours / zoom, MIN_HOURS_DISPLAY),
    MAX_HOURS_DISPLAY
  );
  
  return Array.from({ length: Math.ceil(adjustedHours * zoom) + 1 }).map((_, index) => {
    const markerTime = new Date(startDate.getTime() + (index / zoom) * 60 * 60 * 1000);
    const position = (index / (adjustedHours * zoom)) * 100;
    return { position, time: markerTime };
  });
};

export const getTimeRange = (tasks: SimpleTask[]) => {
  const tasksWithStartTime = tasks.filter(t => t.startTime);
  if (tasksWithStartTime.length === 0) {
    const now = new Date();
    return {
      earliestStart: now,
      latestEnd: new Date(now.getTime() + MIN_HOURS_DISPLAY * 60 * 60 * 1000)
    };
  }

  const earliestStart = new Date(Math.min(...tasksWithStartTime.map(t => t.startTime.getTime())));
  const latestEnd = new Date(Math.max(
    ...tasksWithStartTime.map(t => t.startTime.getTime() + t.duration * 3600000)
  ));

  console.log('Time range calculated:', {
    earliestStart: earliestStart.toISOString(),
    latestEnd: latestEnd.toISOString()
  });

  return { earliestStart, latestEnd };
};