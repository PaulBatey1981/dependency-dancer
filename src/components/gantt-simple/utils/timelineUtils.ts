import { SimpleTask } from '../types';

export const calculateTimelineWidth = (
  totalHours: number, 
  hourWidth: number, 
  zoom: number
) => {
  return totalHours * hourWidth * zoom;
};

export const calculateTaskPosition = (
  task: SimpleTask,
  earliestStart: Date,
  totalHours: number
) => {
  const hoursFromStart = (task.startTime.getTime() - earliestStart.getTime()) / (1000 * 60 * 60);
  return (hoursFromStart / totalHours) * 100;
};

export const calculateTaskWidth = (
  duration: number,
  totalHours: number
) => {
  return (duration / totalHours) * 100;
};

export const getTimeRange = (tasks: SimpleTask[]) => {
  const earliestStart = new Date(Math.min(...tasks.map(t => t.startTime.getTime())));
  const latestEnd = new Date(Math.max(
    ...tasks.map(t => t.startTime.getTime() + t.duration * 3600000)
  ));
  return { earliestStart, latestEnd };
};