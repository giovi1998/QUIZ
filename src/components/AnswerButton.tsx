// AnswerButton.tsx
import React from 'react';

type AnswerButtonProps = {
  selectedAnswer: string | null;
  handleAnswer: (answer: string | null) => void;
  className?: string;
};

const AnswerButton: React.FC<AnswerButtonProps> = ({ selectedAnswer, handleAnswer, className }) => {
  return (
    <button
      className={`w-full sm:w-auto px-6 py-3 text-sm sm:text-base rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all ${
        selectedAnswer ? '' : 'opacity-50 cursor-not-allowed'
      } ${className}`}
      onClick={() => {
        if (selectedAnswer) {
          handleAnswer(selectedAnswer);
        }
      }}
      disabled={!selectedAnswer}
    >
      Conferma Risposta
    </button>
  );
};

export default AnswerButton;

