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
  
  const [tasks, setTasks] = useState<Task[]>([
    // Line Item Level (only this level has explicit priority)
    {
      id: 'final_assembly',
      name: 'Final Assembly - Magnetic Wrap Box',
      type: 'lineitem',
      resource: 'bench',
      duration: 3,
      status: 'pending',
      dependencies: ['wrap_case', 'wrap_base_tray', 'line_case'],
      priority: 3,
      deadline: deadline
    },

    // Component Level - Case
    {
      id: 'wrap_case',
      name: 'Wrap Case',
      type: 'component',
      resource: 'gluing_machine',
      duration: 1.17,
      status: 'pending',
      // Now depends on ALL case element tasks
      dependencies: ['case_wrap_cut', 'case_board_insert', 'case_liner_cut'],
    },
    {
      id: 'line_case',
      name: 'Line Case',
      type: 'component',
      resource: 'gluing_machine',
      duration: 0.67,
      status: 'pending',
      // Must wait for wrap_case to complete
      dependencies: ['wrap_case'],
    },

    // Element Level - Case Elements
    {
      id: 'case_wrap_print',
      name: 'Case Wrap - Print',
      type: 'element',
      resource: 'konica',
      duration: 0.42,
      status: 'pending',
      dependencies: [], // First task in its chain
    },
    {
      id: 'case_wrap_laminate',
      name: 'Case Wrap - Laminate',
      type: 'element',
      resource: 'dk_europa',
      duration: 0.33,
      status: 'pending',
      dependencies: ['case_wrap_print'],
    },
    {
      id: 'case_wrap_cut',
      name: 'Case Wrap - Cut',
      type: 'element',
      resource: 'zund_m800',
      duration: 0.33,
      status: 'pending',
      dependencies: ['case_wrap_laminate'],
    },
    {
      id: 'case_board_cut',
      name: 'Case Board - Cut',
      type: 'element',
      resource: 'zund_m800',
      duration: 0.5,
      status: 'pending',
      dependencies: [],
    },
    {
      id: 'case_board_insert',
      name: 'Case Board - Insert Receivers',
      type: 'element',
      resource: 'bench',
      duration: 0.5,
      status: 'pending',
      dependencies: ['case_board_cut'],
    },
    {
      id: 'case_liner_laminate',
      name: 'Case Liner - Laminate',
      type: 'element',
      resource: 'dk_europa',
      duration: 0.33,
      status: 'pending',
      dependencies: [],
    },
    {
      id: 'case_liner_cut',
      name: 'Case Liner - Cut',
      type: 'element',
      resource: 'zund_m800',
      duration: 0.33,
      status: 'pending',
      dependencies: ['case_liner_laminate'],
    },

    // Component Level - Base Tray
    {
      id: 'wrap_base_tray',
      name: 'Wrap Base Tray',
      type: 'component',
      resource: 'gluing_machine',
      duration: 2,
      status: 'pending',
      // Must wait for ALL base tray tasks to complete
      dependencies: [
        'base_tray_board_corner',
        'base_tray_wrap_cut',
        'base_tray_board_magnets'
      ],
    },

    // Element Level - Base Tray Elements
    {
      id: 'base_tray_board_cut',
      name: 'Base Tray Board - Cut',
      type: 'element',
      resource: 'zund_m800',
      duration: 1,
      status: 'pending',
      dependencies: [],
    },
    {
      id: 'base_tray_board_drill',
      name: 'Base Tray Board - Drill Holes',
      type: 'element',
      resource: 'magnet_drill',
      duration: 0.5,
      status: 'pending',
      dependencies: ['base_tray_board_cut'],
    },
    {
      id: 'base_tray_board_magnets',
      name: 'Base Tray Board - Insert Magnets',
      type: 'element',
      resource: 'bench',
      duration: 1,
      status: 'pending',
      dependencies: ['base_tray_board_drill'],
    },
    {
      id: 'base_tray_board_corner',
      name: 'Base Tray Board - Corner Tape',
      type: 'element',
      resource: 'corner_taper',
      duration: 0.5,
      status: 'pending',
      dependencies: ['base_tray_board_magnets'],
    },
    {
      id: 'base_tray_wrap_print',
      name: 'Base Tray Wrap - Print',
      type: 'element',
      resource: 'konica',
      duration: 0.33,
      status: 'pending',
      dependencies: [],
    },
    {
      id: 'base_tray_wrap_laminate',
      name: 'Base Tray Wrap - Laminate',
      type: 'element',
      resource: 'dk_europa',
      duration: 0.25,
      status: 'pending',
      dependencies: ['base_tray_wrap_print'],
    },
    {
      id: 'base_tray_wrap_cut',
      name: 'Base Tray Wrap - Cut',
      type: 'element',
      resource: 'zund_m800',
      duration: 0.75,
      status: 'pending',
      dependencies: ['base_tray_wrap_laminate'],
    }
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