export type Priority = 'low' | 'medium' | 'high';
export type Status = 'todo' | 'in_progress' | 'completed';

export interface Timer {
  totalSeconds: number;
  isRunning: boolean;
  lastStartTime: string | null;
}

export interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  uploadedAt: string;
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  timer: Timer;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: Priority;
  status: Status;
  timer: Timer;
  subtasks: SubTask[];
  attachments: FileAttachment[];
  createdAt: string;
  updatedAt: string;
}