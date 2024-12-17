import { Gantt } from "wx-react-gantt";
import { Task } from "@/types/scheduling";

interface WxGanttChartProps {
  tasks: Task[];
}

const WxGanttChart = ({ tasks }: WxGanttChartProps) => {
  console.log('Initial tasks:', tasks);

  // First, ensure all tasks have valid dates and dependencies
  const tasksWithDates = tasks.map(task => {
    const now = new Date();
    const startTime = task.startTime || now;
    const endTime = task.endTime || new Date(startTime.getTime() + task.duration * 3600000);
    return {
      ...task,
      startTime,
      endTime,
      dependencies: task.dependencies || []
    };
  });

  // Create a task map for quick lookups
  const taskMap = new Map(tasksWithDates.map(task => [task.id, task]));

  // Get all line items (top-level tasks)
  const lineItems = tasksWithDates.filter(task => task.type === 'lineitem');
  console.log('Line items:', lineItems.map(item => item.id));

  // Helper function to get all tasks that depend on a given task
  const getDependentTasks = (taskId: string): Task[] => {
    return tasksWithDates.filter(task => 
      task.dependencies?.includes(taskId)
    );
  };

  // Transform task to wx-react-gantt format
  const transformTask = (task: Task, processedTasks = new Set<string>()): any => {
    if (!task || processedTasks.has(task.id)) {
      console.log(`Skipping task ${task?.id} - already processed or null`);
      return null;
    }

    console.log(`Transforming task ${task.id}`);
    processedTasks.add(task.id);

    // Get all tasks that depend on this task (will be children in Gantt)
    const dependentTasks = getDependentTasks(task.id)
      .filter(t => !processedTasks.has(t.id));
    
    console.log(`Found ${dependentTasks.length} dependent tasks for ${task.id}`);

    // Transform children first
    const children = dependentTasks
      .map(child => transformTask(child, processedTasks))
      .filter(child => child !== null);

    // For line items, no parent. For others, use first dependency as parent
    const parentId = task.type === 'lineitem' ? undefined : task.dependencies?.[0];
    
    // Skip tasks with invalid parent references
    if (parentId && !taskMap.get(parentId)) {
      console.warn(`Parent task ${parentId} not found for task ${task.id}`);
      return null;
    }

    const transformedTask = {
      id: task.id,
      text: task.name,
      start: task.startTime!,
      end: task.endTime!,
      duration: task.duration,
      progress: task.status === 'completed' ? 100 : 0,
      type: task.type === 'lineitem' ? 'project' : 'task',
      parent: parentId,
      children: children.length > 0 ? children : undefined,
      open: true,
      resource: task.resource
    };

    console.log(`Transformed task ${task.id}:`, transformedTask);
    return transformedTask;
  };

  // Start transformation from line items (top-level tasks)
  const processedTasks = new Set<string>();
  const transformedTasks = lineItems
    .map(task => transformTask(task, processedTasks))
    .filter((task): task is NonNullable<typeof task> => task !== null);

  console.log('Final transformed tasks:', transformedTasks);

  // Create links between tasks based on dependencies
  const links = tasksWithDates.flatMap(task => 
    (task.dependencies || []).map((depId, index) => ({
      id: `${depId}_${task.id}_${index}`,
      source: depId,
      target: task.id,
      type: "finish_to_start"
    }))
  );

  console.log('Generated links:', links);

  // Define columns for the grid area
  const columns = [
    { 
      id: "text", 
      header: "Task name", 
      width: 300,
      resize: true
    },
    {
      id: "start",
      header: "Start date",
      width: 150,
      align: "center",
    },
    {
      id: "duration",
      header: "Duration (hours)",
      width: 120,
      align: "center",
    },
    {
      id: "resource",
      header: "Resource",
      width: 120,
      align: "center"
    }
  ];

  const scales = [
    { unit: "day", step: 1, format: "d" },
    { unit: "month", step: 1, format: "MMMM yyyy" }
  ];

  return (
    <div className="h-[600px] w-full">
      <Gantt 
        tasks={transformedTasks} 
        links={links} 
        scales={scales}
        columns={columns}
        taskHeight={40}
        rowHeight={40}
        barFill={80}
        viewMode="month"
        resizing={false}
        moving={false}
        autoScheduling={false}
        cellWidth={40}
        columnWidth={300}
        treeExpanded={true}
      />
    </div>
  );
};

export default WxGanttChart;