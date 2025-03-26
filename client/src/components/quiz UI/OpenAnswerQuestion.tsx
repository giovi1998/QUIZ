// OpenAnswerQuestion.tsx
/**
 * @component OpenAnswerQuestion
 * 
 * Handles the UI and logic for open-ended questions.
 * 
 * @param {string} answer - The user's current answer text
 * @param {Function} handleAnswerChange - Callback for when user changes their answer
 * @param {Function} nextQuestion - Callback to advance to the next question
 * @param {string} questionId - The ID of the current question
 * @param {boolean} showExplanation - Whether to display the explanation
 * @param {boolean} isLastQuestion - Whether this is the final question in the quiz
 * @param {boolean} isLoadingAi - Whether AI evaluation is in progress
 * @param {number} aiScore - The score assigned by AI evaluation (0-3)
 * @param {boolean} isDisabled - Whether the answer field should be disabled
 * @param {string} correctAnswer - The correct answer for the question
 */

import React from "react";
import { CheckCircle, Loader2, ArrowRight, Award, HelpCircle } from "lucide-react";

/**
 * @typedef AiEvaluationProps
 * Properties for the AiEvaluation component
 */
type AiEvaluationProps = {
  aiScore: number | undefined;
  isLoading: boolean;
};

/**
 * @component AiEvaluation
 * Displays AI evaluation status and score for open-ended questions
 */
const AiEvaluation: React.FC<AiEvaluationProps> = ({ aiScore, isLoading }) => {
  return (
    <div className="flex justify-between items-center mt-4 bg-gray-50 p-3 rounded-lg" aria-live="polite">
      <div className="flex items-center">
        {isLoading ? (
          <>
            <Loader2 className="animate-spin h-6 w-6 mr-2 text-blue-500" aria-hidden="true" />
            <span className="text-gray-700 font-medium">Valutazione AI in corso...</span>
          </>
        ) : aiScore !== undefined ? (
          <>
            <Award className="h-6 w-6 mr-2 text-blue-500" aria-hidden="true" />
            <span className="text-gray-700 font-medium">
              Valutazione AI: <span className="text-blue-600 font-bold">{aiScore}/3</span>
            </span>
          </>
        ) : null}
      </div>
    </div>
  );
};

interface OpenAnswerQuestionProps {
  answer: string;
  handleAnswerChange: (answer: string) => void;
  nextQuestion: () => void;
  questionId: string;
  showExplanation: boolean;
  isLastQuestion: boolean;
  isLoadingAi: boolean;
  aiScore?: number;
  isDisabled: boolean;
  correctAnswer?: string;
}

const OpenAnswerQuestion: React.FC<OpenAnswerQuestionProps> = ({
  answer,
  handleAnswerChange,
  nextQuestion,
  questionId,
  showExplanation,
  isLastQuestion,
  isLoadingAi,
  aiScore,
  isDisabled,
  correctAnswer,
}) => {
  const placeholderText = `Scrivi qui la tua risposta ${correctAnswer ? "(Suggerimento: " + correctAnswer + ")" : ""}`;

  return (
    <div className="mb-6 w-full">
      <div className="relative">
        <textarea
          className="w-full p-4 border-2 border-gray-200 rounded-xl resize-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all min-h-[120px]"
          placeholder={placeholderText}
          value={answer}
          onChange={(e) => handleAnswerChange(e.target.value)}
          rows={4}
          disabled={isDisabled}
          aria-label="Campo per risposta aperta"
        />
        {answer.length === 0 && (
          <HelpCircle className="absolute right-4 top-4 text-gray-300" size={20} />
        )}
      </div>
      
      {aiScore !== undefined || isLoadingAi ? (
        <AiEvaluation aiScore={aiScore} isLoading={isLoadingAi} />
      ) : null}
      
      {showExplanation && (
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl mt-4 border-l-4 border-green-400">
          <p className="text-green-700 flex items-center">
            <CheckCircle className="mr-2" size={18} />
            <span className="font-semibold">Risposta corretta:</span>{" "}
            <span className="ml-1">{correctAnswer}</span>
          </p>
        </div>
      )}
      
      <div className="flex justify-end mt-4">
        <button
          onClick={nextQuestion}
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors disabled:bg-gray-400 shadow-md hover:shadow-lg"
          disabled={isLoadingAi || isDisabled}
          aria-label={isLastQuestion ? "Termina quiz" : "Prossima domanda"}
        >
          {isLastQuestion ? "Termina" : "Avanti"}
          <ArrowRight className="ml-2" size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

export default OpenAnswerQuestion;