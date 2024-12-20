import { Task } from '@/types/scheduling';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export const saveTasks = async (tasksToSave: Task[]) => {
  try {
    console.log('Saving tasks to Supabase:', tasksToSave);
    for (const task of tasksToSave) {
      const taskData = {
        id: task.id,
        name: task.name,
        type: task.type,
        status: task.status,
        duration: task.duration,
        resource_id: task.resource_id,
        start_time: task.startTime?.toISOString(),
        end_time: task.endTime?.toISOString(),
        is_fixed: task.is_fixed,
        line_item_id: task.line_item_id
      };

      const { error: taskError } = await supabase
        .from('tasks')
        .upsert(taskData);

      if (taskError) throw taskError;

      if (task.dependencies.length > 0) {
        const { error: deleteError } = await supabase
          .from('task_dependencies')
          .delete()
          .eq('task_id', task.id);

        if (deleteError) throw deleteError;

        const dependencyRecords = task.dependencies.map(depId => ({
          task_id: task.id,
          depends_on_id: depId
        }));

        const { error: depsError } = await supabase
          .from('task_dependencies')
          .insert(dependencyRecords);

        if (depsError) throw depsError;
      }
    }

    console.log('Tasks saved successfully');
    toast({
      title: "Success",
      description: "Tasks saved successfully.",
    });
  } catch (error) {
    console.error('Error saving tasks:', error);
    toast({
      title: "Error saving tasks",
      description: "There was an error saving the tasks. Please try again.",
      variant: "destructive",
    });
    throw error;
  }
};