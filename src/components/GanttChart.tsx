import { Task, Resource } from '@/types/scheduling';
import GanttTest from './gantt/GanttTest';

interface GanttChartProps {
  tasks: Task[];
  resources: Resource[];
}

const GanttChart = ({ tasks, resources }: GanttChartProps) => {
  console.log('Rendering Gantt chart with tasks:', tasks);

  return (
    <div className="w-full border rounded-lg bg-white shadow-sm">
      <GanttTest tasks={tasks} />
    </div>
  );
};

export default GanttChart;