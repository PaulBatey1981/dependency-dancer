import { useState, useRef, useEffect } from 'react';
import { Task, Resource } from '@/types/scheduling';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowRight } from 'lucide-react';
import GanttTaskList from './gantt/GanttTaskList';
import GanttTimeline from './gantt/GanttTimeline';
import GanttTimelineHeader from './gantt/GanttTimelineHeader';

interface GanttChartProps {
  tasks: Task[];
  resources: Resource[];
}

const GanttChart = ({ tasks }: GanttChartProps) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const timelineRef = useRef<HTMLDivElement>(null);
  const taskListRef = useRef<HTMLDivElement>(null);

  const toggleExpand = (taskId: string) => {
    console.log('Toggling task:', taskId);
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedItems(newExpanded);
    console.log('New expanded items:', Array.from(newExpanded));
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

  // Synchronize vertical scrolling between task list and timeline
  useEffect(() => {
    const taskListElement = taskListRef.current;
    const timelineElement = timelineRef.current;

    if (!taskListElement || !timelineElement) return;

    const handleTaskListScroll = () => {
      if (timelineElement) {
        timelineElement.scrollTop = taskListElement.scrollTop;
      }
    };

    const handleTimelineScroll = () => {
      if (taskListElement) {
        taskListElement.scrollTop = timelineElement.scrollTop;
      }
    };

    taskListElement.addEventListener('scroll', handleTaskListScroll);
    timelineElement.addEventListener('scroll', handleTimelineScroll);

    return () => {
      taskListElement.removeEventListener('scroll', handleTaskListScroll);
      timelineElement.removeEventListener('scroll', handleTimelineScroll);
    };
  }, []);

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

  useEffect(() => {
    if (timelineRef.current && tasks.length > 0) {
      const tasksWithStartTime = tasks.filter(t => t.startTime);
      if (tasksWithStartTime.length > 0) {
        timelineRef.current.scrollLeft = 0;
      }
    }
  }, [tasks]);

  if (!tasks.length) return null;

  const earliestStart = new Date(Math.min(...tasks.filter(t => t.startTime).map(t => t.startTime!.getTime())));
  const latestEnd = new Date(Math.max(...tasks.filter(t => t.startTime).map(t => 
    new Date(t.startTime!.getTime() + t.duration * 3600000).getTime()
  )));

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="space-x-2">
          <Button
            variant={viewMode === 'day' ? 'default' : 'outline'}
            onClick={() => setViewMode('day')}
          >
            Daily View
          </Button>
          <Button
            variant={viewMode === 'week' ? 'default' : 'outline'}
            onClick={() => setViewMode('week')}
          >
            Weekly View
          </Button>
          <Button
            variant={viewMode === 'month' ? 'default' : 'outline'}
            onClick={() => setViewMode('month')}
          >
            Monthly View
          </Button>
        </div>
        <Button onClick={snapToNow} className="flex items-center gap-2">
          <ArrowRight size={16} />
          Snap to Now (Ctrl+N)
        </Button>
      </div>

      <div className="flex flex-1 border rounded-lg overflow-hidden">
        <div className="w-64 flex-shrink-0 border-r">
          <div 
            ref={taskListRef} 
            className="h-full overflow-y-auto"
          >
            <GanttTaskList
              tasks={tasks}
              expandedItems={expandedItems}
              toggleExpand={toggleExpand}
            />
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="h-full">
            <GanttTimelineHeader
              startDate={earliestStart}
              endDate={latestEnd}
              zoomLevel={zoomLevel}
              viewMode={viewMode}
            />
            <div 
              className="overflow-auto h-[calc(100%-2rem)]"
              onWheel={handleWheel}
              ref={timelineRef}
            >
              <GanttTimeline
                tasks={tasks}
                zoomLevel={zoomLevel}
                viewMode={viewMode}
                earliestStart={earliestStart}
                expandedItems={expandedItems}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GanttChart;