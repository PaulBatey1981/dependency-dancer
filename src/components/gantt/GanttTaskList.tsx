import { Task } from '@/types/scheduling';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { topologicalSort } from '@/utils/topologicalSort';

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
    console.log(`Getting children for task ${parentId}`);
    const parentTask = tasks.find(t => t.id === parentId);
    if (!parentTask) {
      console.log(`Parent task ${parentId} not found`);
      return [];
    }
    const children = tasks.filter(task => parentTask.dependencies.includes(task.id));
    console.log(`Found ${children.length} children for task ${parentId}:`, children.map(c => c.id));
    return topologicalSort(children);
  };

  const renderTask = (task: Task, level: number = 0) => {
    const childTasks = getChildTasks(task.id);
    const hasChildren = childTasks.length > 0;
    const isExpanded = expandedItems.has(task.id);

    console.log(`Rendering task ${task.id}, expanded: ${isExpanded}, children: ${childTasks.length}, type: ${task.type}`);

    return (
      <div key={task.id}>
        <div 
          className="flex items-center py-2 px-2 hover:bg-gray-50 group"
          style={{ paddingLeft: `${level * 1.5 + 0.5}rem` }}
        >
          <div className="flex items-center flex-1">
            {hasChildren && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  console.log(`Toggling expansion for task ${task.id}`);
                  toggleExpand(task.id);
                }}
              >
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </Button>
            )}
            {!hasChildren && <div className="w-6" />}
            <div className={`w-3 h-3 rounded-full ${getTaskColor(task.type)} mx-2 flex-shrink-0`} />
            <span className="text-sm truncate">{task.name}</span>
          </div>
        </div>
        {isExpanded && hasChildren && (
          <div className="animate-task-appear">
            {childTasks.map(childTask => renderTask(childTask, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // Get all line items (top-level tasks) and sort them
  const lineItems = topologicalSort(tasks.filter(task => task.type === 'lineitem'));
  console.log(`Found ${lineItems.length} line items`);

  return (
    <div className="min-h-full bg-white pt-8">
      {lineItems.map(task => renderTask(task))}
    </div>
  );
};

export default GanttTaskList;