import { Task } from '@/types/scheduling';

export function topologicalSort(tasks: Task[]): Task[] {
  console.log('Starting topological sort');
  
  const visited = new Set<string>();
  const temp = new Set<string>();
  const order: Task[] = [];
  const taskMap = new Map(tasks.map(task => [task.id, task]));

  function visit(taskId: string) {
    if (temp.has(taskId)) {
      throw new Error('Cycle detected in task dependencies');
    }
    if (visited.has(taskId)) return;

    temp.add(taskId);
    const task = taskMap.get(taskId);
    if (!task) return;

    for (const depId of task.dependencies) {
      visit(depId);
    }

    temp.delete(taskId);
    visited.add(taskId);
    order.unshift(task);
  }

  for (const task of tasks) {
    if (!visited.has(task.id)) {
      visit(task.id);
    }
  }

  console.log('Topological sort complete');
  return order;
}