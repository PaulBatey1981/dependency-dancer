import { useState, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import TaskHierarchy from './TaskHierarchy';
import GanttTimeline from './GanttTimeline';
import GanttControls from './GanttControls';
import { SimpleTask } from './types/gantt';
import { ViewMode, getTimelineConfig, getTimelineWidth, getTimeMarkers } from './utils/viewModeUtils';

const SimpleGanttChart = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [viewStart, setViewStart] = useState(new Date());
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const taskListRef = useRef<HTMLDivElement>(null);
  const [tasks, setTasks] = useState<SimpleTask[]>([
    {
      id: 'lineitem1',
      name: 'MWB Production',
      startTime: new Date('2024-03-20T09:00:00'),
      duration: 9,
      type: 'lineitem',
      children: ['task1', 'task2', 'task3'],
      isExpanded: true
    },
    {
      id: 'task1',
      name: 'Print Materials',
      startTime: new Date('2024-03-20T09:00:00'),
      duration: 2,
      type: 'task',
      parentId: 'lineitem1',
      isFixed: true,
      children: ['element1', 'element2'],
      isExpanded: true
    },
    {
      id: 'element1',
      name: 'Setup Printer',
      startTime: new Date('2024-03-20T09:00:00'),
      duration: 0.5,
      type: 'task',
      parentId: 'task1'
    },
    {
      id: 'element2',
      name: 'Print Run',
      startTime: new Date('2024-03-20T09:30:00'),
      duration: 1.5,
      type: 'task',
      parentId: 'task1',
      dependencies: ['element1']
    },
    {
      id: 'task2',
      name: 'Cut Boards',
      startTime: new Date('2024-03-20T08:00:00'),
      duration: 3,
      type: 'task',
      parentId: 'lineitem1',
      dependencies: ['task1'],
      children: ['element3', 'element4'],
      isExpanded: true
    },
    {
      id: 'element3',
      name: 'Machine Setup',
      startTime: new Date('2024-03-20T08:00:00'),
      duration: 1,
      type: 'task',
      parentId: 'task2'
    },
    {
      id: 'element4',
      name: 'Cutting Process',
      startTime: new Date('2024-03-20T09:00:00'),
      duration: 2,
      type: 'task',
      parentId: 'task2',
      dependencies: ['element3']
    },
    {
      id: 'task3',
      name: 'Assembly',
      startTime: new Date('2024-03-20T14:00:00'),
      duration: 4,
      type: 'task',
      parentId: 'lineitem1',
      dependencies: ['task2'],
      children: ['element5', 'element6'],
      isExpanded: true
    },
    {
      id: 'element5',
      name: 'Component Prep',
      startTime: new Date('2024-03-20T14:00:00'),
      duration: 1.5,
      type: 'task',
      parentId: 'task3'
    },
    {
      id: 'element6',
      name: 'Final Assembly',
      startTime: new Date('2024-03-20T15:30:00'),
      duration: 2.5,
      type: 'task',
      parentId: 'task3',
      dependencies: ['element5']
    },
    {
      id: 'lineitem2',
      name: 'HWB Production',
      startTime: new Date('2024-03-20T10:00:00'),
      duration: 7,
      type: 'lineitem',
      children: ['task4', 'task5'],
      isExpanded: true
    },
    {
      id: 'task4',
      name: 'Material Preparation',
      startTime: new Date('2024-03-20T10:00:00'),
      duration: 3,
      type: 'task',
      parentId: 'lineitem2',
      children: ['element7', 'element8'],
      isExpanded: true
    },
    {
      id: 'element7',
      name: 'Material Selection',
      startTime: new Date('2024-03-20T10:00:00'),
      duration: 1,
      type: 'task',
      parentId: 'task4'
    },
    {
      id: 'element8',
      name: 'Material Processing',
      startTime: new Date('2024-03-20T11:00:00'),
      duration: 2,
      type: 'task',
      parentId: 'task4',
      dependencies: ['element7']
    },
    {
      id: 'task5',
      name: 'Production Process',
      startTime: new Date('2024-03-20T13:00:00'),
      duration: 4,
      type: 'task',
      parentId: 'lineitem2',
      dependencies: ['task4'],
      children: ['element9', 'element10'],
      isExpanded: true
    },
    {
      id: 'element9',
      name: 'Initial Production',
      startTime: new Date('2024-03-20T13:00:00'),
      duration: 2,
      type: 'task',
      parentId: 'task5',
      children: ['subelement1', 'subelement2'],
      isExpanded: true
    },
    {
      id: 'subelement1',
      name: 'Setup Production Line',
      startTime: new Date('2024-03-20T13:00:00'),
      duration: 1,
      type: 'task',
      parentId: 'element9'
    },
    {
      id: 'subelement2',
      name: 'Run Production',
      startTime: new Date('2024-03-20T14:00:00'),
      duration: 1,
      type: 'task',
      parentId: 'element9',
      dependencies: ['subelement1']
    },
    {
      id: 'element10',
      name: 'Quality Check',
      startTime: new Date('2024-03-20T15:00:00'),
      duration: 2,
      type: 'task',
      parentId: 'task5',
      dependencies: ['element9'],
      children: ['subelement3', 'subelement4'],
      isExpanded: true
    },
    {
      id: 'subelement3',
      name: 'Visual Inspection',
      startTime: new Date('2024-03-20T15:00:00'),
      duration: 1,
      type: 'task',
      parentId: 'element10'
    },
    {
      id: 'subelement4',
      name: 'Quality Testing',
      startTime: new Date('2024-03-20T16:00:00'),
      duration: 1,
      type: 'task',
      parentId: 'element10',
      dependencies: ['subelement3']
    }
  ]);

  const timelineWidth = getTimelineWidth(viewMode);
  const timeMarkers = getTimeMarkers(viewStart, viewMode);

  const handleViewModeChange = (newMode: ViewMode) => {
    console.log('Changing view mode to:', newMode);
    setViewMode(newMode);
    setViewStart(getTimelineConfig(newMode).getStart(new Date()));
  };

  const snapToNow = () => {
    console.log('Snapping to now');
    if (scrollContainerRef.current) {
      setViewStart(getTimelineConfig(viewMode).getStart(new Date()));
      scrollContainerRef.current.scrollTo({
        left: timelineWidth / 2,
        behavior: 'smooth'
      });
    }
  };

  const toggleExpand = (taskId: string) => {
    console.log('Toggling task expansion:', taskId);
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { ...task, isExpanded: !task.isExpanded }
          : task
      )
    );
  };

  return (
    <div className="space-y-4 h-full">
      <GanttControls 
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        onSnapToNow={snapToNow}
      />
      
      <div className="h-full border rounded-lg">
        <div className="grid grid-cols-[300px,1fr] h-full">
          {/* Task List */}
          <div className="min-w-[300px] border-r">
            <div 
              ref={taskListRef}
              className="h-full overflow-y-auto"
            >
              {tasks.map(task => (
                <TaskHierarchy
                  key={task.id}
                  task={task}
                  level={0}
                  onToggleExpand={toggleExpand}
                  getChildTasks={(parentId) => tasks.filter(t => t.parentId === parentId)}
                />
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div 
            ref={scrollContainerRef}
            className="overflow-auto"
            onScroll={(e) => {
              if (taskListRef.current) {
                taskListRef.current.scrollTop = e.currentTarget.scrollTop;
              }
            }}
          >
            <div
              style={{ 
                width: `${timelineWidth}px`,
                minWidth: '100%'
              }}
            >
              <GanttTimeline 
                tasks={tasks}
                viewMode={viewMode}
                viewStart={viewStart}
                timeMarkers={timeMarkers}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleGanttChart;
