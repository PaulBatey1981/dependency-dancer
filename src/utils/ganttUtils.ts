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

// A task is a parent if other tasks depend on it
const getChildTasks = (task: Task, tasks: Task[]): Task[] => {
  return tasks.filter(t => t.dependencies.includes(task.id));
};

// Get tasks that this task depends on
const getParentTasks = (task: Task, tasks: Task[]): Task[] => {
  return task.dependencies.map(depId => tasks.find(t => t.id === depId)).filter((t): t is Task => t !== undefined);
};

export const getTaskLevel = (task: Task, tasks: Task[]): number => {
  const parents = getParentTasks(task, tasks);
  if (parents.length === 0) return 0;
  return Math.max(...parents.map(parent => getTaskLevel(parent, tasks))) + 1;
};

const calculateTotalVisibleChildren = (task: Task, tasks: Task[], expandedItems: Set<string>): number => {
  if (!expandedItems.has(task.id)) return 0;
  
  const children = getChildTasks(task, tasks);
  let total = children.length;
  
  for (const child of children) {
    if (expandedItems.has(child.id)) {
      total += calculateTotalVisibleChildren(child, tasks, expandedItems);
    }
  }
  
  return total;
};

export const getVerticalPosition = (
  task: Task,
  tasks: Task[],
  expandedItems: Set<string>,
  rowHeight: number,
  verticalOffset: number
): number => {
  console.log(`Calculating vertical position for task ${task.id}`);

  // Get all tasks at the same level
  const tasksAtSameLevel = tasks.filter(t => getTaskLevel(t, tasks) === getTaskLevel(task, tasks));
  
  // Find position among tasks at the same level
  const indexAtLevel = tasksAtSameLevel.findIndex(t => t.id === task.id);
  
  // Base position is determined by level and index
  let position = verticalOffset + (indexAtLevel * rowHeight);

  // Add space for expanded parent tasks and their children
  const parents = getParentTasks(task, tasks);
  parents.forEach(parent => {
    if (expandedItems.has(parent.id)) {
      const siblingsBefore = getChildTasks(parent, tasks)
        .filter(sibling => 
          getTaskLevel(sibling, tasks) === getTaskLevel(task, tasks) &&
          tasksAtSameLevel.indexOf(sibling) < indexAtLevel
        );
      position += siblingsBefore.length * rowHeight;
    }
  });

  console.log(`Final position for task ${task.id}: ${position}px`);
  return position;
};

export const getGridLines = (viewMode: 'day' | 'week' | 'month') => {
  const intervals = viewMode === 'day' ? 24 : viewMode === 'week' ? 7 : 30;
  return Array.from({ length: intervals }).map((_, i) => {
    const position = (i / intervals) * 100;
    return position;
  });
};
