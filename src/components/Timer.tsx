import React, { useEffect, useRef } from 'react';
import { Timer as TimerType } from '../types/task';

interface TimerProps {
  timer: TimerType;
  onTimerUpdate: (timer: TimerType) => void;
  disabled?: boolean;
}

export function Timer({ timer, onTimerUpdate, disabled = false }: TimerProps) {
  const displayTimeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let interval: number | undefined;

    const updateDisplay = () => {
      if (!displayTimeRef.current) return;

      const totalSeconds = timer.isRunning && timer.lastStartTime
        ? timer.totalSeconds + Math.floor((new Date().getTime() - new Date(timer.lastStartTime).getTime()) / 1000)
        : timer.totalSeconds;

      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      displayTimeRef.current.textContent = 
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    updateDisplay();

    if (timer.isRunning) {
      interval = window.setInterval(updateDisplay, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [timer]);

  const handleStartStop = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (timer.isRunning) {
      // Stop timer and calculate total time
      const now = new Date();
      const lastStart = timer.lastStartTime ? new Date(timer.lastStartTime) : now;
      const elapsedSeconds = Math.floor((now.getTime() - lastStart.getTime()) / 1000);
      
      onTimerUpdate({
        totalSeconds: timer.totalSeconds + elapsedSeconds,
        isRunning: false,
        lastStartTime: null
      });
    } else {
      // Start timer
      onTimerUpdate({
        ...timer,
        isRunning: true,
        lastStartTime: new Date().toISOString()
      });
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <span ref={displayTimeRef} className="font-mono text-sm">00:00:00</span>
      <button
        onClick={handleStartStop}
        disabled={disabled}
        className={`px-2 py-1 text-xs rounded ${
          timer.isRunning
            ? 'bg-red-100 text-red-700 hover:bg-red-200'
            : 'bg-green-100 text-green-700 hover:bg-green-200'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {timer.isRunning ? 'Stop' : 'Start'}
      </button>
    </div>
  );
}