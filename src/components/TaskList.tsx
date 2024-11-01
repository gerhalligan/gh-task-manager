import React from 'react';
import { format, isValid, parseISO } from 'date-fns';
import { Task } from '../types/task';
import { Timer } from './Timer';

interface TaskListProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onTimerUpdate: (taskId: string, timer: Task['timer']) => void;
}

export function TaskList({ tasks, onEdit, onDelete, onTimerUpdate }: TaskListProps) {
  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) {
        return 'Invalid date';
      }
      return format(date, 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const handleTimerUpdate = (taskId: string, newTimer: Task['timer']) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // If starting the parent timer, stop any running subtask timers
    if (newTimer.isRunning) {
      const updatedSubtasks = task.subtasks.map(subtask => {
        if (subtask.timer.isRunning) {
          const now = new Date();
          const lastStart = subtask.timer.lastStartTime ? new Date(subtask.timer.lastStartTime) : now;
          const elapsedSeconds = Math.floor((now.getTime() - lastStart.getTime()) / 1000);
          
          return {
            ...subtask,
            timer: {
              totalSeconds: subtask.timer.totalSeconds + elapsedSeconds,
              isRunning: false,
              lastStartTime: null
            }
          };
        }
        return subtask;
      });

      onTimerUpdate(taskId, {
        ...newTimer,
        subtasks: updatedSubtasks
      });
    } else {
      onTimerUpdate(taskId, newTimer);
    }
  };

  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Title</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Due Date</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Priority</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Timer</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {tasks.map((task) => (
            <tr key={task.id}>
              <td className="px-6 py-4 text-sm text-gray-900">{task.title}</td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {formatDate(task.dueDate)}
              </td>
              <td className="px-6 py-4 text-sm">
                <span className={`font-medium ${getPriorityColor(task.priority)}`}>
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {task.status.replace('_', ' ').charAt(0).toUpperCase() + task.status.slice(1)}
              </td>
              <td className="px-6 py-4 text-sm">
                <Timer
                  timer={task.timer}
                  onTimerUpdate={(timer) => handleTimerUpdate(task.id, timer)}
                />
              </td>
              <td className="px-6 py-4 text-sm">
                <button
                  onClick={() => onEdit(task)}
                  className="text-indigo-600 hover:text-indigo-900 mr-4"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(task.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}