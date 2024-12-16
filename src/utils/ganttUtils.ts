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

// Get tasks that depend on this task (children)
const getChildTasks = (parentTask: Task, tasks: Task[]): Task[] => {
  // A task is a child if the parent's ID is in its dependencies
  return tasks.filter(task => task.dependencies.includes(parentTask.id));
};

// Get the parent task of this task
const getParentTask = (task: Task, tasks: Task[]): Task | undefined => {
  // The parent is the task that this task depends on
  if (task.dependencies.length === 0) return undefined;
  return tasks.find(t => t.id === task.dependencies[0]);
};

// Check if a task should be visible based on expansion state
const isTaskVisible = (task: Task, tasks: Task[], expandedItems: Set<string>): boolean => {
  console.log(`Checking visibility for task ${task.id}`);
  
  if (task.type === 'lineitem') {
    console.log(`Task ${task.id} is a line item - visible`);
    return true;
  }

  // Get the parent task
  const parent = getParentTask(task, tasks);
  if (!parent) {
    console.log(`Task ${task.id} has no parent - visible`);
    return true;
  }

  // If parent is not expanded, task is not visible
  if (!expandedItems.has(parent.id)) {
    console.log(`Parent ${parent.id} of task ${task.id} is not expanded - hidden`);
    return false;
  }

  // Recursively check if parent is visible
  return isTaskVisible(parent, tasks, expandedItems);
};

export const getTaskLevel = (task: Task, tasks: Task[]): number => {
  if (task.type === 'lineitem') return 0;

  let level = 0;
  let currentTask = task;
  
  while (true) {
    const parent = getParentTask(currentTask, tasks);
    if (!parent) break;
    level++;
    currentTask = parent;
  }

  return level;
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

  // For child tasks, find their position based on parent and siblings
  const parent = getParentTask(task, tasks);
  if (!parent) return verticalOffset;

  const parentPosition = getVerticalPosition(parent, tasks, expandedItems, rowHeight, verticalOffset);
  if (parentPosition === -1) return -1;

  // Get all visible siblings under the same parent (including this task)
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