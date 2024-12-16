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

// Get tasks that this task depends on
const getParentTasks = (task: Task, tasks: Task[]): Task[] => {
  return tasks.filter(t => task.dependencies.includes(t.id));
};

// Get tasks that depend on this task
const getChildTasks = (task: Task, tasks: Task[]): Task[] => {
  return tasks.filter(t => t.dependencies.includes(task.id));
};

// Check if a task should be visible based on expansion state
const isTaskVisible = (task: Task, tasks: Task[], expandedItems: Set<string>): boolean => {
  if (task.type === 'lineitem') return true;

  // Find all parents up to the line item
  let currentTask = task;
  const parentChain: Task[] = [];
  
  while (currentTask && currentTask.type !== 'lineitem') {
    const parents = getParentTasks(currentTask, tasks);
    const parent = parents[0]; // Take first parent
    if (!parent) break;
    
    parentChain.push(parent);
    currentTask = parent;
  }

  // Check if all parents in the chain are expanded
  return parentChain.every(parent => expandedItems.has(parent.id));
};

export const getTaskLevel = (task: Task, tasks: Task[]): number => {
  if (task.type === 'lineitem') return 0;
  
  const parents = getParentTasks(task, tasks);
  if (parents.length === 0) return 0;
  
  return Math.max(...parents.map(parent => getTaskLevel(parent, tasks))) + 1;
};

export const getVerticalPosition = (
  task: Task,
  tasks: Task[],
  expandedItems: Set<string>,
  rowHeight: number,
  verticalOffset: number
): number => {
  console.log(`Calculating vertical position for task ${task.id}`);

  if (!isTaskVisible(task, tasks, expandedItems)) {
    console.log(`Task ${task.id} is hidden (parent not expanded)`);
    return -1;
  }

  // For line items, position them at the top level
  if (task.type === 'lineitem') {
    const lineItems = tasks.filter(t => t.type === 'lineitem');
    const index = lineItems.findIndex(t => t.id === task.id);
    const position = verticalOffset + (index * rowHeight);
    console.log(`Line item ${task.id} positioned at ${position}px`);
    return position;
  }

  // For child tasks, find their position based on parent and previous siblings
  const parents = getParentTasks(task, tasks);
  const parent = parents[0]; // Take first parent
  
  if (!parent) return -1;

  const parentPosition = getVerticalPosition(parent, tasks, expandedItems, rowHeight, verticalOffset);
  if (parentPosition === -1) return -1;

  // Get all visible siblings under the same parent
  const siblings = getChildTasks(parent, tasks)
    .filter(sibling => isTaskVisible(sibling, tasks, expandedItems));
  
  const siblingIndex = siblings.findIndex(s => s.id === task.id);
  const position = parentPosition + ((siblingIndex + 1) * rowHeight);
  
  console.log(`Child task ${task.id} positioned at ${position}px under parent ${parent.id}`);
  return position;
};

export const getGridLines = (viewMode: 'day' | 'week' | 'month') => {
  const intervals = viewMode === 'day' ? 24 : viewMode === 'week' ? 7 : 30;
  return Array.from({ length: intervals }).map((_, i) => {
    const position = (i / intervals) * 100;
    return position;
  });
};