/**
 * QuizTitleInput Component
 *
 * A modern, animated input field for setting the quiz title with visual feedback.
 * 
 * Features:
 * - Smooth focus animations
 * - Placeholder text with helpful example
 * - Responsive design
 * - Accessible labeling
 *
 * @component
 * @param {string} quizName - The current quiz name
 * @param {(name: string) => void} setQuizName - Function to update the quiz name
 */

import React from "react";
import { PenLine } from "lucide-react";

interface QuizTitleInputProps {
  quizName: string;
  setQuizName: (name: string) => void;
}

const QuizTitleInput: React.FC<QuizTitleInputProps> = ({
  quizName,
  setQuizName,
}) => {
  return (
    <div className="space-y-3 transition-all duration-300 hover:translate-y-[-2px]">
      <label 
        htmlFor="quiz-title" 
        className="flex items-center text-sm font-medium text-gray-700 mb-1"
      >
        <PenLine className="w-4 h-4 mr-2 text-blue-500" />
        Nome del Quiz
      </label>
      <input
        id="quiz-title"
        value={quizName}
        onChange={(e) => setQuizName(e.target.value)}
        placeholder="Es: Computer Vision"
        className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl 
                 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                 shadow-sm focus:shadow-md
                 transition-all duration-300"
        aria-label="Inserisci il nome del quiz"
      />
      {quizName && (
        <p className="text-xs text-gray-500 animate-fadeIn pl-1">
          Il tuo quiz si chiamerà "{quizName}"
        </p>
      )}
    </div>
  );
};

export default QuizTitleInput;