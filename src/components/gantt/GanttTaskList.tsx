import { Task } from '@/types/scheduling';
import { ChevronRight, ChevronDown } from 'lucide-react';

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
    const hasChildren = getChildTasks(task.id).length > 0;
    const isExpanded = expandedItems.has(task.id);

    return (
      <div key={task.id}>
        <div 
          className={`flex items-center py-2 ${level > 0 ? 'pl-6' : ''}`}
          style={{ paddingLeft: `${level * 1.5}rem` }}
        >
          {hasChildren && (
            <button
              onClick={() => toggleExpand(task.id)}
              className="mr-2 p-1 hover:bg-gray-100 rounded"
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          )}
          <div className={`w-3 h-3 rounded-full ${getTaskColor(task.type)} mr-2`} />
          <span className="font-medium">{task.name}</span>
        </div>
        {isExpanded && getChildTasks(task.id).map(childTask => renderTask(childTask, level + 1))}
      </div>
    );
  };

  // Get all line items (top-level tasks)
  const lineItems = tasks.filter(task => task.type === 'lineitem');

  return (
    <div className="w-64 border-r bg-white">
      {lineItems.map(task => renderTask(task))}
    </div>
  );
};

export default GanttTaskList;