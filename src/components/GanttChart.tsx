import { useState, useRef, useEffect } from 'react';
import { Task, Resource } from '@/types/scheduling';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronRight, ChevronDown, ArrowRight } from 'lucide-react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';

interface GanttChartProps {
  tasks: Task[];
  resources: Resource[];
}

const GanttChart = ({ tasks, resources }: GanttChartProps) => {
  const [zoomLevel, setZoomLevel] = useState(1); // hours per pixel
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const timelineRef = useRef<HTMLDivElement>(null);

  // Get all line items (top-level tasks)
  const lineItems = tasks.filter(task => task.type === 'lineitem');

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

  const toggleExpand = (taskId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedItems(newExpanded);
  };

  const getChildTasks = (parentId: string): Task[] => {
    return tasks.filter(task => task.dependencies.includes(parentId));
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const newZoom = Math.max(0.5, Math.min(2, zoomLevel + (e.deltaY > 0 ? 0.1 : -0.1)));
      setZoomLevel(newZoom);
    }
  };

  const snapToNow = () => {
    if (timelineRef.current) {
      const now = new Date();
      const earliestStart = new Date(Math.min(...tasks.filter(t => t.startTime).map(t => t.startTime!.getTime())));
      const hoursFromStart = (now.getTime() - earliestStart.getTime()) / (1000 * 60 * 60);
      const scrollPosition = (hoursFromStart / zoomLevel);
      timelineRef.current.scrollLeft = scrollPosition - timelineRef.current.clientWidth / 2;
    }
  };

  const calculateTaskPosition = (startTime: Date) => {
    const earliestStart = new Date(Math.min(...tasks.filter(t => t.startTime).map(t => t.startTime!.getTime())));
    const hoursFromStart = (startTime.getTime() - earliestStart.getTime()) / (1000 * 60 * 60);
    return `${hoursFromStart / zoomLevel}px`;
  };

  const calculateTaskWidth = (duration: number) => {
    return `${duration / zoomLevel}px`;
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

  const renderTimeline = () => {
    if (!tasks.length) return null;

    const earliestStart = new Date(Math.min(...tasks.filter(t => t.startTime).map(t => t.startTime!.getTime())));
    const latestEnd = new Date(Math.max(...tasks.filter(t => t.startTime).map(t => 
      new Date(t.startTime!.getTime() + t.duration * 3600000).getTime()
    )));
    const totalHours = (latestEnd.getTime() - earliestStart.getTime()) / (1000 * 60 * 60);
    const timelineWidth = totalHours / zoomLevel;

    return (
      <div 
        className="relative"
        style={{ width: `${timelineWidth}px`, height: '100%' }}
      >
        {/* Grid lines */}
        {Array.from({ length: Math.ceil(totalHours) }).map((_, i) => (
          <div
            key={i}
            className="absolute top-0 bottom-0 border-l border-gantt-grid"
            style={{ left: `${i / zoomLevel}px` }}
          />
        ))}

        {/* Today marker */}
        <div
          className="absolute top-0 bottom-0 w-px bg-blue-500"
          style={{
            left: calculateTaskPosition(new Date()),
          }}
        />

        {/* Tasks */}
        {tasks.map(task => task.startTime && (
          <HoverCard key={task.id}>
            <HoverCardTrigger>
              <div
                className={`absolute h-8 rounded ${getTaskColor(task.type)} opacity-80 cursor-pointer ${
                  task.isFixed ? 'border-2 border-task-fixed' : ''
                }`}
                style={{
                  left: calculateTaskPosition(task.startTime),
                  width: calculateTaskWidth(task.duration),
                  top: '0.5rem',
                }}
              >
                <span className="text-xs text-white p-1 truncate block">
                  {task.name}
                </span>
              </div>
            </HoverCardTrigger>
            <HoverCardContent>
              <div className="space-y-2">
                <h4 className="font-semibold">{task.name}</h4>
                <div className="text-sm">
                  <p>Type: {task.type}</p>
                  <p>Duration: {task.duration}h</p>
                  <p>Status: {task.status}</p>
                  {task.startTime && (
                    <p>Start: {task.startTime.toLocaleString()}</p>
                  )}
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        ))}
      </div>
    );
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'n' && e.ctrlKey) {
        e.preventDefault();
        snapToNow();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="space-x-2">
          <Button
            variant="outline"
            onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.1))}
          >
            Zoom In
          </Button>
          <Button
            variant="outline"
            onClick={() => setZoomLevel(prev => Math.min(2, prev + 0.1))}
          >
            Zoom Out
          </Button>
        </div>
        <Button onClick={snapToNow} className="flex items-center gap-2">
          <ArrowRight size={16} />
          Snap to Now (Ctrl+N)
        </Button>
      </div>

      <div className="flex flex-1 border rounded-lg overflow-hidden">
        {/* Task list */}
        <div className="w-64 border-r bg-white">
          <ScrollArea className="h-full">
            {lineItems.map(task => renderTask(task))}
          </ScrollArea>
        </div>

        {/* Timeline */}
        <div 
          className="flex-1 overflow-x-auto bg-white"
          onWheel={handleWheel}
          ref={timelineRef}
        >
          {renderTimeline()}
        </div>
      </div>
    </div>
  );
};

export default GanttChart;