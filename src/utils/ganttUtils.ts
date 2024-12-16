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
const getChildTasks = (task: Task, tasks: Task[]): Task[] => {
  return tasks.filter(t => t.dependencies.includes(task.id));
};

// Get tasks that this task depends on (parents)
const getParentTasks = (task: Task, tasks: Task[]): Task[] => {
  return task.dependencies.map(depId => tasks.find(t => t.id === depId)).filter((t): t is Task => t !== undefined);
};

// Find the immediate parent of a task
const findImmediateParent = (task: Task, tasks: Task[]): Task | undefined => {
  if (task.type === 'lineitem') return undefined;
  return tasks.find(t => task.dependencies.includes(t.id));
};

// Check if a task should be visible based on its parent's expansion state
const isTaskVisible = (task: Task, tasks: Task[], expandedItems: Set<string>): boolean => {
  if (task.type === 'lineitem') return true;

  const parent = findImmediateParent(task, tasks);
  if (!parent) return true; // If no parent found, task should be visible

  // Check if parent is expanded and visible
  return expandedItems.has(parent.id) && isTaskVisible(parent, tasks, expandedItems);
};

export const getTaskLevel = (task: Task, tasks: Task[]): number => {
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

  let position = verticalOffset;
  const level = getTaskLevel(task, tasks);

  // For line items, use their order in the list
  if (task.type === 'lineitem') {
    const lineItems = tasks.filter(t => t.type === 'lineitem');
    const index = lineItems.findIndex(t => t.id === task.id);
    position += index * rowHeight;
    console.log(`Line item ${task.id} positioned at ${position}px`);
    return position;
  }

  // For child tasks, calculate position based on parent and siblings
  const parent = findImmediateParent(task, tasks);
  if (!parent) return -1;

  const parentPosition = getVerticalPosition(parent, tasks, expandedItems, rowHeight, verticalOffset);
  if (parentPosition === -1) return -1;

  const siblings = getChildTasks(parent, tasks);
  const visibleSiblingsBefore = siblings
    .filter(s => s.id !== task.id && isTaskVisible(s, tasks, expandedItems))
    .filter(s => siblings.indexOf(s) < siblings.indexOf(task));

  position = parentPosition + ((visibleSiblingsBefore.length + 1) * rowHeight);
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