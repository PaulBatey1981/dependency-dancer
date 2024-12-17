import React from 'react';
import { SimpleTask } from '../types';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TaskListProps {
  tasks: SimpleTask[];
  onToggleExpand: (taskId: string) => void;
  expandedItems: Set<string>;
}

const TaskList = ({ tasks, onToggleExpand, expandedItems }: TaskListProps) => {
  const renderTask = (task: SimpleTask, level: number = 0) => {
    const hasChildren = task.children && task.children.length > 0;
    const isExpanded = expandedItems.has(task.id);

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
                onClick={() => onToggleExpand(task.id)}
              >
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </Button>
            )}
            {!hasChildren && <div className="w-6" />}
            <span className="text-sm truncate">{task.name}</span>
          </div>
        </div>
        {isExpanded && hasChildren && (
          <div>
            {tasks
              .filter(t => task.children?.includes(t.id))
              .map(childTask => renderTask(childTask, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const rootTasks = tasks.filter(task => !task.parentId);
  
  return (
    <div className="min-h-full bg-white pt-8">
      {rootTasks.map(task => renderTask(task))}
    </div>
  );
};

export default TaskList;