import { Button } from '@/components/ui/button';
import { Settings, LayoutGrid, GanttChart as GanttIcon, Trees } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ScheduleHeaderProps {
  view: 'list' | 'resource' | 'gantt' | 'simple-gantt';
  setView: (view: 'list' | 'resource' | 'gantt' | 'simple-gantt') => void;
  onReschedule: () => void;
}

const ScheduleHeader = ({ view, setView, onReschedule }: ScheduleHeaderProps) => {
  const navigate = useNavigate();

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Magnetic Wrap Box Production Schedule</h1>
        <div className="flex gap-4">
          <div className="flex gap-2">
            <Button
              variant={view === 'list' ? 'default' : 'outline'}
              onClick={() => setView('list')}
            >
              <LayoutGrid className="w-4 h-4 mr-2" />
              List
            </Button>
            <Button
              variant={view === 'resource' ? 'default' : 'outline'}
              onClick={() => setView('resource')}
            >
              <LayoutGrid className="w-4 h-4 mr-2" />
              Resources
            </Button>
            <Button
              variant={view === 'gantt' ? 'default' : 'outline'}
              onClick={() => setView('gantt')}
            >
              <GanttIcon className="w-4 h-4 mr-2" />
              Gantt
            </Button>
            <Button
              variant={view === 'simple-gantt' ? 'default' : 'outline'}
              onClick={() => setView('simple-gantt')}
            >
              <GanttIcon className="w-4 h-4 mr-2" />
              Simple Gantt
            </Button>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/visualization')} variant="outline">
              <Trees className="w-4 h-4 mr-2" />
              Task Visualization
            </Button>
            <Button onClick={() => navigate('/settings')} variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Line Item Settings
            </Button>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <Button onClick={onReschedule} className="mr-4">
          Reschedule Tasks
        </Button>
      </div>
    </>
  );
};

export default ScheduleHeader;