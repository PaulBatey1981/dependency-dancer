import { Task, Resource } from '@/types/scheduling';
import TaskList from '@/components/TaskList';
import ResourceTimeline from '@/components/ResourceTimeline';
import GanttChart from '@/components/GanttChart';
import SimpleGanttChart from '@/components/gantt-simple/SimpleGanttChart';

interface ScheduleContentProps {
  view: 'list' | 'resource' | 'gantt' | 'simple-gantt';
  tasks: Task[];
  resources: Resource[];
  onToggleFixed: (taskId: string) => void;
}

const ScheduleContent = ({ view, tasks, resources, onToggleFixed }: ScheduleContentProps) => {
  return (
    <div className="flex-1">
      {view === 'list' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Tasks</h2>
          <TaskList tasks={tasks} onToggleFixed={onToggleFixed} />
        </div>
      )}

      {view === 'resource' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Resource Timeline</h2>
          <ResourceTimeline tasks={tasks} resources={resources} />
        </div>
      )}

      {view === 'gantt' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Gantt Chart</h2>
          <GanttChart tasks={tasks} resources={resources} />
        </div>
      )}

      {view === 'simple-gantt' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Simple Gantt Chart</h2>
          <SimpleGanttChart />
        </div>
      )}
    </div>
  );
};

export default ScheduleContent;