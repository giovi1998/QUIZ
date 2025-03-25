// ProgressBar.tsx
/**
 * ProgressBar Component
 *
 * Questo componente visualizza una barra di progresso.
 * Viene utilizzato per mostrare visivamente l'avanzamento di un quiz.
 *
 * @param {number} progress - Il progresso attuale, espresso come percentuale (0-100).
 *
 * Usage:
 * Questo componente è utilizzato in ActiveQuizScreen per mostrare il progresso dell'utente nel quiz.
 */

import React from "react";

export interface ProgressBarProps {
  progress: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  return (
    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner relative">
      <div
        className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 transition-all duration-500 ease-out shadow-lg relative"
        style={{ width: `${progress}%` }}
      >
        {/* Animated shine effect */}
        <div className="absolute inset-0 w-full h-full bg-white opacity-10 animate-shine"></div>
        
        {/* Progress indicator dot */}
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-md border-2 border-indigo-500 z-10"></div>
      </div>
      
      {/* Progress percentage indicator removed from here */}
    </div>
  );
};

export default ProgressBar;
