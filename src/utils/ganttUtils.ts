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
  // Get all line items (top-level tasks)
  const lineItems = tasks.filter(t => t.type === 'lineitem');
  let position = 0;

  // For line items, position based on their order
  if (task.type === 'lineitem') {
    const index = lineItems.findIndex(t => t.id === task.id);
    return (index * rowHeight) + verticalOffset;
  }

  // Find the parent task that has this task as a dependency
  const parentTask = tasks.find(t => t.dependencies.includes(task.id));
  if (!parentTask || !expandedItems.has(parentTask.id)) {
    return -1; // Hide if parent is not expanded
  }

  // Get parent's position
  const parentPosition = getVerticalPosition(parentTask, tasks, expandedItems, rowHeight, verticalOffset);
  if (parentPosition < 0) return -1;

  // Get all siblings (tasks that share the same parent)
  const siblings = tasks.filter(t => parentTask.dependencies.includes(t.id));
  const index = siblings.findIndex(t => t.id === task.id);

  // Position based on parent's position and sibling order
  position = parentPosition + ((index + 1) * rowHeight);

  console.log(`Calculated vertical position for task ${task.id}: ${position}px (parent: ${parentTask.id})`);
  return position;
};

export const getGridLines = (viewMode: 'day' | 'week' | 'month') => {
  const intervals = viewMode === 'day' ? 24 : viewMode === 'week' ? 7 : 30;
  return Array.from({ length: intervals }).map((_, i) => {
    const position = (i / intervals) * 100;
    return position;
  });
};