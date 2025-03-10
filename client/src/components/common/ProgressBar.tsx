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
    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
      <div
        className="h-full bg-blue-500 transition-all duration-300"
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );
};

export default ProgressBar;
