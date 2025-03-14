// MultipleChoiceQuestion.tsx
/**
 * A modern, interactive multiple-choice question component that handles
 * rendering options, user selection, and feedback visualization with smooth animations.
 * 
 * Features:
 * - Accessible keyboard navigation
 * - Visual feedback for correct/incorrect answers
 * - Smooth transitions and animations
 * - Responsive design for all screen sizes
 * 
 * @component
 * @param {string[]} options - Available answer choices to display
 * @param {string | null} selectedAnswer - Currently selected answer (if any)
 * @param {string} correctAnswer - The correct answer for validation
 * @param {(value: string) => void} onSelect - Handler for when user selects an option
 * @param {boolean} showExplanation - Whether to display the explanation panel
 * @param {string} explanation - Detailed explanation of the correct answer
 * @param {() => void} nextQuestion - Handler to proceed to the next question
 */

import React from "react";
import { CheckCircle, XCircle } from "lucide-react";
import ExplanationSection from "../ExplanationSection.tsx";

interface MultipleChoiceQuestionProps {
  options: string[];
  selectedAnswer: string | null;
  correctAnswer: string;
  onSelect: (value: string) => void;
  showExplanation: boolean;
  explanation: string;
  nextQuestion: () => void;
}

/**
 * Normalizes text by removing extra whitespace and standardizing format
 * for consistent comparison between options and answers
 * 
 * @param {string} text - The text to normalize
 * @returns {string} - The normalized text
 */
const normalizeText = (text: string): string => {
  return text.replace(/\s+/g, " ").trim();
};

type OptionSquareProps = {
  option: string;
  index: number;
  selected: boolean;
  correct: boolean;
  onSelect: (option: string) => void;
  showExplanation: boolean;
};

/**
 * Individual option card component with interactive feedback and animations
 * Handles user interaction, visual feedback, and accessibility features
 * 
 * @component
 */
const OptionSquare: React.FC<OptionSquareProps> = ({
  option,
  index,
  selected,
  correct,
  onSelect,
  showExplanation,
}) => {
  const normalizedOption = normalizeText(option);
  const letter = String.fromCharCode(65 + index) + ") ";

  return (
    <div
      className="flex items-center group w-full mb-4 transform transition-transform duration-200 hover:scale-[1.01]"
      role="button"
      tabIndex={0}
      aria-label={`Opzione ${letter}: ${normalizedOption}`}
      onClick={() => onSelect(normalizedOption)}
      onKeyDown={(e) => e.key === "Enter" && onSelect(normalizedOption)}
    >
      <div
        className={`option-card flex items-center w-full p-4 rounded-lg transition-all duration-300 border-2
          ${selected 
            ? `selected highlighted ${correct ? "border-green-500" : "border-red-500"} shadow-lg` 
            : "border-gray-200 hover:border-blue-400 hover:shadow-md"}`}
      >
        <div className="flex items-center w-full">
          <span className={`flex items-center justify-center text-lg font-medium mr-3 w-9 h-9 rounded-full 
                         ${selected ? (correct ? "bg-green-100" : "bg-red-100") : "bg-gray-100"} 
                         ${selected ? (correct ? "text-green-700" : "text-red-700") : "text-gray-700"}
                         transition-colors duration-300`}>
            {letter}
          </span>
          <span
            className={`text-base sm:text-lg relative z-10 
                      ${selected ? "text-gray-900 font-medium" : "text-gray-700"}
                      transition-colors duration-300`}
          >
            {normalizedOption}
          </span>
          {showExplanation && (
            <span className="ml-auto">
              {correct ? (
                <CheckCircle
                  className="text-green-500 animate-fadeIn"
                  size={24}
                  aria-hidden="true"
                />
              ) : (
                <XCircle
                  className="text-red-500 animate-fadeIn"
                  size={24}
                  aria-hidden="true"
                />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Main component that renders a complete multiple-choice question with options
 * Manages the display of options, user selection, and explanation section
 * 
 * @component
 */
const MultipleChoiceQuestion: React.FC<MultipleChoiceQuestionProps> = ({
  options,
  selectedAnswer,
  correctAnswer,
  onSelect,
  showExplanation,
  explanation,
  nextQuestion,
}) => {
  // Determine if an option matches the correct answer
  const isOptionCorrect = (option: string) =>
    normalizeText(option) === normalizeText(correctAnswer);

  return (
    <div className="space-y-5">
      {/* Multiple choice options */}
      {options.map((option, idx) => (
        <OptionSquare
          key={idx}
          index={idx}
          option={option}
          selected={selectedAnswer === normalizeText(option)}
          correct={isOptionCorrect(option)}
          onSelect={onSelect}
          showExplanation={showExplanation}
        />
      ))}

      {/* Explanation section for multiple choice */}
      {showExplanation && (
        <ExplanationSection
          selectedAnswer={selectedAnswer}
          correctAnswer={normalizeText(correctAnswer)}
          explanation={normalizeText(explanation)}
          nextQuestion={nextQuestion}
        />
      )}
    </div>
  );
};

export default MultipleChoiceQuestion;