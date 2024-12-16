import { Task, Resource } from '@/types/scheduling';
import DhtmlxGantt from './gantt/DhtmlxGantt';

interface GanttChartProps {
  tasks: Task[];
  resources: Resource[];
}

const GanttChart = ({ tasks, resources }: GanttChartProps) => {
  console.log('Rendering Gantt chart with tasks:', tasks);

  return (
    <div className="w-full border rounded-lg bg-white shadow-sm">
      <DhtmlxGantt tasks={tasks} />
    </div>
  );
};

export default GanttChart;