import React from 'react';
import { Priority, Status } from '../types/task';

interface TaskFilterProps {
  onFilterChange: (filters: {
    status?: Status;
    priority?: Priority;
    search?: string;
  }) => void;
}

export function TaskFilter({ onFilterChange }: TaskFilterProps) {
  return (
    <div className="flex gap-4 mb-6">
      <input
        type="text"
        placeholder="Search tasks..."
        onChange={(e) => onFilterChange({ search: e.target.value })}
        className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
      />

      <select
        onChange={(e) => onFilterChange({ status: e.target.value as Status })}
        className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
      >
        <option value="">All Status</option>
        <option value="todo">To Do</option>
        <option value="in_progress">In Progress</option>
        <option value="completed">Completed</option>
      </select>

      <select
        onChange={(e) => onFilterChange({ priority: e.target.value as Priority })}
        className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
      >
        <option value="">All Priorities</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
    </div>
  );
}