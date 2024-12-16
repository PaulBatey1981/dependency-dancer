import { Task } from '@/types/scheduling';

export function sortByPriority(tasks: Task[]): Task[] {
  console.log('Sorting tasks by priority');
  return [...tasks].sort((a, b) => {
    const priorityA = a.priority || 0;
    const priorityB = b.priority || 0;
    return priorityB - priorityA;
  });
}