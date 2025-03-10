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

  return (
    <div className="flex items-center text-blue-600">
      <Clock className="w-5 h-5 mr-1" />
      {timeRemaining} sec
    </div>
  );
};

export default TimerDisplay;
