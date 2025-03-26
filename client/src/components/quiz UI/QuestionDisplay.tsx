// QuestionDisplay.tsx
/**
 * @component QuestionDisplay
 * 
 * Renders the current question text with appropriate styling.
 * 
 * @param {string} question - The text of the current question
 */

import React from "react";

interface QuestionDisplayProps {
  question: string;
}

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({ question }) => {
  return (
    <div
      className="question-text text-lg sm:text-xl mb-6 leading-relaxed bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-xl border-l-4 border-blue-500"
      role="heading"
      aria-level={2}
    >
      {question}
    </div>
  );
};

export default QuestionDisplay;