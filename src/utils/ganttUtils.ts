import { Task } from '@/types/scheduling';

export const getTimeScale = (viewMode: 'day' | 'week' | 'month') => {
  switch (viewMode) {
    case 'day':
      return 24;
    case 'week':
      return 24 * 7;
    case 'month':
      return 24 * 30;
    default:
      return 24;
  }
};

export const calculateTaskPosition = (startTime: Date, earliestStart: Date, timeScale: number) => {
  const hoursFromStart = (startTime.getTime() - earliestStart.getTime()) / (1000 * 60 * 60);
  const position = (hoursFromStart / timeScale) * 100;
  return position;
};

export const calculateTaskWidth = (duration: number, timeScale: number) => {
  const width = (duration / timeScale) * 100;
  return width;
};

export const getTaskLevel = (task: Task, tasks: Task[]): number => {
  const parentTask = tasks.find(t => t.dependencies.includes(task.id));
  if (!parentTask) return 0;
  return getTaskLevel(parentTask, tasks) + 1;
};

export const getVerticalPosition = (
  task: Task,
  tasks: Task[],
  expandedItems: Set<string>,
  rowHeight: number,
  verticalOffset: number
): number => {
  let position = 0;
  const lineItems = tasks.filter(t => t.type === 'lineitem');
  
  if (task.type === 'lineitem') {
    const index = lineItems.findIndex(t => t.id === task.id);
    return (index * rowHeight) + verticalOffset;
  }

  const parentTask = tasks.find(t => t.dependencies.includes(task.id));
  if (!parentTask || !expandedItems.has(parentTask.id)) return -1;

  const parentPosition = getVerticalPosition(parentTask, tasks, expandedItems, rowHeight, verticalOffset);
  if (parentPosition < 0) return -1;

  const siblings = tasks.filter(t => parentTask.dependencies.includes(t.id));
  const index = siblings.findIndex(t => t.id === task.id);

  position = parentPosition + ((index + 1) * rowHeight);

  return position;
};

export const getGridLines = (viewMode: 'day' | 'week' | 'month') => {
  const intervals = viewMode === 'day' ? 24 : viewMode === 'week' ? 7 : 30;
  return Array.from({ length: intervals }).map((_, i) => {
    const position = (i / intervals) * 100;
    return position;
  });
};