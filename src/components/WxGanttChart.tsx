import { Gantt } from "wx-react-gantt";
import { Task } from "@/types/scheduling";

interface WxGanttChartProps {
  tasks: Task[];
}

const WxGanttChart = ({ tasks }: WxGanttChartProps) => {
  // First, get all line items as they will be our root tasks
  const lineItems = tasks.filter(task => task.type === 'lineitem');
  console.log('Line items:', lineItems.map(item => item.id));

  // Helper function to get all child tasks for a given task
  const getChildTasks = (parentId: string): Task[] => {
    return tasks.filter(task => task.dependencies.includes(parentId));
  };

  // Transform tasks to wx-react-gantt format with proper hierarchy
  const transformTask = (task: Task) => {
    const now = new Date();
    const startTime = task.startTime || now;
    const endTime = task.endTime || new Date(startTime.getTime() + task.duration * 3600000);

    // Find the parent task (the task that this task depends on)
    const parentTask = tasks.find(t => task.dependencies.includes(t.id));

    return {
      id: task.id,
      text: task.name,
      start: startTime,
      end: endTime,
      duration: task.duration,
      progress: 0,
      type: task.type === 'lineitem' ? 'project' : 'task',
      parent: parentTask?.id, // Set parent based on dependencies
      open: true,
    };
  };

  // Transform all tasks, not just the hierarchy
  const wxTasks = tasks.map(task => transformTask(task));
  console.log('Transformed tasks:', wxTasks);

  // Create links from dependencies (reversed to match parent-child relationships)
  const links = tasks.flatMap(task => 
    task.dependencies.map((depId, index) => ({
      id: `${depId}_${task.id}_${index}`, // Reversed order in ID
      source: depId, // Parent task
      target: task.id, // Child task
      type: "finish_to_start" // Using proper link type
    }))
  );

  // Define columns for the grid area
  const columns = [
    { id: "text", header: "Task name", flexGrow: 2 },
    {
      id: "start",
      header: "Start date",
      flexGrow: 1,
      align: "center",
    },
    {
      id: "duration",
      header: "Duration (hours)",
      align: "center",
      flexGrow: 1,
    },
    {
      id: "resource",
      header: "Resource",
      align: "center",
      flexGrow: 1,
      template: (task: any) => {
        const originalTask = tasks.find(t => t.id === task.id);
        return originalTask?.resource || '';
      }
    }
  ];

  const scales = [
    { unit: "month", step: 1, format: "MMMM yyy" },
    { unit: "day", step: 1, format: "d" },
  ];

  console.log('WxGantt tasks:', wxTasks);
  console.log('WxGantt links:', links);
  console.log('WxGantt columns:', columns);

  return (
    <div className="h-[600px] w-full">
      <Gantt 
        tasks={wxTasks} 
        links={links} 
        scales={scales}
        columns={columns}
      />
    </div>
  );
};

export default WxGanttChart;