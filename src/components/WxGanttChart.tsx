import { Gantt } from "wx-react-gantt";
import { Task } from "@/types/scheduling";

interface WxGanttChartProps {
  tasks: Task[];
}

const WxGanttChart = ({ tasks }: WxGanttChartProps) => {
  // First, transform line items (they will be root/parent tasks)
  const lineItems = tasks.filter(task => task.type === 'lineitem');
  
  // Transform our tasks to the format expected by wx-react-gantt
  const wxTasks = tasks.map(task => ({
    id: task.id,
    text: task.name,
    start: task.startTime || new Date(),
    end: task.endTime || new Date(),
    duration: task.duration,
    progress: 0,
    type: task.type === 'lineitem' ? 'summary' : 'task',
    // For line items, don't set a parent. For others, find their first dependency
    parent: task.type === 'lineitem' ? undefined : task.dependencies[0],
    open: true,
    lazy: false,
  }));

  console.log('Transformed tasks:', wxTasks);

  // Create links from dependencies
  const links = tasks.flatMap(task => 
    task.dependencies.map((depId, index) => ({
      id: `${task.id}_${depId}_${index}`,
      source: depId,
      target: task.id,
      type: "e2e"
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

  // Ensure all tasks have valid dates
  const validWxTasks = wxTasks.map(task => ({
    ...task,
    start: task.start instanceof Date ? task.start : new Date(),
    end: task.end instanceof Date ? task.end : new Date(Date.now() + task.duration * 3600000)
  }));

  console.log('WxGantt tasks:', validWxTasks);
  console.log('WxGantt links:', links);
  console.log('WxGantt columns:', columns);

  return (
    <div className="h-[600px] w-full">
      <Gantt 
        tasks={validWxTasks} 
        links={links} 
        scales={scales}
        columns={columns}
      />
    </div>
  );
};

export default WxGanttChart;