import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface Task {
  id: string;
  name: string;
  type: string;
  dependencies: string[];
  children?: Task[];
}

const TaskVisualization = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      console.log('Loading tasks and dependencies...');
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select(`
          id,
          name,
          type,
          task_dependencies!task_dependencies_task_id_fkey(depends_on_id)
        `);

      if (tasksError) throw tasksError;

      // Transform the data to include dependencies array
      const transformedTasks = tasksData.map(task => ({
        id: task.id,
        name: task.name,
        type: task.type,
        dependencies: task.task_dependencies?.map((dep: any) => dep.depends_on_id) || []
      }));

      console.log('Transformed tasks:', transformedTasks);
      setTasks(transformedTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast({
        title: "Error loading tasks",
        description: "There was a problem loading the task data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const renderTask = (task: Task, level: number = 0, visited = new Set<string>()) => {
    // Prevent infinite recursion
    if (visited.has(task.id)) {
      console.log(`Circular dependency detected for task: ${task.id}`);
      return null;
    }
    visited.add(task.id);

    // Find child tasks (tasks that depend on this task)
    const childTasks = tasks.filter(t => t.dependencies.includes(task.id));
    console.log(`Task ${task.id} has ${childTasks.length} children`);

    const getTypeColor = (type: string) => {
      switch (type) {
        case 'lineitem':
          return 'bg-purple-100 border-purple-300';
        case 'component':
          return 'bg-blue-100 border-blue-300';
        case 'element':
          return 'bg-green-100 border-green-300';
        default:
          return 'bg-gray-100 border-gray-300';
      }
    };

    return (
      <div key={task.id} className="mb-2" style={{ marginLeft: `${level * 24}px` }}>
        <div className={`p-3 rounded-lg border ${getTypeColor(task.type)} relative`}>
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium">{task.name}</span>
              <span className="ml-2 text-sm text-gray-500">({task.type})</span>
            </div>
            {task.dependencies.length > 0 && (
              <div className="text-sm text-gray-500">
                Dependencies: {task.dependencies.length}
              </div>
            )}
          </div>
          {task.dependencies.length > 0 && (
            <div className="mt-2 text-sm text-gray-600">
              Depends on:{' '}
              {task.dependencies.map(depId => {
                const depTask = tasks.find(t => t.id === depId);
                return depTask ? depTask.name : depId;
              }).join(', ')}
            </div>
          )}
        </div>
        {childTasks.length > 0 && (
          <div className="ml-4 mt-2 pl-4 border-l border-gray-300">
            {childTasks.map(childTask => renderTask(childTask, level + 1, new Set(visited)))}
          </div>
        )}
      </div>
    );
  };

  const lineItems = tasks.filter(task => task.type === 'lineitem');

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading tasks...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Task Hierarchy Visualization</h1>
        <Button onClick={loadTasks} className="flex items-center gap-2">
          <ArrowRight className="w-4 h-4" />
          Refresh
        </Button>
      </div>
      
      <div className="bg-white rounded-lg shadow">
        <ScrollArea className="h-[calc(100vh-12rem)] p-6">
          {lineItems.map(task => renderTask(task))}
        </ScrollArea>
      </div>
    </div>
  );
};

export default TaskVisualization;