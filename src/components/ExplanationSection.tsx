// ExplanationSection.tsx
import React from "react";
import { Check, X } from "lucide-react";

type ExplanationSectionProps = {
  selectedAnswer: string | null;
  correctAnswer: string;
  explanation: string;
  nextQuestion: () => void;
};

const ExplanationSection: React.FC<ExplanationSectionProps> = ({
  selectedAnswer,
  correctAnswer,
  explanation,
  nextQuestion,
}) => {
  return (
    <div className="mt-8">
      <div className="bg-gray-50 p-6 rounded-lg space-y-4">
        <div className="flex items-center mb-4">
          {selectedAnswer === correctAnswer ? (
            <div className="flex items-center mr-3">
              <Check 
              size={40} 
              color="#65a30d" // colore verde acceso
              strokeWidth={2} 
              className="mr-1" 
            />
            <span className="text-red-600 font-semibold">Corretto!</span>
          </div>
          ) : (
            <div className="flex items-center mr-3">
              <X 
                size={40} 
                color="#ef4444" // colore rosso acceso
                strokeWidth={2} 
                className="mr-1" 
              />
              <span className="text-red-600 font-semibold">Sbagliato!</span>
            </div>
          )}
        </div>
        <div className="text-gray-700 text-base">
          {explanation}
        </div>
      </div>
      <button
        className="w-full py-3 mt-6 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all"
        onClick={nextQuestion}
        style={{ boxShadow: "0 8px 15px rgba(0, 100, 255, 0.1)" }}
      >
        Prossima Domanda
      </button>
    </div>
  );
};

export default ExplanationSection;