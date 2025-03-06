import React from "react";

interface QuestionInfoProps {
  currentQuestionIndex: number;
  totalQuestions: number;
  className?: string;
  score: number; // Added score prop
}

const QuestionInfo: React.FC<QuestionInfoProps> = ({
  currentQuestionIndex,
  totalQuestions,
  className,
  score, // Receive score as prop
}) => {
  return (
    <div className={`flex gap-2 text-sm font-medium text-gray-600 ${className}`}>
      <div>
        Domanda {currentQuestionIndex + 1} di {totalQuestions}
      </div>
      {/* Display Punteggio here */}
      <div className="ml-auto">Punteggio: {score}</div>
    </div>
  );
};

export default QuestionInfo;
