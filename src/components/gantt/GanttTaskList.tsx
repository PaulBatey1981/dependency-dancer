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

    console.log(`Rendering task ${task.id}:`, {
      hasChildren,
      isExpanded,
      childCount: childTasks.length
    });

    return (
      <div key={task.id} className="animate-task-appear">
        <div 
          className="flex items-center py-2 px-2 hover:bg-gray-50 cursor-pointer"
          style={{ paddingLeft: `${level * 1.5 + 0.5}rem` }}
          onClick={() => hasChildren && toggleExpand(task.id)}
        >
          {hasChildren && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </Button>
          )}
          {!hasChildren && <div className="w-6" />}
          <div className={`w-3 h-3 rounded-full ${getTaskColor(task.type)} mx-2 flex-shrink-0`} />
          <span className="text-sm truncate">{task.name}</span>
        </div>
        {isExpanded && childTasks.map(childTask => renderTask(childTask, level + 1))}
      </div>
    );
  };

  // Get all line items (top-level tasks)
  const lineItems = tasks.filter(task => task.type === 'lineitem');

  console.log('Line items:', lineItems.length);
  console.log('Expanded items:', Array.from(expandedItems));

  return (
    <div className="min-h-full bg-white">
      {lineItems.map(task => renderTask(task))}
    </div>
  );
};

export default GanttTaskList;