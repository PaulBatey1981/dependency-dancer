import { Task, Resource } from '@/types/scheduling';
import GanttTest from './gantt/GanttTest';

interface GanttChartProps {
  tasks: Task[];
  resources: Resource[];
}

const GanttChart = ({ tasks, resources }: GanttChartProps) => {
  console.log('Rendering Gantt chart with tasks:', tasks);

  // Filter only scheduled tasks
  const scheduledTasks = tasks.filter(task => task.status === 'scheduled' && task.startTime);
  console.log('Scheduled tasks:', scheduledTasks);

  return (
    <div className="w-full border rounded-lg bg-white shadow-sm">
      <GanttTest tasks={scheduledTasks} />
    </div>
  );
};

export default GanttChart;