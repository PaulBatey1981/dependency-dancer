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
  return (hoursFromStart / timeScale) * 100;
};

export const calculateTaskWidth = (duration: number, timeScale: number) => {
  return (duration / timeScale) * 100;
};

// Get child tasks (tasks that this task depends on)
const getChildTasks = (parentTask: Task, tasks: Task[]): Task[] => {
  console.log(`Getting children for task ${parentTask.id} with dependencies:`, parentTask.dependencies);
  return tasks.filter(task => parentTask.dependencies.includes(task.id));
};

// Get parent tasks (tasks that depend on this task)
const getParentTask = (task: Task, tasks: Task[]): Task | undefined => {
  console.log(`Finding parent for task ${task.id}`);
  // Find a task that lists this task in its dependencies
  const parent = tasks.find(t => t.dependencies.includes(task.id));
  if (parent) {
    console.log(`Found parent ${parent.id} for task ${task.id}`);
  } else {
    console.log(`No parent found for task ${task.id}`);
  }
  return parent;
};

// Check if a task should be visible based on expansion state
const isTaskVisible = (task: Task, tasks: Task[], expandedItems: Set<string>): boolean => {
  console.log(`Checking visibility for task ${task.id}`);
  
  // Line items are always visible
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

  // If the immediate parent is not expanded, the task is hidden
  if (!expandedItems.has(parent.id)) {
    console.log(`Parent ${parent.id} of task ${task.id} is not expanded - hidden`);
    return false;
  }

  // Check if all ancestors in the chain are expanded
  return isTaskVisible(parent, tasks, expandedItems);
};

export const getTaskLevel = (task: Task, tasks: Task[]): number => {
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

  // Check if the task should be visible
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

  // Get the parent task
  const parent = getParentTask(task, tasks);
  if (!parent) {
    console.log(`Task ${task.id} has no parent - using base offset`);
    return verticalOffset;
  }

  // Get parent's position
  const parentPosition = getVerticalPosition(parent, tasks, expandedItems, rowHeight, verticalOffset);
  if (parentPosition === -1) return -1;

  // Get all visible siblings (including this task) that share the same parent
  const siblings = getChildTasks(parent, tasks)
    .filter(sibling => isTaskVisible(sibling, tasks, expandedItems))
    .sort((a, b) => tasks.indexOf(a) - tasks.indexOf(b)); // Maintain original task order
  
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