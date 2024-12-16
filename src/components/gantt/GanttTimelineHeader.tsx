import { format, addDays, startOfWeek, endOfWeek } from 'date-fns';

interface GanttTimelineHeaderProps {
  startDate: Date;
  endDate: Date;
  zoomLevel: number;
  viewMode: 'day' | 'week' | 'month';
}

const GanttTimelineHeader = ({ startDate, endDate, zoomLevel, viewMode }: GanttTimelineHeaderProps) => {
  const getTimelineHeaders = () => {
    const headers = [];
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      let label: string;
      let width: number;
      
      switch (viewMode) {
        case 'day':
          label = format(currentDate, 'MMM d');
          width = 24 / zoomLevel;
          currentDate = addDays(currentDate, 1);
          break;
        case 'week':
          const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
          const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
          label = `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d')}`;
          width = (7 * 24) / zoomLevel; // 7 days * 24 hours
          currentDate = addDays(currentDate, 7);
          break;
        case 'month':
          label = format(currentDate, 'MMM yyyy');
          width = getDaysInMonth(currentDate) * 24 / zoomLevel;
          currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
          break;
      }
      
      headers.push(
        <div
          key={currentDate.toISOString()}
          className="border-r border-gantt-grid px-2 py-1 text-sm font-medium whitespace-nowrap"
          style={{ width: `${width}px`, minWidth: `${width}px` }}
        >
          {label}
        </div>
      );
    }
    return headers;
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  return (
    <div className="sticky top-0 z-10 flex bg-white border-b min-w-full">
      {getTimelineHeaders()}
    </div>
  );
};

export default GanttTimelineHeader;