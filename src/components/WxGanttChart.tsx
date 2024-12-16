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

  const scales = [
    { unit: "month", step: 1, format: "MMMM yyy" },
    { unit: "day", step: 1, format: "d" },
  ];

  console.log('WxGantt tasks:', wxTasks);
  console.log('WxGantt links:', links);

  return (
    <div className="h-[600px] w-full">
      <Gantt 
        tasks={wxTasks} 
        links={links} 
        scales={scales}
      />
    </div>
  );
};

export default WxGanttChart;