import React from 'react';
import { SubTask, Timer as TimerType } from '../types/task';
import { Timer } from './Timer';

interface SubTaskListProps {
  subtasks: SubTask[];
  onToggle: (subtaskId: string) => void;
  onDelete: (subtaskId: string) => void;
  onTimerUpdate: (subtaskId: string, timer: TimerType) => void;
  parentTaskTimer: TimerType;
  onParentTimerUpdate: (timer: TimerType) => void;
}

export function SubTaskList({ 
  subtasks, 
  onToggle, 
  onDelete, 
  onTimerUpdate, 
  parentTaskTimer,
  onParentTimerUpdate 
}: SubTaskListProps) {
  const handleSubtaskTimerUpdate = (subtaskId: string, newTimer: TimerType) => {
    // If starting a new timer
    if (newTimer.isRunning) {
      // Stop parent timer if it's running
      if (parentTaskTimer.isRunning) {
        const now = new Date();
        const lastStart = parentTaskTimer.lastStartTime ? new Date(parentTaskTimer.lastStartTime) : now;
        const elapsedSeconds = Math.floor((now.getTime() - lastStart.getTime()) / 1000);
        
        onParentTimerUpdate({
          totalSeconds: parentTaskTimer.totalSeconds + elapsedSeconds,
          isRunning: false,
          lastStartTime: null
        });
      }

      // Stop any other running subtask timers
      subtasks.forEach(subtask => {
        if (subtask.id !== subtaskId && subtask.timer.isRunning) {
          const now = new Date();
          const lastStart = subtask.timer.lastStartTime ? new Date(subtask.timer.lastStartTime) : now;
          const elapsedSeconds = Math.floor((now.getTime() - lastStart.getTime()) / 1000);
          
          onTimerUpdate(subtask.id, {
            totalSeconds: subtask.timer.totalSeconds + elapsedSeconds,
            isRunning: false,
            lastStartTime: null
          });
        }
      });
    }

    // Update the current subtask timer
    onTimerUpdate(subtaskId, newTimer);
  };

  return (
    <div className="space-y-2">
      {subtasks.map((subtask) => (
        <div key={subtask.id} className="flex items-center justify-between border-b border-gray-200 pb-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={subtask.completed}
              onChange={() => onToggle(subtask.id)}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className={`ml-2 text-sm ${subtask.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
              {subtask.title}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Timer
              timer={subtask.timer}
              onTimerUpdate={(timer) => handleSubtaskTimerUpdate(subtask.id, timer)}
            />
            <button
              onClick={() => onDelete(subtask.id)}
              className="text-red-600 hover:text-red-900 text-sm"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}