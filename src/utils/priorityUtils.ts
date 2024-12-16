import { Task } from '@/types/scheduling';

export function sortByPriority(tasks: Task[]): Task[] {
  console.log('Sorting tasks by priority');
  
  // Group tasks by their line item (tasks with priority are line items)
  const taskGroups = tasks.reduce((groups, task) => {
    const priority = task.priority || 0;
    if (!groups[priority]) {
      groups[priority] = [];
    }
    groups[priority].push(task);
    return groups;
  }, {} as Record<number, Task[]>);

  // Sort by priority (highest first) and flatten
  const sortedTasks = Object.entries(taskGroups)
    .sort(([priorityA], [priorityB]) => Number(priorityB) - Number(priorityA))
    .flatMap(([_, tasks]) => tasks);

  return sortedTasks;
}