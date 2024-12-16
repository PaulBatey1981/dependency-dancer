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
  // Find tasks that depend on this task (children)
  const childTasks = tasks.filter(t => t.dependencies.includes(task.id));
  if (childTasks.length === 0) return 0;
  return Math.max(...childTasks.map(child => getTaskLevel(child, tasks))) + 1;
};

export const getVerticalPosition = (
  task: Task,
  tasks: Task[],
  expandedItems: Set<string>,
  rowHeight: number,
  verticalOffset: number
): number => {
  console.log(`Calculating vertical position for task ${task.id}`);
  
  // Get all line items (top-level tasks)
  const lineItems = tasks.filter(t => t.type === 'lineitem');
  
  // For line items, position based on their order
  if (task.type === 'lineitem') {
    const index = lineItems.findIndex(t => t.id === task.id);
    const position = (index * rowHeight) + verticalOffset;
    console.log(`Line item ${task.id} positioned at ${position}px`);
    return position;
  }

  // Find the task that depends on this task (the parent)
  const parentTask = tasks.find(t => t.dependencies.includes(task.id));
  if (!parentTask) {
    console.log(`No parent found for task ${task.id}`);
    return -1;
  }

  if (!expandedItems.has(parentTask.id)) {
    console.log(`Parent ${parentTask.id} is not expanded, hiding task ${task.id}`);
    return -1;
  }

  // Get parent's position
  const parentPosition = getVerticalPosition(parentTask, tasks, expandedItems, rowHeight, verticalOffset);
  if (parentPosition < 0) {
    console.log(`Parent ${parentTask.id} is hidden, hiding task ${task.id}`);
    return -1;
  }

  // Get all tasks that this parent depends on (siblings)
  const siblings = tasks.filter(t => parentTask.dependencies.includes(t.id));
  const index = siblings.findIndex(t => t.id === task.id);

  // Position based on parent's position and sibling order
  const position = parentPosition + ((index + 1) * rowHeight);
  console.log(`Task ${task.id} positioned at ${position}px (parent: ${parentTask.id}, index: ${index})`);
  
  return position;
};

export const getGridLines = (viewMode: 'day' | 'week' | 'month') => {
  const intervals = viewMode === 'day' ? 24 : viewMode === 'week' ? 7 : 30;
  return Array.from({ length: intervals }).map((_, i) => {
    const position = (i / intervals) * 100;
    return position;
  });
};