import { useState, useEffect } from 'react';
import { rescheduleAll } from '@/utils/scheduling';
import { toast } from '@/components/ui/use-toast';
import { useScheduleData } from '@/hooks/useScheduleData';
import { saveTasks } from '@/services/taskService';
import ScheduleHeader from '@/components/schedule/ScheduleHeader';
import ScheduleContent from '@/components/schedule/ScheduleContent';
import LoadingSpinner from '@/components/schedule/LoadingSpinner';

const Index = () => {
  const [view, setView] = useState<'list' | 'resource' | 'gantt' | 'simple-gantt'>('list');
  const { tasks, resources, isLoading, loadInitialData, setTasks } = useScheduleData();

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleReschedule = async () => {
    try {
      const scheduledTasks = rescheduleAll(tasks);
      await saveTasks(scheduledTasks);
      setTasks(scheduledTasks);
      toast({
        title: "Schedule updated",
        description: "All tasks have been rescheduled successfully.",
      });
    } catch (error) {
      console.error('Scheduling error:', error);
      toast({
        title: "Scheduling error",
        description: "Failed to update schedule. Please check task dependencies.",
        variant: "destructive",
      });
    }
  };

  const toggleFixTask = async (taskId: string) => {
    try {
      const updatedTasks = tasks.map(task => 
        task.id === taskId
          ? { ...task, is_fixed: !task.is_fixed }
          : task
      );
      await saveTasks(updatedTasks);
      setTasks(updatedTasks);
    } catch (error) {
      console.error('Error toggling task fix status:', error);
      toast({
        title: "Error",
        description: "Failed to update task status. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto py-8 min-h-screen flex flex-col">
      <ScheduleHeader 
        view={view}
        setView={setView}
        onReschedule={handleReschedule}
      />
      <ScheduleContent 
        view={view}
        tasks={tasks}
        resources={resources}
        onToggleFixed={toggleFixTask}
      />
    </div>
  );
};

export default Index;