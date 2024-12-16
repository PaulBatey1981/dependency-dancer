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

  return (
    <div className="space-y-4">
      {tasks.map(task => (
        <Card
          key={task.id}
          className={`p-4 animate-task-appear ${
            task.status === 'fixed' ? 'border-task-fixed border-2' : ''
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
              className={task.status === 'fixed' ? 'text-task-fixed' : ''}
            >
              {task.status === 'fixed' ? <Lock /> : <Unlock />}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default TaskList;