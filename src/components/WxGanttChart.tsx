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

  // Transform tasks to wx-react-gantt format with proper hierarchy
  const transformTask = (task: Task) => {
    // Find all tasks that have this task in their dependencies
    const childTasks = tasksWithDates.filter(t => 
      t.dependencies.includes(task.id)
    );

    const transformedTask = {
      id: task.id,
      text: task.name,
      start: task.startTime!,
      end: task.endTime!,
      duration: task.duration,
      progress: task.status === 'completed' ? 100 : 0,
      type: task.type === 'lineitem' ? 'project' : 'task',
      parent: null as string | null, // Will be set in the next step
      children: childTasks.map(child => child.id),
      open: true,
      resource: task.resource
    };

    console.log(`Transformed task ${task.id}:`, transformedTask);
    return transformedTask;
  };

  // First pass: transform all tasks
  const transformedTasks = tasksWithDates.map(transformTask);

  // Second pass: set parent relationships
  transformedTasks.forEach(task => {
    const originalTask = taskMap.get(task.id);
    if (originalTask && originalTask.dependencies.length > 0) {
      // Find the first dependency that exists in our transformed tasks
      const parentId = originalTask.dependencies.find(depId => 
        transformedTasks.some(t => t.id === depId)
      );
      if (parentId) {
        task.parent = parentId;
      }
    }
  });

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

  // Add error boundary to catch and log any errors
  try {
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
  } catch (error) {
    console.error('Error rendering Gantt chart:', error);
    return <div>Error loading Gantt chart</div>;
  }
};

export default WxGanttChart;