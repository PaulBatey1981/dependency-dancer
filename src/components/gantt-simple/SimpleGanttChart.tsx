import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SimpleTask } from './types';
import TaskList from './components/TaskList';
import TimelineHeader from './components/TimelineHeader';
import GanttControls from './GanttControls';
import { ViewMode, getTimelineConfig } from './utils/viewModeUtils';

const SimpleGanttChart = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [viewStart, setViewStart] = useState(new Date());
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [tasks] = useState<SimpleTask[]>([
    {
      id: 'lineitem1',
      name: 'MWB Production',
      startTime: new Date('2024-03-20T09:00:00'),
      duration: 9,
      type: 'lineitem',
      children: ['task1', 'task2'],
      isExpanded: true
    },
    {
      id: 'task1',
      name: 'Print Materials',
      startTime: new Date('2024-03-20T09:00:00'),
      duration: 2,
      type: 'task',
      parentId: 'lineitem1'
    },
    {
      id: 'task2',
      name: 'Assembly',
      startTime: new Date('2024-03-20T11:00:00'),
      duration: 4,
      type: 'task',
      parentId: 'lineitem1'
    }
  ]);

  const timelineConfig = getTimelineConfig(viewMode);
  const timelineWidth = timelineConfig.pixelsPerUnit * timelineConfig.unitsInView;

  const handleViewModeChange = (newMode: ViewMode) => {
    console.log('Changing view mode to:', newMode);
    setViewMode(newMode);
    setViewStart(timelineConfig.getStart(new Date()));
  };

  const toggleExpand = (taskId: string) => {
    console.log('Toggling task expansion:', taskId);
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <div className="space-y-4 h-full">
      <GanttControls
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        onSnapToNow={() => {
          setViewStart(new Date());
        }}
      />
      
      <div className="h-[calc(100vh-12rem)] border rounded-lg">
        <div className="grid grid-cols-[300px,1fr] h-full">
          {/* Task List */}
          <div className="min-w-[300px] border-r">
            <ScrollArea className="h-full">
              <TaskList
                tasks={tasks}
                onToggleExpand={toggleExpand}
                expandedItems={expandedItems}
              />
            </ScrollArea>
          </div>

          {/* Timeline */}
          <div className="overflow-hidden">
            <TimelineHeader
              viewStart={viewStart}
              viewMode={viewMode}
              timelineWidth={timelineWidth}
            />
            <ScrollArea className="h-[calc(100%-2rem)]">
              <div
                style={{ 
                  width: `${timelineWidth}px`,
                  minWidth: '100%',
                  height: '100%',
                  position: 'relative'
                }}
              >
                {tasks.map(task => (
                  <div
                    key={task.id}
                    className="absolute h-8 bg-blue-500 rounded"
                    style={{
                      left: `${(task.startTime.getTime() - viewStart.getTime()) / (1000 * 60 * 60) * timelineConfig.pixelsPerUnit}px`,
                      width: `${task.duration * timelineConfig.pixelsPerUnit}px`,
                      top: `${tasks.indexOf(task) * 40 + 4}px`
                    }}
                  >
                    <span className="text-white text-sm px-2 truncate">
                      {task.name}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleGanttChart;