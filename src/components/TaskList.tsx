import { Task } from '@/types/scheduling';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Lock, Unlock } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  onToggleFixed: (taskId: string) => void;
}

const TaskList = ({ tasks, onToggleFixed }: TaskListProps) => {
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

  const getStatusBadgeColor = (status: Task['status']) => {
    switch (status) {
      case 'wip':
        return 'bg-blue-100 text-blue-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'on_hold':
        return 'bg-orange-100 text-orange-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {tasks.map(task => (
        <Card
          key={task.id}
          className={`p-4 animate-task-appear ${
            task.isFixed ? 'border-task-fixed border-2' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${getTaskColor(task.type)}`}
                />
                <h3 className="font-semibold">{task.name}</h3>
                {task.priority !== undefined && (
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                    Priority: {task.priority}
                  </span>
                )}
                <span className={`text-xs px-2 py-1 rounded ${getStatusBadgeColor(task.status)}`}>
                  {task.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                Duration: {task.duration}h | Resource: {task.resource}
              </p>
              {task.startTime && (
                <p className="text-sm text-gray-500">
                  Start: {task.startTime.toLocaleString()}
                </p>
              )}
              {task.deadline && (
                <p className="text-sm text-gray-500">
                  Deadline: {task.deadline.toLocaleString()}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onToggleFixed(task.id)}
              className={task.isFixed ? 'text-task-fixed' : ''}
            >
              {task.isFixed ? <Lock /> : <Unlock />}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default TaskList;