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
  // If this task has no dependencies, it's at level 0
  if (task.dependencies.length === 0) return 0;
  
  // Get all parent tasks (tasks that this task depends on)
  const parentTasks = tasks.filter(t => task.dependencies.includes(t.id));
  if (parentTasks.length === 0) return 0;
  
  // Return the maximum level of any parent plus 1
  return Math.max(...parentTasks.map(parent => getTaskLevel(parent, tasks))) + 1;
};

export const getVerticalPosition = (
  task: Task,
  tasks: Task[],
  expandedItems: Set<string>,
  rowHeight: number,
  verticalOffset: number
): number => {
  console.log(`Calculating vertical position for task ${task.id}`);
  
  // For line items, position based on their order
  if (task.type === 'lineitem') {
    const lineItems = tasks.filter(t => t.type === 'lineitem');
    const index = lineItems.findIndex(t => t.id === task.id);
    const position = (index * rowHeight) + verticalOffset;
    console.log(`Line item ${task.id} positioned at ${position}px`);
    return position;
  }

  // Find the tasks that this task depends on (parents)
  const parentTasks = task.dependencies.map(depId => tasks.find(t => t.id === depId)).filter(Boolean) as Task[];
  
  // If no parents are found, hide the task
  if (parentTasks.length === 0) {
    console.log(`No parents found for task ${task.id}`);
    return -1;
  }

  // Check if any parent is expanded
  const anyParentExpanded = parentTasks.some(parent => expandedItems.has(parent.id));
  if (!anyParentExpanded) {
    console.log(`No parent is expanded for task ${task.id}, hiding it`);
    return -1;
  }

  // Get the first expanded parent's position
  const expandedParent = parentTasks.find(parent => expandedItems.has(parent.id));
  if (!expandedParent) {
    return -1;
  }

  const parentPosition = getVerticalPosition(expandedParent, tasks, expandedItems, rowHeight, verticalOffset);
  if (parentPosition < 0) {
    console.log(`Parent ${expandedParent.id} is hidden, hiding task ${task.id}`);
    return -1;
  }

  // Get all siblings (tasks that share the same parent)
  const siblings = tasks.filter(t => expandedParent.dependencies.includes(t.id));
  const index = siblings.findIndex(t => t.id === task.id);

  // Position based on parent's position and sibling order
  const position = parentPosition + ((index + 1) * rowHeight);
  console.log(`Task ${task.id} positioned at ${position}px (parent: ${expandedParent.id}, index: ${index})`);
  
  return position;
};

export const getGridLines = (viewMode: 'day' | 'week' | 'month') => {
  const intervals = viewMode === 'day' ? 24 : viewMode === 'week' ? 7 : 30;
  return Array.from({ length: intervals }).map((_, i) => {
    const position = (i / intervals) * 100;
    return position;
  });
};