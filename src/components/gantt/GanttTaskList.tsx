import { Task } from '@/types/scheduling';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GanttTaskListProps {
  tasks: Task[];
  expandedItems: Set<string>;
  toggleExpand: (taskId: string) => void;
}

const GanttTaskList = ({ tasks, expandedItems, toggleExpand }: GanttTaskListProps) => {
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

  const getChildTasks = (parentId: string): Task[] => {
    return tasks.filter(task => task.dependencies.includes(parentId));
  };

  const renderTask = (task: Task, level: number = 0) => {
    const childTasks = getChildTasks(task.id);
    const hasChildren = childTasks.length > 0;
    const isExpanded = expandedItems.has(task.id);

    return (
      <div key={task.id}>
        <div 
          className="flex items-center py-2 px-2 hover:bg-gray-50 cursor-pointer group"
          style={{ paddingLeft: `${level * 1.5 + 0.5}rem` }}
          onClick={() => hasChildren && toggleExpand(task.id)}
        >
          <div className="flex items-center flex-1">
            {hasChildren ? (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100"
              >
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </Button>
            ) : (
              <div className="w-6" />
            )}
            <div className={`w-3 h-3 rounded-full ${getTaskColor(task.type)} mx-2 flex-shrink-0`} />
            <span className="text-sm truncate">{task.name}</span>
          </div>
        </div>
        {isExpanded && (
          <div className="animate-task-appear">
            {childTasks.map(childTask => renderTask(childTask, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // Get all line items (top-level tasks)
  const lineItems = tasks.filter(task => task.type === 'lineitem');

  return (
    <div className="min-h-full bg-white">
      {lineItems.map(task => renderTask(task))}
    </div>
  );
};

export default GanttTaskList;