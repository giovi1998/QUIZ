// components/AnswerButton.tsx
import React from "react";
type AnswerButtonProps = {
  selectedAnswer: string | null;
  handleAnswer: (answer: string | null) => void;
};

const AnswerButton: React.FC<AnswerButtonProps> = ({
  selectedAnswer,
  handleAnswer,
}) => {
  return (
    <button
      className={`w-full py-3 rounded-lg text-white font-semibold 
        ${selectedAnswer ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-300 cursor-not-allowed"}`}
      onClick={() => handleAnswer(selectedAnswer)}
      disabled={!selectedAnswer}
      style={{ boxShadow: selectedAnswer ? "0 8px 15px rgba(0, 100, 255, 0.1)" : "none" }}
    >
      Invia Risposta
    </button>
  );
};

export default AnswerButton;