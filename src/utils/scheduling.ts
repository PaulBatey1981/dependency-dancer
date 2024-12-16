import { Task, TaskStatus } from '@/types/scheduling';

// Topological sort implementation
export function topologicalSort(tasks: Task[]): Task[] {
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

  return order;
}

// Basic scheduling algorithm
export function scheduleTask(
  task: Task,
  scheduledTasks: Task[],
  startTime: Date = new Date()
): Date {
  console.log(`Scheduling task: ${task.id}`);
  
  // Find the latest end time of dependencies
  const depEndTime = task.dependencies
    .map(depId => {
      const depTask = scheduledTasks.find(t => t.id === depId);
      return depTask?.endTime || startTime;
    })
    .reduce((latest, current) => 
      current > latest ? current : latest, 
      startTime
    );

  // Find the earliest available slot after dependencies
  let proposedStart = depEndTime;
  let conflictFound = true;

  while (conflictFound) {
    conflictFound = false;
    for (const scheduled of scheduledTasks) {
      if (scheduled.resource === task.resource && 
          scheduled.status === 'fixed' &&
          proposedStart < (scheduled.endTime || new Date()) &&
          new Date(proposedStart.getTime() + task.duration * 3600000) > (scheduled.startTime || new Date())) {
        proposedStart = scheduled.endTime || new Date();
        conflictFound = true;
        break;
      }
    }
  }

  console.log(`Scheduled task ${task.id} to start at ${proposedStart}`);
  return proposedStart;
}

export function rescheduleAll(tasks: Task[]): Task[] {
  console.log('Starting full reschedule');
  
  // Sort tasks topologically
  const sortedTasks = topologicalSort(tasks);
  
  // Keep track of scheduled tasks
  const scheduledTasks: Task[] = [];
  
  // Schedule each task
  for (const task of sortedTasks) {
    if (task.status === 'fixed') {
      scheduledTasks.push(task);
      continue;
    }
    
    const startTime = scheduleTask(task, scheduledTasks);
    const endTime = new Date(startTime.getTime() + task.duration * 3600000);
    
    scheduledTasks.push({
      ...task,
      startTime,
      endTime,
      status: 'scheduled'
    });
  }
  
  console.log('Reschedule complete');
  return scheduledTasks;
}
