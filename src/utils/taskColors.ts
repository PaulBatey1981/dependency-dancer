import { Task } from '@/types/scheduling';

export const getTaskColor = (type: Task['type']) => {
  switch (type) {
    case 'lineitem':
      return 'bg-task-lineitem';
    case 'component':
      return 'bg-task-component';
    case 'element':
      return 'bg-task-element';
    default:
      return 'bg-gray-500';
  }
};