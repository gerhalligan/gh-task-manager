import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Task, SubTask, Timer as TimerType, FileAttachment } from '../types/task';
import { SubTaskList } from './SubTaskList';
import { Timer } from './Timer';
import { FileAttachments } from './FileAttachments';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string(),
  dueDate: z.string(),
  priority: z.enum(['low', 'medium', 'high']),
  status: z.enum(['todo', 'in_progress', 'completed'])
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormProps {
  task?: Task;
  onSubmit: (data: TaskFormData & { subtasks: SubTask[]; timer: TimerType; attachments: FileAttachment[] }) => void;
}

const initialTimer: TimerType = {
  totalSeconds: 0,
  isRunning: false,
  lastStartTime: null
};

export function TaskForm({ task, onSubmit }: TaskFormProps) {
  const [newSubtask, setNewSubtask] = useState('');
  const [subtasks, setSubtasks] = useState<SubTask[]>(task?.subtasks || []);
  const [timer, setTimer] = useState<TimerType>(task?.timer || initialTimer);
  const [attachments, setAttachments] = useState<FileAttachment[]>(task?.attachments || []);

  const { register, handleSubmit, formState: { errors } } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: task
  });

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtask.trim()) return;

    const subtask: SubTask = {
      id: crypto.randomUUID(),
      title: newSubtask.trim(),
      completed: false,
      timer: initialTimer,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setSubtasks([...subtasks, subtask]);
    setNewSubtask('');
  };

  const handleToggleSubtask = (subtaskId: string) => {
    setSubtasks(prevSubtasks => prevSubtasks.map(st =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    ));
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    setSubtasks(prevSubtasks => prevSubtasks.filter(st => st.id !== subtaskId));
  };

  const handleSubtaskTimerUpdate = (subtaskId: string, newTimer: TimerType) => {
    setSubtasks(prevSubtasks => prevSubtasks.map(st =>
      st.id === subtaskId ? { ...st, timer: newTimer, updatedAt: new Date().toISOString() } : st
    ));
  };

  const handleFileUpload = async (files: File[]) => {
    const newAttachments: FileAttachment[] = await Promise.all(
      files.map(async (file) => {
        // Create object URL for the file
        const url = URL.createObjectURL(file);
        
        // Create thumbnail for images
        let thumbnailUrl: string | undefined;
        if (file.type.startsWith('image/')) {
          thumbnailUrl = url;
        }

        return {
          id: crypto.randomUUID(),
          name: file.name,
          type: file.type,
          size: file.size,
          url,
          thumbnailUrl,
          uploadedAt: new Date().toISOString()
        };
      })
    );

    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const handleDeleteAttachment = (fileId: string) => {
    setAttachments(prev => {
      const attachment = prev.find(a => a.id === fileId);
      if (attachment) {
        URL.revokeObjectURL(attachment.url);
        if (attachment.thumbnailUrl) {
          URL.revokeObjectURL(attachment.thumbnailUrl);
        }
      }
      return prev.filter(a => a.id !== fileId);
    });
  };

  const handleFormSubmit = (data: TaskFormData) => {
    onSubmit({ ...data, subtasks, timer, attachments });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            {...register('title')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>
        <div className="ml-4">
          <label className="block text-sm font-medium text-gray-700">Timer</label>
          <Timer
            timer={timer}
            onTimerUpdate={setTimer}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          {...register('description')}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Due Date</label>
        <input
          type="date"
          {...register('dueDate')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Priority</label>
        <select
          {...register('priority')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Status</label>
        <select
          {...register('status')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div>
        <FileAttachments
          attachments={attachments}
          onUpload={handleFileUpload}
          onDelete={handleDeleteAttachment}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Subtasks</label>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newSubtask}
            onChange={(e) => setNewSubtask(e.target.value)}
            placeholder="Add a subtask"
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          <button
            type="button"
            onClick={handleAddSubtask}
            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Add
          </button>
        </div>
        <SubTaskList
          subtasks={subtasks}
          onToggle={handleToggleSubtask}
          onDelete={handleDeleteSubtask}
          onTimerUpdate={handleSubtaskTimerUpdate}
          parentTaskTimer={timer}
          onParentTimerUpdate={setTimer}
        />
      </div>

      <button
        type="submit"
        className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        {task ? 'Update Task' : 'Create Task'}
      </button>
    </form>
  );
}