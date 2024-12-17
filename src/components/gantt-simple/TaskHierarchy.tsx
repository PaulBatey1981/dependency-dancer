import React from 'react';
import { SimpleTask } from './types';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TaskHierarchyProps {
  task: SimpleTask;
  level: number;
  onToggleExpand: (taskId: string) => void;
  getChildTasks: (parentId: string) => SimpleTask[];
}

const TaskHierarchy: React.FC<TaskHierarchyProps> = ({
  task,
  level,
  onToggleExpand,
  getChildTasks,
}) => {
  const childTasks = getChildTasks(task.id);
  const hasChildren = childTasks.length > 0;

  const getTaskDot = (type: SimpleTask['type']) => {
    const baseClasses = "w-2 h-2 rounded-full inline-block mr-2";
    switch (type) {
      case 'lineitem':
        return `${baseClasses} bg-blue-500`;
      case 'task':
        return `${baseClasses} bg-teal-500`;
      default:
        return `${baseClasses} bg-gray-500`;
    }
  };

  return (
    <div>
      <div 
        className="flex items-center py-2 hover:bg-gray-50 transition-colors"
        style={{ paddingLeft: `${level * 1.5 + 0.5}rem` }}
      >
        {hasChildren ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 p-0 hover:bg-gray-100"
            onClick={() => onToggleExpand(task.id)}
          >
            {task.isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        ) : (
          <div className="w-6" />
        )}
        <span className={getTaskDot(task.type)} />
        <span className="text-sm">{task.name}</span>
      </div>
      
      {task.isExpanded && hasChildren && (
        <div className="animate-task-appear">
          {childTasks.map(childTask => (
            <TaskHierarchy
              key={childTask.id}
              task={childTask}
              level={level + 1}
              onToggleExpand={onToggleExpand}
              getChildTasks={getChildTasks}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskHierarchy;