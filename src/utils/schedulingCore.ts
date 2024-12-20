import { Task } from '@/types/scheduling';
import { topologicalSort } from './topologicalSort';
import { scheduleTask } from './timeSlotUtils';
import { sortByPriority } from './priorityUtils';

export function rescheduleAll(tasks: Task[]): Task[] {
  console.log('Starting full reschedule');
  
  const sortedTasks = topologicalSort(tasks);
  console.log('Tasks after topological sort:', sortedTasks.map(t => t.id));
  
  const prioritizedTasks = sortByPriority(sortedTasks);
  console.log('Tasks after priority sort:', prioritizedTasks.map(t => t.id));
  
  const scheduledTasks: Task[] = [];
  const baseDate = new Date();
  
  for (const task of prioritizedTasks) {
    console.log(`Processing task: ${task.id}`);
    
    if (task.is_fixed) {
      console.log(`Task ${task.id} is fixed, keeping existing schedule`);
      scheduledTasks.push(task);
      continue;
    }
    
    const dependencies = task.dependencies.map(depId => {
      const depTask = scheduledTasks.find(t => t.id === depId);
      if (!depTask?.endTime) {
        throw new Error(`Dependency ${depId} for task ${task.id} must be scheduled first`);
      }
      console.log(`Dependency ${depId} ends at ${depTask.endTime.toISOString()}`);
      return depTask;
    });
    
    const latestDependencyEnd = dependencies.length > 0
      ? new Date(Math.max(...dependencies.map(d => d.endTime!.getTime())))
      : baseDate;
    
    console.log(`Latest dependency end time for ${task.id}: ${latestDependencyEnd.toISOString()}`);
    
    const previousResourceTasks = scheduledTasks
      .filter(t => t.resource_id === task.resource_id && t.endTime)
      .sort((a, b) => (b.endTime!.getTime()) - (a.endTime!.getTime()));
    
    const latestResourceEnd = previousResourceTasks.length > 0
      ? previousResourceTasks[0].endTime!
      : baseDate;
    
    const earliestStart = new Date(Math.max(
      latestDependencyEnd.getTime(),
      latestResourceEnd.getTime()
    ));
    
    console.log(`Earliest possible start for ${task.id}: ${earliestStart.toISOString()}`);
    
    const startTime = scheduleTask(task, scheduledTasks, earliestStart);
    const endTime = new Date(startTime.getTime() + task.duration * 3600000);
    
    scheduledTasks.push({
      ...task,
      startTime,
      endTime,
      status: 'scheduled'
    });
    
    console.log(`Scheduled ${task.id} from ${startTime.toISOString()} to ${endTime.toISOString()}`);
  }
  
  console.log('Reschedule complete');
  return scheduledTasks;
}