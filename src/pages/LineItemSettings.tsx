import { useState, useEffect } from 'react';
import { Task } from '@/types/scheduling';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

const LineItemSettings = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const savedTasks = localStorage.getItem('schedulingTasks');
    console.log('Loading tasks from localStorage:', savedTasks);
    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks);
        // Convert date strings back to Date objects
        const tasksWithDates = parsedTasks.map((task: any) => ({
          ...task,
          startTime: task.startTime ? new Date(task.startTime) : undefined,
          deadline: task.deadline ? new Date(task.deadline) : undefined,
          endTime: task.endTime ? new Date(task.endTime) : undefined,
        }));
        console.log('Parsed tasks:', tasksWithDates);
        setTasks(tasksWithDates);
      } catch (error) {
        console.error('Error parsing tasks:', error);
        toast({
          title: "Error loading tasks",
          description: "There was an error loading the tasks. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      console.log('No tasks found in localStorage');
    }
  }, []);

  const handleSave = (taskId: string, deadline: string, priority: number) => {
    console.log(`Updating task ${taskId} with deadline ${deadline} and priority ${priority}`);
    
    setTasks(prevTasks => {
      const updatedTasks = prevTasks.map(task => {
        if (task.id === taskId && task.type === 'lineitem') {
          return {
            ...task,
            deadline: deadline ? new Date(deadline) : undefined,
            priority: priority || undefined
          };
        }
        return task;
      });
      
      // Save to localStorage
      localStorage.setItem('schedulingTasks', JSON.stringify(updatedTasks));
      return updatedTasks;
    });

    toast({
      title: "Settings updated",
      description: "Line item settings have been saved successfully.",
    });
  };

  const lineItems = tasks.filter(task => task.type === 'lineitem');
  console.log('Filtered line items:', lineItems);

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Line Item Settings</h1>
        <Button onClick={() => navigate('/')}>Back to Schedule</Button>
      </div>

      {lineItems.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No line items found. Create some line items in the schedule first.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {lineItems.map(task => (
            <div key={task.id} className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-xl font-semibold mb-4">{task.name}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor={`deadline-${task.id}`} className="block text-sm font-medium">
                    Deadline
                  </label>
                  <Input
                    id={`deadline-${task.id}`}
                    type="datetime-local"
                    defaultValue={task.deadline?.toISOString().slice(0, 16)}
                    onChange={(e) => handleSave(task.id, e.target.value, task.priority || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor={`priority-${task.id}`} className="block text-sm font-medium">
                    Priority (0-5)
                  </label>
                  <Input
                    id={`priority-${task.id}`}
                    type="number"
                    min="0"
                    max="5"
                    defaultValue={task.priority}
                    onChange={(e) => handleSave(task.id, task.deadline?.toISOString() || '', parseInt(e.target.value))}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LineItemSettings;