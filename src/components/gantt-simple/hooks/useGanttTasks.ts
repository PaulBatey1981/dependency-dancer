import { useState, useEffect } from 'react';
import { SimpleTask } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { sampleTasks } from '../sampleData';

export const useGanttTasks = () => {
  const [tasks, setTasks] = useState<SimpleTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        console.log('Loading tasks from Supabase...');
        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .select(`
            *,
            task_dependencies!task_dependencies_task_id_fkey(depends_on_id)
          `);

        if (tasksError) {
          console.error('Error fetching tasks:', tasksError);
          throw tasksError;
        }

        console.log('Raw tasks data from Supabase:', tasksData);

        if (!tasksData?.length) {
          console.log('No tasks found in Supabase, using sample data');
          setTasks(sampleTasks);
          return;
        }

        // Create a Map to store unique tasks by ID
        const taskMap = new Map<string, SimpleTask>();

        // Process each task
        tasksData.forEach(task => {
          console.log('Processing task:', task);
          
          // Only add the task if it's not already in the map
          if (!taskMap.has(task.id)) {
            const formattedTask: SimpleTask = {
              id: task.id,
              name: task.name,
              type: task.type,
              startTime: task.start_time ? new Date(task.start_time) : new Date(),
              duration: Number(task.duration),
              dependencies: task.task_dependencies?.map((dep: any) => dep.depends_on_id) || [],
              isExpanded: false,
              parentId: task.line_item_id || undefined,
              resource: task.resource_id,
              isFixed: task.is_fixed,
              children: []
            };
            
            taskMap.set(task.id, formattedTask);
            console.log('Added formatted task:', formattedTask);
          }
        });

        // Convert Map values back to array
        const uniqueTasks = Array.from(taskMap.values());
        console.log('Final unique tasks:', uniqueTasks);

        // Process parent-child relationships
        uniqueTasks.forEach(task => {
          if (task.parentId) {
            const parent = taskMap.get(task.parentId);
            if (parent) {
              if (!parent.children) parent.children = [];
              if (!parent.children.includes(task.id)) {
                parent.children.push(task.id);
                console.log(`Added task ${task.id} as child of ${task.parentId}`);
              }
            }
          }
        });

        // Log the final task hierarchy
        const lineItems = uniqueTasks.filter(t => t.type === 'lineitem');
        console.log('Line items with their children:', lineItems.map(item => ({
          id: item.id,
          name: item.name,
          children: item.children
        })));

        setTasks(uniqueTasks);
      } catch (error) {
        console.error('Error loading tasks:', error);
        toast({
          title: "Error loading tasks",
          description: "Using sample data as fallback.",
          variant: "destructive",
        });
        setTasks(sampleTasks);
      } finally {
        setIsLoading(false);
      }
    };

    loadTasks();
  }, []);

  return { tasks, setTasks, isLoading };
};