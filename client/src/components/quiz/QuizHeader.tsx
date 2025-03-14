// QuizHeader.tsx
/**
 * @component QuizHeader
 * 
 * Contains the quiz name, back button, timer, and progress bar.
 * 
 * @param {string} quizName - The title of the current quiz
 * @param {number} progress - The progress percentage of the quiz
 * @param {number} timeRemaining - Seconds remaining for timed questions
 * @param {boolean} timerActive - Whether the timer is currently running
 * @param {boolean} timerEnabled - Whether timing is enabled for this quiz
 * @param {boolean} isTimerWarning - Whether the timer is running low (less than 10 seconds)
 * @param {Function} onBackToSetup - Callback to return to quiz setup
 * @param {string} questionType - The type of the current question
 */

import React from "react";
import ProgressBar from "../common/ProgressBar.tsx";
import { ArrowLeft, Clock } from "lucide-react";

interface QuizHeaderProps {
  quizName: string;
  progress: number;
  timeRemaining: number;
  timerActive: boolean;
  timerEnabled: boolean;
  isTimerWarning: boolean;
  onBackToSetup: () => void;
  questionType: "multiple-choice" | "open";
}

const QuizHeader: React.FC<QuizHeaderProps> = ({
  quizName,
  progress,
  timeRemaining,
  timerActive,
  timerEnabled,
  isTimerWarning,
  onBackToSetup,
  questionType,
}) => {
  return (
    <>
      {/* Progress bar */}
      <ProgressBar progress={progress} aria-label="Progresso del quiz" />

      {/* Quiz header with title and timer */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b border-gray-200">
        {/* Back button */}
        <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10">
          <button
            onClick={onBackToSetup}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center"
            aria-label="Torna alla configurazione del quiz"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 break-words max-w-[70%]">
          {quizName}
        </h1>

        {timerEnabled &&
          timerActive &&
          questionType === "multiple-choice" && (
            <div className={`flex items-center ${isTimerWarning ? 'timer-warning' : ''}`}>
              <Clock className={`w-5 h-5 mr-1 ${isTimerWarning ? 'text-red-500' : 'text-blue-500'}`} />
              <span className={`font-medium ${isTimerWarning ? 'text-red-500' : 'text-blue-500'}`}>
                {timeRemaining} sec
              </span>
            </div>
          )}
      </div>
    </>
  );
};

export default QuizHeader;