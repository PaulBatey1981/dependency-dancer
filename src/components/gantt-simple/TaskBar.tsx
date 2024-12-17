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
  position: number; // Horizontal position in %
  width: number; // Task bar width in %
  rowIndex: number; // Index of the row
  level: number; // Indentation level
  onToggleExpand: (taskId: string) => void;
}

const TaskBar = ({
  task,
  position,
  width,
  rowIndex,
  level,
  onToggleExpand,
}: TaskBarProps) => {
  const hasChildren = task.children && task.children.length > 0;

  // Calculated task styles
  const taskStyles: React.CSSProperties = {
    position: 'absolute',
    left: `${position + level * INDENT_WIDTH}px`,
    top: `${rowIndex * ROW_HEIGHT}px`,
    width: `${width}%`,
    height: `${TASK_HEIGHT}px`,
    lineHeight: `${TASK_HEIGHT}px`,
    backgroundColor: task.type === 'lineitem' 
      ? COLORS.lineItemBg 
      : task.isFixed 
        ? COLORS.fixedTaskBg 
        : COLORS.taskBg,
    color: task.type === 'lineitem' ? COLORS.lineItemText : COLORS.taskText,
    border: task.isFixed ? `1px solid ${COLORS.fixedTaskBorder}` : 'none',
    fontWeight: task.type === 'lineitem' ? 600 : 'normal',
    borderRadius: '4px',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  };

  return (
    <HoverCard>
      <HoverCardTrigger>
        <div className="transition-opacity hover:opacity-90" style={taskStyles}>
          <div className="flex items-center justify-between h-full px-2 py-0">
            {/* Expand/Collapse Button */}
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

            {/* Task Name */}
            <span className="truncate">{task.name}</span>

            {/* Lock Icon for Fixed Tasks */}
            {task.isFixed && (
              <Lock className="w-4 h-4 text-blue-500 flex-shrink-0" />
            )}
          </div>
        </div>
      </HoverCardTrigger>

      {/* Hover Card Content */}
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