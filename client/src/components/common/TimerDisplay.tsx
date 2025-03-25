// TimerDisplay.tsx
/**
 * TimerDisplay Component
 *
 * Questo componente visualizza un timer che mostra il tempo rimanente per una domanda in un quiz.
 * Viene utilizzato per mostrare visivamente il tempo rimanente all'utente durante un quiz.
 *
 * @param {boolean} timerEnabled - Indica se il timer è abilitato.
 * @param {boolean} timerActive - Indica se il timer è attualmente attivo.
 * @param {number} timeRemaining - Il tempo rimanente, espresso in secondi.
 *
 * Usage:
 * Questo componente è utilizzato in ActiveQuizScreen per mostrare il tempo rimanente per rispondere alla domanda corrente.
 */


import React from "react";
import { Clock } from "lucide-react"; 

export interface TimerDisplayProps {
  timerEnabled: boolean;
  timerActive: boolean;
  timeRemaining: number;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({
  timerEnabled,
  timerActive,
  timeRemaining,
}) => {
  if (!timerEnabled || !timerActive) return null;
  
  // Add warning class when time is running low (less than 10 seconds)
  const isWarning = timeRemaining <= 10;
  
  // Format time for better display
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;

  return (
    <div 
      className={`
        flex items-center gap-2 px-3 py-2 rounded-lg shadow-md 
        ${isWarning 
          ? 'bg-gradient-to-r from-red-50 via-red-100 to-red-50 text-red-600 pulse border border-red-200' 
          : 'bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 text-blue-600 border border-blue-100'}
        transition-all duration-300 transform hover:scale-105 hover:shadow-lg
      `}
    >
      <Clock className={`w-5 h-5 ${isWarning ? 'animate-pulse' : ''}`} />
      <span className="font-medium">{formattedTime}</span>
      {isWarning && (
        <span className="text-xs bg-red-100 px-1.5 py-0.5 rounded-full text-red-600 animate-pulse ml-1 border border-red-200">
          Poco tempo!
        </span>
      )}
    </div>
  );
};

export default TimerDisplay;
