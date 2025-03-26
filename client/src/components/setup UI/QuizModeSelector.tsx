/**
 * QuizModeSelector Component
 *
 * A modern, interactive selector for choosing between default and custom quiz modes.
 * 
 * Features:
 * - Animated selection feedback
 * - Neumorphic design with subtle shadows
 * - Visual indicators for active selection
 * - Responsive grid layout
 *
 * @component
 * @param {"default" | "custom"} quizMode - The current quiz mode
 * @param {(mode: "default" | "custom") => void} setQuizMode - Function to update the quiz mode
 */

import React from "react";
import { BookOpen, Upload } from "lucide-react";

interface QuizModeSelectorProps {
  quizMode: "default" | "custom";
  setQuizMode: (mode: "default" | "custom") => void;
}

const QuizModeSelector: React.FC<QuizModeSelectorProps> = ({
  quizMode,
  setQuizMode,
}) => {
  return (
    <div className="bg-gray-50 p-5 rounded-2xl space-y-4 shadow-inner">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Modalità Quiz</span>
        <span className="px-3 py-1 bg-white rounded-lg text-sm border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-md">
          {quizMode === "custom" ? "Personalizzata" : "Predefinita"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setQuizMode("default")}
          className={`quiz-mode-btn p-5 rounded-xl border-2 transition-all duration-300 ${
            quizMode === "default"
              ? "active border-blue-500"
              : "border-gray-200 hover:border-blue-200"
          }`}
          aria-pressed={quizMode === "default"}
          aria-label="Seleziona modalità predefinita"
        >
          <div className="flex flex-col items-center">
            <BookOpen className={`w-6 h-6 mb-2 ${quizMode === "default" ? "text-white" : "text-blue-500"}`} />
            <span className={`font-medium ${quizMode === "default" ? "text-white" : "text-gray-800"}`}>
              Predefinita
            </span>
          </div>
        </button>

        <button
          onClick={() => setQuizMode("custom")}
          className={`quiz-mode-btn p-5 rounded-xl border-2 transition-all duration-300 ${
            quizMode === "custom"
              ? "active border-purple-500"
              : "border-gray-200 hover:border-purple-200"
          }`}
          aria-pressed={quizMode === "custom"}
          aria-label="Seleziona modalità personalizzata"
        >
          <div className="flex flex-col items-center">
            <Upload className={`w-6 h-6 mb-2 ${quizMode === "custom" ? "text-white" : "text-purple-500"}`} />
            <span className={`block text-xs mt-1 ${quizMode === "custom" ? "text-purple-100" : "text-gray-600"}`}>
              Carica le tue domande
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default QuizModeSelector;