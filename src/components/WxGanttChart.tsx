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

  // Get all line items
  const lineItems = tasksWithDates.filter(task => task.type === 'lineitem');
  console.log('Line items:', lineItems.map(item => item.id));

  // Helper function to get dependent tasks (tasks that have this task as a dependency)
  const getDependentTasks = (taskId: string): Task[] => {
    return tasksWithDates.filter(task => 
      task.dependencies && task.dependencies.includes(taskId)
    );
  };

  // Transform tasks to wx-react-gantt format
  const transformTask = (task: Task) => {
    if (!task) return null;

    // Get tasks that depend on this task
    const dependentTasks = getDependentTasks(task.id);
    console.log(`Dependent tasks for ${task.id}:`, dependentTasks.map(t => t.id));
    
    // Get the task this task depends on (parent)
    const parentId = task.dependencies && task.dependencies.length > 0 ? task.dependencies[0] : null;
    
    const transformedTask = {
      id: task.id,
      text: task.name,
      start: task.startTime!,
      end: task.endTime!,
      duration: task.duration,
      progress: task.status === 'completed' ? 100 : 0,
      type: task.type === 'lineitem' ? 'project' : 'task',
      parent: parentId,
      children: dependentTasks.map(t => t.id),
      open: true,
      resource: task.resource
    };

    console.log(`Transformed task ${task.id}:`, transformedTask);
    return transformedTask;
  };

  // Transform all tasks, starting with line items
  const transformedTasks = tasksWithDates
    .map(transformTask)
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