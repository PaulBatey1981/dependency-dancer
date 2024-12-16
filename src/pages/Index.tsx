import { useState } from 'react';
import { Task, Resource } from '@/types/scheduling';
import { rescheduleAll } from '@/utils/scheduling';
import TaskList from '@/components/TaskList';
import ResourceTimeline from '@/components/ResourceTimeline';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const Index = () => {
  // Set base date for scheduling (2024-12-20 10:00:00 deadline)
  const baseDate = new Date('2024-12-20T10:00:00');
  const deadline = new Date(baseDate);
  
  // Helper function to create tasks with a prefix
  const createProductTasks = (prefix: string, deadline: Date) => [
    {
      id: `${prefix}_final_assembly`,
      name: `${prefix} - Final Assembly`,
      type: 'lineitem' as const,
      resource: 'bench',
      duration: 3,
      status: 'pending' as const,
      dependencies: [`${prefix}_wrap_case`, `${prefix}_wrap_base_tray`, `${prefix}_line_case`],
      priority: 3,
      deadline: deadline
    },
    {
      id: `${prefix}_wrap_case`,
      name: `${prefix} - Wrap Case`,
      type: 'component' as const,
      resource: 'gluing_machine',
      duration: 1.17,
      status: 'pending' as const,
      dependencies: [`${prefix}_case_wrap_cut`, `${prefix}_case_board_insert`, `${prefix}_case_liner_cut`],
    },
    {
      id: `${prefix}_line_case`,
      name: `${prefix} - Line Case`,
      type: 'component' as const,
      resource: 'gluing_machine',
      duration: 0.67,
      status: 'pending' as const,
      dependencies: [`${prefix}_wrap_case`],
    },
    {
      id: `${prefix}_case_wrap_print`,
      name: `${prefix} - Case Wrap Print`,
      type: 'element' as const,
      resource: 'konica',
      duration: 0.42,
      status: 'pending' as const,
      dependencies: [],
    },
    {
      id: `${prefix}_case_wrap_laminate`,
      name: `${prefix} - Case Wrap Laminate`,
      type: 'element' as const,
      resource: 'dk_europa',
      duration: 0.33,
      status: 'pending' as const,
      dependencies: [`${prefix}_case_wrap_print`],
    },
    {
      id: `${prefix}_case_wrap_cut`,
      name: `${prefix} - Case Wrap Cut`,
      type: 'element' as const,
      resource: 'zund_m800',
      duration: 0.33,
      status: 'pending' as const,
      dependencies: [`${prefix}_case_wrap_laminate`],
    },
    {
      id: `${prefix}_case_board_cut`,
      name: `${prefix} - Case Board Cut`,
      type: 'element' as const,
      resource: 'zund_m800',
      duration: 0.5,
      status: 'pending' as const,
      dependencies: [],
    },
    {
      id: `${prefix}_case_board_insert`,
      name: `${prefix} - Case Board Insert`,
      type: 'element' as const,
      resource: 'bench',
      duration: 0.5,
      status: 'pending' as const,
      dependencies: [`${prefix}_case_board_cut`],
    },
    {
      id: `${prefix}_case_liner_laminate`,
      name: `${prefix} - Case Liner Laminate`,
      type: 'element' as const,
      resource: 'dk_europa',
      duration: 0.33,
      status: 'pending' as const,
      dependencies: [],
    },
    {
      id: `${prefix}_case_liner_cut`,
      name: `${prefix} - Case Liner Cut`,
      type: 'element' as const,
      resource: 'zund_m800',
      duration: 0.33,
      status: 'pending' as const,
      dependencies: [`${prefix}_case_liner_laminate`],
    },
    {
      id: `${prefix}_wrap_base_tray`,
      name: `${prefix} - Wrap Base Tray`,
      type: 'component' as const,
      resource: 'gluing_machine',
      duration: 2,
      status: 'pending' as const,
      dependencies: [
        `${prefix}_base_tray_board_corner`,
        `${prefix}_base_tray_wrap_cut`,
        `${prefix}_base_tray_board_magnets`
      ],
    },
    {
      id: `${prefix}_base_tray_board_cut`,
      name: `${prefix} - Base Tray Board Cut`,
      type: 'element' as const,
      resource: 'zund_m800',
      duration: 1,
      status: 'pending' as const,
      dependencies: [],
    },
    {
      id: `${prefix}_base_tray_board_drill`,
      name: `${prefix} - Base Tray Board Drill`,
      type: 'element' as const,
      resource: 'magnet_drill',
      duration: 0.5,
      status: 'pending' as const,
      dependencies: [`${prefix}_base_tray_board_cut`],
    },
    {
      id: `${prefix}_base_tray_board_magnets`,
      name: `${prefix} - Base Tray Board Magnets`,
      type: 'element' as const,
      resource: 'bench',
      duration: 1,
      status: 'pending' as const,
      dependencies: [`${prefix}_base_tray_board_drill`],
    },
    {
      id: `${prefix}_base_tray_board_corner`,
      name: `${prefix} - Base Tray Board Corner`,
      type: 'element' as const,
      resource: 'corner_taper',
      duration: 0.5,
      status: 'pending' as const,
      dependencies: [`${prefix}_base_tray_board_magnets`],
    },
    {
      id: `${prefix}_base_tray_wrap_print`,
      name: `${prefix} - Base Tray Wrap Print`,
      type: 'element' as const,
      resource: 'konica',
      duration: 0.33,
      status: 'pending' as const,
      dependencies: [],
    },
    {
      id: `${prefix}_base_tray_wrap_laminate`,
      name: `${prefix} - Base Tray Wrap Laminate`,
      type: 'element' as const,
      resource: 'dk_europa',
      duration: 0.25,
      status: 'pending' as const,
      dependencies: [`${prefix}_base_tray_wrap_print`],
    },
    {
      id: `${prefix}_base_tray_wrap_cut`,
      name: `${prefix} - Base Tray Wrap Cut`,
      type: 'element' as const,
      resource: 'zund_m800',
      duration: 0.75,
      status: 'pending' as const,
      dependencies: [`${prefix}_base_tray_wrap_laminate`],
    }
  ];

  const [tasks, setTasks] = useState<Task[]>([
    ...createProductTasks('MWB1', deadline),
    ...createProductTasks('MWB2', deadline)
  ]);

  const resources: Resource[] = [
    { id: 'bench', name: 'Bench Work', capacity: 1 },
    { id: 'konica', name: 'Konica Printer', capacity: 1 },
    { id: 'dk_europa', name: 'D&K Europa', capacity: 1 },
    { id: 'zund_m800', name: 'Zund M800', capacity: 1 },
    { id: 'gluing_machine', name: 'Gluing Machine', capacity: 1 },
    { id: 'magnet_drill', name: 'Magnet Drill', capacity: 1 },
    { id: 'corner_taper', name: 'Corner Taper', capacity: 1 }
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
      <h1 className="text-3xl font-bold mb-8">Magnetic Wrap Box Production Schedule</h1>
      
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