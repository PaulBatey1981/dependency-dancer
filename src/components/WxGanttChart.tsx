import { Gantt } from "wx-react-gantt";
import { Task } from "@/types/scheduling";

interface WxGanttChartProps {
  tasks: Task[];
}

const WxGanttChart = ({ tasks }: WxGanttChartProps) => {
  // Transform our tasks to the format expected by wx-react-gantt
  const wxTasks = tasks.map(task => ({
    id: task.id,
    text: task.name,
    start: task.startTime || new Date(),
    end: task.endTime || new Date(),
    duration: task.duration,
    progress: 0,
    type: task.type === 'lineitem' ? 'summary' : 'task',
    parent: task.dependencies.length > 0 ? task.dependencies[0] : undefined,
    open: true,
    lazy: false,
  }));

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