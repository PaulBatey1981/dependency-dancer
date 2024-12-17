import React from 'react';
import { Lock, ChevronRight, ChevronDown } from 'lucide-react';
import { SimpleTask } from './types';
import { COLORS, TASK_HEIGHT, ROW_HEIGHT, INDENT_WIDTH } from './constants';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Button } from '@/components/ui/button';

interface TaskBarProps {
  task: SimpleTask;
  position: number;
  width: number;
  verticalPosition: number;
  level: number;
  onToggleExpand: (taskId: string) => void;
}

const TaskBar = ({
  task,
  position,
  width,
  verticalPosition,
  level,
  onToggleExpand,
}: TaskBarProps) => {
  console.log(`Rendering task ${task.id} at position ${position}`);

  const hasChildren = task.children && task.children.length > 0;

  const getTaskStyles = () => {
    const baseStyles = {
      left: task.type === 'task' ? `${position}%` + (level * INDENT_WIDTH) + 'px' : 0,
      top: verticalPosition + (ROW_HEIGHT - TASK_HEIGHT) / 2, // Center the task vertically within ROW_HEIGHT
      width: task.type === 'task' ? `${width}%` : '100%',
      height: `${TASK_HEIGHT}px`, // Explicitly set height in pixels
    };

    if (task.type === 'lineitem') {
      return {
        ...baseStyles,
        backgroundColor: COLORS.lineItemBg,
        color: COLORS.lineItemText,
        fontWeight: 600,
        paddingLeft: '0.5rem',
      };
    }

    return {
      ...baseStyles,
      backgroundColor: task.isFixed ? COLORS.fixedTaskBg : COLORS.taskBg,
      border: task.isFixed ? `1px solid ${COLORS.fixedTaskBorder}` : 'none',
      color: task.isFixed ? COLORS.lineItemText : COLORS.taskText,
    };
  };

  return (
    <HoverCard>
      <HoverCardTrigger>
        <div
          className="absolute rounded-sm transition-colors hover:opacity-90 border border-red-200"
          style={getTaskStyles()}
        >
          <div className="flex items-center justify-between h-full">
            <div className="flex items-center gap-2 px-2">
              {hasChildren && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleExpand(task.id);
                  }}
                >
                  {task.isExpanded ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                </Button>
              )}
              <span className="truncate">{task.name}</span>
            </div>
            {task.isFixed && (
              <Lock className="w-4 h-4 text-blue-500 flex-shrink-0 mr-2" />
            )}
          </div>
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-64">
        <div className="space-y-2">
          <h4 className="font-semibold">{task.name}</h4>
          <div className="text-sm space-y-1">
            <p>Type: {task.type}</p>
            <p>Duration: {task.duration}h</p>
            <p>Start: {task.startTime.toLocaleString()}</p>
            {task.isFixed && (
              <p className="text-blue-500 font-medium">Fixed Task</p>
            )}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default TaskBar;