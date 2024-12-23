import { SimpleTask } from './types';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { COLORS } from './constants';

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

  console.log(`Rendering TaskHierarchy for task ${task.id} (${task.name})`);
  console.log(`Level: ${level}, Has children: ${hasChildren}`);
  console.log('Child tasks:', childTasks.map(t => ({ id: t.id, name: t.name })));

  const getTaskDot = (type: SimpleTask['type']) => {
    const baseClasses = "w-2 h-2 rounded-full inline-block mr-2";
    switch (type) {
      case 'lineitem':
        return `${baseClasses} ${COLORS.taskDots.level0}`;
      case 'component':
        return `${baseClasses} ${COLORS.taskDots.level1}`;
      case 'element':
        return `${baseClasses} ${COLORS.taskDots.level2}`;
      default:
        return `${baseClasses} ${COLORS.taskDots.level3}`;
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
        <span className="text-sm whitespace-nowrap overflow-hidden truncate flex-1">
          {task.name}
        </span>
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