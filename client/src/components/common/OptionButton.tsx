// components/common/OptionButton.tsx
import React from "react";

interface OptionButtonProps {
  option: string;
  selectedAnswer: string | null;
  showExplanation: boolean;
  setSelectedAnswer: (answer: string) => void;
  correctAnswer: string;
}

const OptionButton: React.FC<OptionButtonProps> = ({
  option,
  selectedAnswer,
  showExplanation,
  setSelectedAnswer,
  correctAnswer,
}) => {
  const isSelected = selectedAnswer === option;
  const isCorrect = option === correctAnswer;
  const isDisabled = showExplanation;

  const className = `
    w-full px-6 py-4 rounded-lg text-left transition-all border
    ${isSelected ? "bg-blue-100 text-blue-600 border-blue-300" : 
    showExplanation ? (isCorrect ? "bg-green-100 text-green-600 border-green-300" : "bg-red-100 text-red-600 border-red-300") : "bg-white hover:bg-gray-100 border-gray-200"}
  `;

  const boxShadow = isSelected 
    ? "0 4px 6px rgba(66, 153, 225, 0.2)" 
    : showExplanation 
      ? isCorrect 
        ? "0 4px 6px rgba(34, 197, 94, 0.15)" 
        : "0 4px 6px rgba(255, 58, 58, 0.15)"
      : "none";

  return (
    <button 
      key={option}
      className={className}
      onClick={() => !showExplanation && setSelectedAnswer(option)}
      disabled={isDisabled}
      style={{ boxShadow }}
    >
      {option}
    </button>
  );
};

export default OptionButton;
