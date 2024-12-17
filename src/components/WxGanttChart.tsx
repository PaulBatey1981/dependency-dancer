import { Gantt } from "wx-react-gantt";
import { Task } from "@/types/scheduling";

interface WxGanttChartProps {
  tasks: Task[];
}

const WxGanttChart = ({ tasks }: WxGanttChartProps) => {
  console.log('Initial tasks:', tasks);

  // First, ensure all tasks have valid dates
  const tasksWithDates = tasks.map(task => {
    const now = new Date();
    const startTime = task.startTime || now;
    const endTime = task.endTime || new Date(startTime.getTime() + task.duration * 3600000);
    return {
      ...task,
      startTime,
      endTime
    };
  });

  // Create a map for quick task lookup
  const taskMap = new Map(tasksWithDates.map(task => [task.id, task]));

  // Get all line items as root tasks
  const lineItems = tasksWithDates.filter(task => task.type === 'lineitem');
  console.log('Line items:', lineItems.map(item => item.id));

  // Helper function to get child tasks
  const getChildTasks = (parentTask: Task) => {
    return tasksWithDates.filter(task => 
      task.dependencies.includes(parentTask.id)
    );
  };

  // Transform tasks to wx-react-gantt format with proper hierarchy
  const transformTask = (task: Task, parentId: string | null = null) => {
    const childTasks = getChildTasks(task);
    
    const transformedTask = {
      id: task.id,
      text: task.name,
      start: task.startTime!,
      end: task.endTime!,
      duration: task.duration,
      progress: task.status === 'completed' ? 100 : 0,
      type: task.type === 'lineitem' ? 'project' : 'task',
      parent: parentId,
      children: childTasks.map(child => child.id),
      open: true,
      resource: task.resource
    };

    console.log(`Transformed task ${task.id}:`, transformedTask);
    return transformedTask;
  };

  // Build task hierarchy starting from line items
  const transformedTasks = [];
  
  // First add line items (root level)
  for (const lineItem of lineItems) {
    transformedTasks.push(transformTask(lineItem, null));
  }

  // Then add all other tasks with their proper parent relationships
  for (const task of tasksWithDates) {
    if (task.type !== 'lineitem') {
      // Find the first task that has this task in its dependencies
      const parentTask = tasksWithDates.find(t => 
        t.dependencies.includes(task.id)
      );
      transformedTasks.push(transformTask(task, parentTask?.id || null));
    }
  }

  console.log('Final transformed tasks:', transformedTasks);

  // Create links between tasks
  const links = tasksWithDates.flatMap(task => 
    task.dependencies.map((depId, index) => ({
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