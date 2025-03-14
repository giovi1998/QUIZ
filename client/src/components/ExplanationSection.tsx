/**
 * ExplanationSection Component
 *
 * A modern, responsive feedback and explanation section displayed after a user answers a question.
 * Provides visual feedback on correctness, detailed explanation, and navigation to the next question.
 *
 * @component
 * @param selectedAnswer - The answer selected by the user (or null if none selected)
 * @param correctAnswer - The correct answer to the question
 * @param explanation - Detailed explanation of why the correct answer is right
 * @param nextQuestion - Handler function to proceed to the next question
 */
import React from "react";
import { Check, X } from "lucide-react";

export interface ExplanationSectionProps {
  selectedAnswer: string | null;
  correctAnswer: string;
  explanation: string;
  nextQuestion: () => void;
}

const ExplanationSection: React.FC<ExplanationSectionProps> = ({
  selectedAnswer,
  correctAnswer,
  explanation,
  nextQuestion,
}) => {
  // Determine if the user selected the correct answer
  const isCorrect = selectedAnswer === correctAnswer;

  return (
    <div className="mt-8 animate-fadeIn">
      {/* Feedback container with enhanced visual design */}
      <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm space-y-4 transition-all duration-300">
        {/* Result indicator with icon */}
        <div className="flex items-center mb-4">
          {isCorrect ? (
            // Correct answer feedback
            <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg">
              <Check 
                size={28} 
                color="#16a34a"  
                strokeWidth={2.5} 
                className="animate-scaleIn" 
              />
              <span className="text-green-700 font-semibold text-lg">Corretto!</span>
            </div>
          ) : (
            // Incorrect answer feedback
            <div className="flex items-center gap-2 bg-red-50 px-4 py-2 rounded-lg">
              <X 
                size={28} 
                color="#dc2626"  
                strokeWidth={2.5} 
                className="animate-scaleIn" 
              />
              <span className="text-red-700 font-semibold text-lg">Sbagliato!</span>
            </div>
          )}
        </div>

        {/* Explanation content with improved typography */}
        <div className="text-gray-700 text-base leading-relaxed bg-white p-4 rounded-lg border border-gray-100">
          {explanation}
        </div>
      </div>

      {/* Next question button with enhanced styling and hover effects */}
      <button
        className="w-full py-3 mt-6 rounded-lg bg-blue-600 text-white font-medium 
                 hover:bg-blue-700 active:bg-blue-800 
                 transition-all duration-300 transform hover:-translate-y-1"
        onClick={nextQuestion}
        style={{ boxShadow: "0 4px 14px rgba(59, 130, 246, 0.25)" }}
      >
        Prossima Domanda
      </button>
    </div>
  );
};

export default ExplanationSection;
