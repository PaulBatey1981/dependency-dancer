import { Task } from "@/types/scheduling";

export const transformTasksToGantt = (tasks: Task[]) => {
  console.log('Starting task transformation with tasks:', tasks);

  if (!tasks || tasks.length === 0) {
    console.warn('No tasks provided to transform');
    return [];
  }

  // Get line items (top-level tasks)
  const lineItems = tasks.filter(task => task.type === 'lineitem');
  console.log('Found line items:', lineItems);

  // Transform a single task into the format expected by wx-react-gantt
  const transformTask = (task: Task): any => {
    console.log(`Processing task: ${task.id}`);

    // Find child tasks (tasks that have this task as their dependency)
    const childTasks = tasks.filter(t => {
      const deps = t.dependencies || [];
      return deps.includes(task.id);
    });
    
    console.log(`Found ${childTasks.length} children for task ${task.id}:`, childTasks.map(t => t.id));

    // Transform children recursively
    const children = childTasks.map(child => transformTask(child));

    // Ensure we have valid dates
    const now = new Date();
    const startTime = task.startTime || now;
    const duration = task.duration || 1; // Default to 1 hour if no duration
    const endTime = task.endTime || new Date(startTime.getTime() + (duration * 3600000));

    // Create a valid task object that matches wx-react-gantt's requirements
    return {
      id: task.id,
      text: task.name,
      type: task.type === 'lineitem' ? 'project' : 'task',
      start: startTime,
      end: endTime,
      progress: task.status === 'completed' ? 100 : 0,
      resource: task.resource || '',
      children: children || [], // Ensure children is always an array
      open: true // Always expand nodes by default
    };
  };

  // Transform all line items
  const transformedTasks = lineItems.map(lineItem => transformTask(lineItem));
  
  // Create a root node to contain all line items
  const rootNode = {
    id: 'root',
    text: 'All Projects',
    type: 'project',
    start: new Date(),
    end: new Date(new Date().getTime() + 30 * 24 * 3600000), // 30 days span
    progress: 0,
    children: transformedTasks || [], // Ensure children is always an array
    open: true
  };

  console.log('Final transformed tasks:', [rootNode]);
  return [rootNode];
};