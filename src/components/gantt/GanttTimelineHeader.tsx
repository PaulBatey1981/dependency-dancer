import { format } from 'date-fns';

interface GanttTimelineHeaderProps {
  startDate: Date;
  endDate: Date;
  zoomLevel: number;
  viewMode: 'day' | 'month';
}

const GanttTimelineHeader = ({ startDate, endDate, zoomLevel, viewMode }: GanttTimelineHeaderProps) => {
  const getTimelineHeaders = () => {
    const headers = [];
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const label = viewMode === 'day' 
        ? format(currentDate, 'MMM d')
        : format(currentDate, 'MMM yyyy');
      
      const width = viewMode === 'day'
        ? 24 / zoomLevel // 24 hours
        : getDaysInMonth(currentDate) * 24 / zoomLevel;
      
      headers.push(
        <div
          key={currentDate.toISOString()}
          className="border-r border-gantt-grid px-2 py-1 text-sm font-medium"
          style={{ width: `${width}px` }}
        >
          {label}
        </div>
      );

      // Move to next day or month
      currentDate = viewMode === 'day'
        ? new Date(currentDate.setDate(currentDate.getDate() + 1))
        : new Date(currentDate.setMonth(currentDate.getMonth() + 1));
    }
    return headers;
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  return (
    <div className="sticky top-0 z-10 flex bg-white border-b">
      {getTimelineHeaders()}
    </div>
  );
};

export default GanttTimelineHeader;