import React, { useState } from 'react';
import { Task, Timer as TimerType } from './types/task';
import { TaskForm } from './components/TaskForm';
import { TaskList } from './components/TaskList';
import { TaskFilter } from './components/TaskFilter';
import { Toaster, toast } from 'react-hot-toast';

const initialTimer: TimerType = {
  totalSeconds: 0,
  isRunning: false,
  lastStartTime: null
};

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    search: ''
  });

  const handleCreateTask = (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: Task = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setTasks(prevTasks => [...prevTasks, newTask]);
    toast.success('Task created successfully');
  };

  const handleUpdateTask = (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingTask) return;
    
    const updatedTask: Task = {
      ...editingTask,
      ...data,
      updatedAt: new Date().toISOString()
    };

    setTasks(prevTasks => 
      prevTasks.map(task => task.id === editingTask.id ? updatedTask : task)
    );
    setEditingTask(null);
    toast.success('Task updated successfully');
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    toast.success('Task deleted successfully');
  };

  const handleTimerUpdate = (taskId: string, newTimer: TimerType) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? {
              ...task,
              timer: newTimer,
              updatedAt: new Date().toISOString()
            }
          : task
      )
    );
  };

  const filteredTasks = tasks.filter(task => {
    const matchesStatus = !filters.status || task.status === filters.status;
    const matchesPriority = !filters.priority || task.priority === filters.priority;
    const matchesSearch = !filters.search || 
      task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      task.description.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesStatus && matchesPriority && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Task Management</h1>
          
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              {editingTask ? 'Edit Task' : 'Create New Task'}
            </h2>
            <TaskForm
              task={editingTask || undefined}
              onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
            />
          </div>

          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Tasks</h2>
            <TaskFilter onFilterChange={setFilters} />
            <TaskList
              tasks={filteredTasks}
              onEdit={setEditingTask}
              onDelete={handleDeleteTask}
              onTimerUpdate={handleTimerUpdate}
            />
          </div>
        </div>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}