import { useState } from 'react';
import { Task, Resource } from '@/types/scheduling';
import { rescheduleAll } from '@/utils/scheduling';
import TaskList from '@/components/TaskList';
import ResourceTimeline from '@/components/ResourceTimeline';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      name: 'Line Item A',
      type: 'lineitem',
      resource: 'machine1',
      duration: 4,
      status: 'pending',
      dependencies: [],
    },
    {
      id: '2',
      name: 'Component B',
      type: 'component',
      resource: 'machine2',
      duration: 2,
      status: 'pending',
      dependencies: ['1'],
    },
    {
      id: '3',
      name: 'Element C',
      type: 'element',
      resource: 'machine1',
      duration: 3,
      status: 'pending',
      dependencies: ['2'],
    },
  ]);

  const resources: Resource[] = [
    { id: 'machine1', name: 'Machine 1', capacity: 1 },
    { id: 'machine2', name: 'Machine 2', capacity: 1 },
  ];

  const handleReschedule = () => {
    try {
      const scheduledTasks = rescheduleAll(tasks);
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

  const toggleFixTask = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId
        ? { ...task, status: task.status === 'fixed' ? 'scheduled' : 'fixed' }
        : task
    ));
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Production Schedule</h1>
      
      <div className="mb-6">
        <Button onClick={handleReschedule} className="mr-4">
          Reschedule Tasks
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Tasks</h2>
          <TaskList tasks={tasks} onToggleFixed={toggleFixTask} />
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">Resource Timeline</h2>
          <ResourceTimeline tasks={tasks} resources={resources} />
        </div>
      </div>
    </div>
  );
};

export default Index;