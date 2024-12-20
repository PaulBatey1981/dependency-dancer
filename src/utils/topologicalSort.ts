import { Task } from '@/types/scheduling';

export function topologicalSort(tasks: Task[]): Task[] {
  console.log('Starting topological sort with tasks:', tasks.map(t => ({ id: t.id, name: t.name })));
  
  const visited = new Set<string>();
  const temp = new Set<string>();
  const order: Task[] = [];
  const taskMap = new Map(tasks.map(task => [task.id, task]));

  function findCycle(taskId: string, path: string[] = []): string[] | null {
    if (temp.has(taskId)) {
      const cycleStart = path.indexOf(taskId);
      if (cycleStart === -1) return null;
      const cycle = path.slice(cycleStart);
      cycle.push(taskId);
      return cycle;
    }
    if (visited.has(taskId)) return null;

    const task = taskMap.get(taskId);
    if (!task) return null;

    temp.add(taskId);
    path.push(taskId);

    for (const depId of task.dependencies) {
      const cycle = findCycle(depId, [...path]);
      if (cycle) {
        console.error('Cycle detected:', cycle.map(id => taskMap.get(id)?.name).join(' -> '));
        return cycle;
      }
    }

    temp.delete(taskId);
    return null;
  }

  function visit(taskId: string) {
    if (temp.has(taskId)) {
      const cycle = findCycle(taskId);
      if (cycle) {
        const taskNames = cycle.map(id => taskMap.get(id)?.name).join(' -> ');
        throw new Error(`Cycle detected in task dependencies: ${taskNames}`);
      }
      return;
    }
    if (visited.has(taskId)) return;

    temp.add(taskId);
    const task = taskMap.get(taskId);
    if (!task) return;

    console.log(`Visiting task: ${task.name} with dependencies:`, task.dependencies);

    for (const depId of task.dependencies) {
      visit(depId);
    }

    temp.delete(taskId);
    visited.add(taskId);
    order.unshift(task);
  }

  // First, check for any cycles before starting the sort
  for (const task of tasks) {
    const cycle = findCycle(task.id);
    if (cycle) {
      const taskNames = cycle.map(id => taskMap.get(id)?.name).join(' -> ');
      console.error('Cycle found before sorting:', taskNames);
      // Instead of throwing an error, we'll try to break the cycle by ignoring one dependency
      const cycleTask = taskMap.get(cycle[0]);
      if (cycleTask) {
        console.log(`Breaking cycle by removing dependency from task: ${cycleTask.name}`);
        cycleTask.dependencies = cycleTask.dependencies.filter(depId => depId !== cycle[1]);
      }
    }
  }

  // Now perform the actual sort
  for (const task of tasks) {
    if (!visited.has(task.id)) {
      try {
        visit(task.id);
      } catch (error) {
        console.error('Error during topological sort:', error);
        // If we still encounter an error, we'll add the task anyway
        if (!order.includes(task)) {
          order.unshift(task);
        }
      }
    }
  }

  console.log('Topological sort complete. Order:', order.map(t => t.name));
  return order;
}