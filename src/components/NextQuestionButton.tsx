// components/NextQuestionButton.tsx
import React from "react";

export interface NextQuestionButtonProps {
  nextQuestion: () => void;
}





const NextQuestionButton: React.FC<NextQuestionButtonProps> = ({ nextQuestion }) => {
  return (
    <button
      className="w-full py-3 mt-6 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all"
      onClick={nextQuestion}
      style={{ boxShadow: "0 8px 15px rgba(0, 100, 255, 0.1)" }}
    >
      Prossima Domanda
    </button>
  );
};

export default NextQuestionButton;
