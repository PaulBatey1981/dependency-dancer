import { Task, Resource } from '@/types/scheduling';
import { Card } from '@/components/ui/card';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';

interface ResourceTimelineProps {
  tasks: Task[];
  resources: Resource[];
}

const ResourceTimeline = ({ tasks, resources }: ResourceTimelineProps) => {
  console.log('ResourceTimeline - Tasks:', tasks);
  console.log('ResourceTimeline - Resources:', resources);

  const getTaskColor = (type: Task['type']) => {
    switch (type) {
      case 'lineitem':
        return 'bg-task-lineitem';
      case 'component':
        return 'bg-task-component';
      case 'element':
        return 'bg-task-element';
      default:
        return 'bg-gray-500';
    }
  };

  const calculateTaskPosition = (startTime: Date) => {
    const earliestStart = new Date(Math.min(...tasks.filter(t => t.startTime).map(t => t.startTime!.getTime())));
    const hoursFromStart = (startTime.getTime() - earliestStart.getTime()) / (1000 * 60 * 60);
    return `${(hoursFromStart / 24) * 100}%`;
  };

  // Filter out tasks without resource_id or startTime
  const validTasks = tasks.filter(task => task.resource_id && task.startTime);
  console.log('Valid tasks for timeline:', validTasks.length);

  return (
    <div className="space-y-6">
      {resources.map(resource => {
        const resourceTasks = validTasks.filter(task => task.resource_id === resource.id);
        console.log(`Tasks for resource ${resource.id}:`, resourceTasks.length);
        
        return (
          <Card key={resource.id} className="p-4">
            <h3 className="font-semibold mb-2">{resource.name}</h3>
            <div className="relative h-20 bg-gray-100 rounded">
              {resourceTasks.map(task => (
                <HoverCard key={task.id} openDelay={0} closeDelay={0}>
                  <HoverCardTrigger asChild>
                    <div
                      className={`absolute h-16 mt-2 rounded ${getTaskColor(task.type)} opacity-80 cursor-pointer ${
                        task.is_fixed ? 'border-2 border-task-fixed' : ''
                      }`}
                      style={{
                        left: task.startTime ? calculateTaskPosition(task.startTime) : '0%',
                        width: `${(task.duration / 24) * 100}%`,
                      }}
                    >
                      <span className="text-xs text-white p-1 truncate block">
                        {task.name}
                      </span>
                    </div>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80 bg-white">
                    <div className="space-y-2">
                      <h4 className="font-semibold">{task.name}</h4>
                      <div className="text-sm">
                        <p>Type: {task.type}</p>
                        <p>Duration: {task.duration}h</p>
                        <p>Status: {task.status}</p>
                        <p>Fixed: {task.is_fixed ? 'Yes' : 'No'}</p>
                        {task.priority !== undefined && (
                          <p>Priority: {task.priority}</p>
                        )}
                        {task.startTime && (
                          <p>Start: {task.startTime.toLocaleString()}</p>
                        )}
                        {task.deadline && (
                          <p>Deadline: {task.deadline.toLocaleString()}</p>
                        )}
                        {task.dependencies.length > 0 && (
                          <p>Dependencies: {task.dependencies.join(', ')}</p>
                        )}
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default ResourceTimeline;