/**
 * EnhancedQuizModeSelector Component
 *
 * A modern, interactive selector for choosing between default and custom quiz modes.
 * 
 * Features:
 * - Animated selection feedback with gradient backgrounds
 * - Visual indicators for active selection with icons
 * - Responsive design with hover effects
 * - Accessible button labeling
 *
 * @component
 * @param {"default" | "custom"} quizMode - The current quiz mode
 * @param {(mode: "default" | "custom") => void} setQuizMode - Function to update the quiz mode
 */

import React from "react";
import { Zap, Upload } from "lucide-react";

interface QuizModeSelectorProps {
  quizMode: "default" | "custom";
  setQuizMode: (mode: "default" | "custom") => void;
}

const EnhancedQuizModeSelector: React.FC<QuizModeSelectorProps> = ({
  quizMode,
  setQuizMode,
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg shadow-sm">
        <Zap className="text-blue-500" size={20} />
        Modalità Quiz
      </h2>
      <div className="flex flex-col space-y-6">
        <button
          onClick={() => setQuizMode("default")}
          className={`p-6 rounded-lg border-2 transition-all duration-300 flex flex-col items-center gap-3 transform hover:scale-[1.03] ${
            quizMode === "default"
              ? "border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700 shadow-lg"
              : "border-gray-200 hover:border-blue-300 hover:shadow-md bg-white"
          }`}
          aria-pressed={quizMode === "default"}
          aria-label="Seleziona modalità predefinita"
        >
          <div className={`p-3 rounded-full ${quizMode === "default" ? "bg-blue-100 shadow-md" : "bg-gray-100"} transition-colors duration-300`}>
            <Zap className={quizMode === "default" ? "text-blue-500 animate-pulse" : "text-gray-400"} size={24} />
          </div>
          <span className="font-medium text-lg">Predefinita</span>
        </button>
        <button
          onClick={() => setQuizMode("custom")}
          className={`p-6 rounded-lg border-2 transition-all duration-300 flex flex-col items-center gap-3 transform hover:scale-[1.03] ${
            quizMode === "custom"
              ? "border-purple-500 bg-gradient-to-br from-purple-50 to-purple-100 text-purple-700 shadow-lg"
              : "border-gray-200 hover:border-purple-300 hover:shadow-md bg-white"
          }`}
          aria-pressed={quizMode === "custom"}
          aria-label="Seleziona modalità personalizzata"
        >
          <div className={`p-3 rounded-full ${quizMode === "custom" ? "bg-purple-100 shadow-md" : "bg-gray-100"} transition-colors duration-300`}>
            <Upload className={quizMode === "custom" ? "text-purple-500 animate-pulse" : "text-gray-400"} size={24} />
          </div>
          <span className="text-sm sm:text-base font-medium text-gray-700">Carica le tue domande</span>
        </button>
      </div>
    </div>
  );
};

export default EnhancedQuizModeSelector;