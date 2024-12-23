import { useState, useEffect } from 'react';
import { SimpleTask } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { sampleTasks } from '../sampleData';

export const useGanttTasks = () => {
  const [tasks, setTasks] = useState<SimpleTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const buildTaskHierarchy = (tasksData: any[]) => {
    console.log('Building task hierarchy from:', tasksData);
    
    // First, identify unique line items
    const lineItems = tasksData
      .filter(task => task.type === 'lineitem')
      .reduce((unique: any[], task: any) => {
        const exists = unique.find(t => t.line_item_id === task.line_item_id);
        if (!exists) {
          unique.push(task);
        } else {
          console.log(`Skipping duplicate line item: ${task.id} (${task.name})`);
        }
        return unique;
      }, []);

    console.log('Unique line items:', lineItems.map(item => ({ id: item.id, name: item.name })));
    
    // Create a map of tasks for easy lookup
    const taskMap = new Map();
    tasksData.forEach(task => {
      // Skip if this is a duplicate line item
      if (task.type === 'lineitem' && !lineItems.find(li => li.id === task.id)) {
        console.log(`Skipping duplicate line item during map creation: ${task.id}`);
        return;
      }

      const dependencies = task.task_dependencies?.map((dep: any) => dep.depends_on_id) || [];
      const startTime = task.start_time ? new Date(task.start_time) : new Date();
      
      console.log(`Processing task: ${task.id}`, {
        name: task.name,
        type: task.type,
        startTime: startTime.toISOString(),
        duration: task.duration,
        dependencies
      });

      taskMap.set(task.id, {
        id: task.id,
        name: task.name,
        type: task.type,
        startTime,
        duration: Number(task.duration),
        dependencies,
        isExpanded: false,
        children: [],
        resource: task.resource_id,
        isFixed: task.is_fixed,
      });
    });

    // Build parent-child relationships based on dependencies
    taskMap.forEach((task) => {
      task.dependencies.forEach(depId => {
        const dependentTask = taskMap.get(depId);
        if (dependentTask) {
          if (!dependentTask.children.includes(task.id)) {
            dependentTask.children.push(task.id);
            console.log(`Added ${task.id} (${task.name}) as child of ${depId} (${dependentTask.name})`);
          }
        }
      });
    });

    const finalTasks = Array.from(taskMap.values());
    console.log('Final task hierarchy:', finalTasks.map(t => ({
      id: t.id,
      name: t.name,
      type: t.type,
      children: t.children,
      startTime: t.startTime,
      duration: t.duration
    })));
    
    return finalTasks;
  };

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

        if (!tasksData?.length) {
          console.log('No tasks found in Supabase, using sample data');
          setTasks(sampleTasks);
          return;
        }

        console.log('Raw tasks data from Supabase:', tasksData);
        const hierarchicalTasks = buildTaskHierarchy(tasksData);
        setTasks(hierarchicalTasks);

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