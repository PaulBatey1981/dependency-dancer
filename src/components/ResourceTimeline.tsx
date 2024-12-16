import { Task, Resource } from '@/types/scheduling';
import { Card } from '@/components/ui/card';

interface ResourceTimelineProps {
  tasks: Task[];
  resources: Resource[];
}

const ResourceTimeline = ({ tasks, resources }: ResourceTimelineProps) => {
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

  return (
    <div className="space-y-6">
      {resources.map(resource => (
        <Card key={resource.id} className="p-4">
          <h3 className="font-semibold mb-2">{resource.name}</h3>
          <div className="relative h-20 bg-gray-100 rounded">
            {tasks
              .filter(task => task.resource === resource.id && task.startTime)
              .map(task => (
                <div
                  key={task.id}
                  className={`absolute h-16 mt-2 rounded ${getTaskColor(
                    task.type
                  )} opacity-80 ${
                    task.status === 'fixed' ? 'border-2 border-task-fixed' : ''
                  }`}
                  style={{
                    left: '0%',
                    width: `${(task.duration / 24) * 100}%`,
                  }}
                >
                  <span className="text-xs text-white p-1 truncate block">
                    {task.name}
                  </span>
                </div>
              ))}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ResourceTimeline;