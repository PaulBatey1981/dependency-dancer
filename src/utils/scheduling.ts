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

// Find the earliest available time slot for a task on its resource
function findEarliestSlot(
  task: Task,
  scheduledTasks: Task[],
  startTime: Date
): Date {
  console.log(`Finding earliest slot for task ${task.id} on resource ${task.resource}`);
  
  // Get all tasks scheduled on the same resource
  const resourceTasks = scheduledTasks.filter(
    t => t.resource === task.resource && t.startTime && t.endTime
  );
  
  // Sort tasks by start time
  resourceTasks.sort((a, b) => 
    (a.startTime?.getTime() || 0) - (b.startTime?.getTime() || 0)
  );
  
  let proposedStart = startTime;
  let proposedEnd = new Date(proposedStart.getTime() + task.duration * 3600000);
  
  // Check each scheduled task for overlaps
  for (const scheduledTask of resourceTasks) {
    if (!scheduledTask.startTime || !scheduledTask.endTime) continue;
    
    // If our proposed slot overlaps with a scheduled task
    if (proposedStart < scheduledTask.endTime && 
        proposedEnd > scheduledTask.startTime) {
      // Move proposed start to after the scheduled task
      proposedStart = new Date(scheduledTask.endTime.getTime());
      proposedEnd = new Date(proposedStart.getTime() + task.duration * 3600000);
    }
  }
  
  // If task has a deadline, verify we can meet it
  if (task.deadline && proposedEnd > task.deadline) {
    console.warn(`Warning: Task ${task.id} cannot meet deadline`);
  }
  
  console.log(`Found slot for task ${task.id}: ${proposedStart.toISOString()}`);
  return proposedStart;
}

// Schedule a single task
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
  return findEarliestSlot(task, scheduledTasks, depEndTime);
}

// Sort tasks by priority (higher priority first)
function sortByPriority(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    // Default priority is 0
    const priorityA = a.priority || 0;
    const priorityB = b.priority || 0;
    return priorityB - priorityA;
  });
}

export function rescheduleAll(tasks: Task[]): Task[] {
  console.log('Starting full reschedule');
  
  // Sort tasks topologically first
  const sortedTasks = topologicalSort(tasks);
  
  // Then sort by priority within dependency constraints
  const prioritizedTasks = sortByPriority(sortedTasks);
  
  // Keep track of scheduled tasks
  const scheduledTasks: Task[] = [];
  
  // Schedule each task
  for (const task of prioritizedTasks) {
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
