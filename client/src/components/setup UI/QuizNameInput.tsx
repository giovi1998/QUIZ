/**
 * QuizNameInput Component
 *
 * A modern, animated input field for setting the quiz name with visual feedback.
 * 
 * Features:
 * - Smooth focus animations
 * - Visual feedback with checkmark when name is entered
 * - Responsive design with gradient background
 * - Accessible labeling
 *
 * @component
 * @param {string} quizName - The current quiz name
 * @param {(name: string) => void} setQuizName - Function to update the quiz name
 */

import React from "react";
import { FileText, CheckCircle } from "lucide-react";

interface QuizNameInputProps {
  quizName: string;
  setQuizName: (name: string) => void;
}

const QuizNameInput: React.FC<QuizNameInputProps> = ({
  quizName,
  setQuizName,
}) => {
  return (
    <div className="space-y-3 sm:space-y-4">
      <label className="block text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 p-2 rounded-lg shadow-sm">
        <FileText size={14} className="text-blue-500 sm:w-4 sm:h-4" />
        Nome del Quiz
      </label>
      <div className="relative">
        <input
          type="text"
          value={quizName}
          onChange={(e) => setQuizName(e.target.value)}
          placeholder="Es. Computer Vision"
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-3 focus:ring-blue-300 focus:border-blue-500 transition-all duration-300 text-base sm:text-lg shadow-sm hover:shadow-md"
        />
        {quizName && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 animate-scale">
            <CheckCircle size={16} className="sm:w-5 sm:h-5" />
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizNameInput;