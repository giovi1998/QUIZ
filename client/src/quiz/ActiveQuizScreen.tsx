// ActiveQuizScreen.tsx
/**
 * @component ActiveQuizScreen
 * 
 * A modern, responsive quiz interface that handles both multiple-choice and open-ended questions.
 * Provides real-time feedback, progress tracking, and AI-assisted evaluation for open questions.
 * 
 * @param {string} quizName - The title of the current quiz
 * @param {Question[]} questions - Array of quiz questions with their associated data
 * @param {number} currentQuestionIndex - Zero-based index of the current question
 * @param {Function} handleAnswer - Callback for when user submits an answer
 * @param {boolean} showExplanation - Whether to display the explanation for the current question
 * @param {Function} nextQuestion - Callback to advance to the next question
 * @param {number} timeRemaining - Seconds remaining for timed questions
 * @param {boolean} timerActive - Whether the timer is currently running
 * @param {boolean} timerEnabled - Whether timing is enabled for this quiz
 * @param {number} score - Current user score
 * @param {Function} setScore - Callback to update the score
 * @param {boolean} isQuizCompleted - Whether the quiz has been completed
 * @param {Function} setShowExplanation - Callback to toggle explanation visibility
 * @param {boolean} isLoadingAi - Whether AI evaluation is in progress
 * @param {Function} onBackToSetup - Callback to return to quiz setup
 */

import React, { useEffect, useState } from "react";
import ProgressBar from "../components/common/ProgressBar.tsx";
import TimerDisplay from "../components/common/TimerDisplay.tsx";
import QuestionInfo from "../components/common/QuestionInfo.tsx";
import ExplanationSection from "../components/ExplanationSection.tsx";
import type { Question } from "../components/type/Types.tsx";
import {
  Loader2,
  ArrowRight,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Clock,
  Award,
  HelpCircle
} from "lucide-react";

// CSS animations and styles
const styles = `
  /* Highlight animation for selected options */
  @keyframes highlightAnim {
    0% { background-size: 0% 100%; }
    100% { background-size: 100% 100%; }
  }

  .highlighted {
    background-image: linear-gradient(to right, rgba(254, 240, 138, 0.5) 0%, rgba(254, 240, 138, 0.5) 100%);
    background-repeat: no-repeat;
    background-position: left center;
    animation: highlightAnim 0.3s ease-out forwards;
  }

  /* Pulse animation for timer when time is running low */
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
  
  .timer-warning {
    animation: pulse 1s infinite;
    color: #ef4444;
  }

  /* Responsive adjustments */
  @media (max-width: 640px) {
    .highlighted {
      background-size: 100% 100% !important;
      animation: none;
    }
  }

  .question-text {
    font-weight: 700 !important;
    line-height: 1.5;
  }

  /* Focus states for accessibility */
  button:focus-visible, [role="button"]:focus-visible {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
  }
  
  /* Card hover effects */
  .option-card {
    transition: all 0.2s ease;
  }
  
  .option-card:hover:not(.selected) {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
  
  /* Quiz container styles */
  .quiz-container {
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
  }
`;

/**
 * @typedef OptionSquareProps
 * Properties for the OptionSquare component
 */
type OptionSquareProps = {
  option: string;
  index: number;
  selected: boolean;
  correct: boolean;
  onSelect: (option: string) => void;
  showExplanation: boolean;
};

/**
 * @typedef OpenAnswerProps
 * Properties for the OpenAnswer component
 */
type OpenAnswerProps = {
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
};

/**
 * @typedef AiEvaluationProps
 * Properties for the AiEvaluation component
 */
type AiEvaluationProps = {
  aiScore: number | undefined;
  isLoading: boolean;
};

/**
 * Normalizes text by removing extra whitespace and trimming
 * @param {string} text - The text to normalize
 * @returns {string} Normalized text
 */
const normalizeText = (text: string): string => {
  return text.replace(/\s+/g, " ").trim();
};

/**
 * @component OptionSquare
 * Renders a selectable option for multiple-choice questions
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
      className="flex items-center group w-full mb-4"
      role="button"
      tabIndex={0}
      aria-label={`Opzione ${letter}: ${normalizedOption}`}
      onClick={() => onSelect(normalizedOption)}
      onKeyDown={(e) => e.key === "Enter" && onSelect(normalizedOption)}
    >
      <div
        className={`option-card flex items-center w-full p-4 rounded-lg transition-all duration-300 border-2
          ${selected ? `selected highlighted ${correct ? "border-green-400" : "border-red-400"} shadow-md` 
                    : "border-gray-200 hover:border-blue-300"}`}
      >
        <div className="flex items-center w-full">
          <span className="flex items-center justify-center text-lg font-medium mr-3 w-8 h-8 rounded-full bg-gray-100 text-gray-700">
            {letter}
          </span>
          <span
            className={`text-base sm:text-lg relative z-10 ${selected ? "text-gray-800 font-medium" : "text-gray-700"}`}
          >
            {normalizedOption}
          </span>
          {showExplanation && (
            <span className="ml-auto">
              {correct ? (
                <CheckCircle
                  className="text-green-500"
                  size={22}
                  aria-hidden="true"
                />
              ) : (
                <XCircle
                  className="text-red-500"
                  size={22}
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

/**
 * @component OpenAnswer
 * Renders a text area for open-ended questions
 */
const OpenAnswer: React.FC<OpenAnswerProps> = ({
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

/**
 * @typedef ActiveQuizScreenProps
 * Properties for the ActiveQuizScreen component
 */
type ActiveQuizScreenProps = {
  quizName: string;
  questions: Question[];
  currentQuestionIndex: number;
  handleAnswer: (
    questionId: string,
    answer: string | null,
    explanation: string | null
  ) => void;
  showExplanation: boolean;
  nextQuestion: () => void;
  timeRemaining: number;
  timerActive: boolean;
  timerEnabled: boolean;
  score: number;
  setScore: (score: number) => void;
  isQuizCompleted: boolean;
  setShowExplanation: (show: boolean) => void;
  isLoadingAi: boolean;
  onBackToSetup: () => void;
};

/**
 * @component ActiveQuizScreen
 * Main component for the active quiz interface
 */
const ActiveQuizScreen: React.FC<ActiveQuizScreenProps> = ({
  quizName,
  questions,
  currentQuestionIndex,
  handleAnswer,
  showExplanation,
  nextQuestion,
  timeRemaining,
  timerActive,
  timerEnabled,
  score,
  setScore,
  isQuizCompleted,
  setShowExplanation,
  isLoadingAi,
  onBackToSetup,
}) => {
  // Track if timer is running low (less than 10 seconds)
  const [isTimerWarning, setIsTimerWarning] = useState(false);
  
  const totalQuestions = questions.length;
  const progress = (currentQuestionIndex / totalQuestions) * 100;
  const currentQuestion = questions[currentQuestionIndex];
  const selectedAnswer = currentQuestion?.userAnswer;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const aiScore = currentQuestion?.aiScore;
  
  // Determine if the question is disabled (quiz completed or time expired)
  const isDisabled =
    isQuizCompleted ||
    (currentQuestion?.type === "multiple-choice" &&
      timerEnabled &&
      timeRemaining === 0);

  // Check if timer is running low
  useEffect(() => {
    if (timerEnabled && timerActive && timeRemaining <= 10 && timeRemaining > 0) {
      setIsTimerWarning(true);
    } else {
      setIsTimerWarning(false);
    }
  }, [timeRemaining, timerEnabled, timerActive]);

  // Handle explanation visibility based on question type and answer status
  useEffect(() => {
    if (currentQuestion?.type === "multiple-choice" && selectedAnswer) {
      setShowExplanation(true);
    }
    if (currentQuestion?.type === "open" && showExplanation) {
      setShowExplanation(false);
    }
  }, [selectedAnswer, currentQuestion?.type, showExplanation, setShowExplanation]);

  // Show message if no questions are available
  if (!questions?.length) {
    return (
      <div className="p-8 text-center rounded-xl bg-gray-50 shadow-md max-w-md mx-auto mt-8">
        <HelpCircle className="mx-auto mb-4 text-blue-500" size={48} />
        <p className="text-lg font-semibold text-gray-700">
          Nessuna domanda disponibile. Carica un file JSON o PDF per iniziare il quiz.
        </p>
      </div>
    );
  }

  // Handle option selection for multiple choice questions
  const handleOptionSelect = (value: string) => {
    // Check if answer is correct and update score
    const isCorrect = normalizeText(value) === normalizeText(currentQuestion.correctAnswer);
    if (isCorrect) {
      setScore(score + 1);
    }

    // Submit answer and show explanation
    handleAnswer(currentQuestion.id, value, currentQuestion.explanation);
    setShowExplanation(true);
  };

  // Check if an option is the correct answer
  const isOptionCorrect = (option: string) =>
    normalizeText(option) === normalizeText(currentQuestion.correctAnswer);

  return (
    <div className="quiz-container bg-white rounded-xl shadow-lg p-5 sm:p-8 space-y-6 max-w-2xl mx-4 sm:mx-auto relative">
      <style>{styles}</style>
      
      {/* Back button */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10">
        <button
          onClick={onBackToSetup}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center"
          aria-label="Torna alla configurazione del quiz"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
      </div>
      
      {/* Progress bar */}
      <ProgressBar progress={progress} aria-label="Progresso del quiz" />

      {/* Quiz header with title and timer */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b border-gray-200">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 break-words max-w-[70%]">
          {quizName}
        </h1>

        {timerEnabled &&
          timerActive &&
          currentQuestion.type === "multiple-choice" && (
            <div className={`flex items-center ${isTimerWarning ? 'timer-warning' : ''}`}>
              <Clock className={`w-5 h-5 mr-1 ${isTimerWarning ? 'text-red-500' : 'text-blue-500'}`} />
              <span className={`font-medium ${isTimerWarning ? 'text-red-500' : 'text-blue-500'}`}>
                {timeRemaining} sec
              </span>
            </div>
          )}
      </div>

      {/* Question info (number and score) */}
      <QuestionInfo
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={totalQuestions}
        className="flex-col sm:flex-row items-start sm:items-center"
        score={score}
      />

      {/* Question text */}
      <div
        className="question-text text-lg sm:text-xl mb-6 leading-relaxed bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-xl border-l-4 border-blue-500"
        role="heading"
        aria-level={2}
      >
        {currentQuestion.question}
      </div>

      {/* Question content - either multiple choice or open answer */}
      {currentQuestion.type === "multiple-choice" ? (
        <div className="space-y-4">
          {/* Multiple choice options */}
          {currentQuestion.options.map((option, idx) => (
            <OptionSquare
              key={idx}
              index={idx}
              option={option}
              selected={selectedAnswer === normalizeText(option)}
              correct={isOptionCorrect(option)}
              onSelect={handleOptionSelect}
              showExplanation={showExplanation}
            />
          ))}

          {/* Explanation section for multiple choice */}
          {showExplanation && currentQuestion.type === "multiple-choice" && (
            <ExplanationSection
              selectedAnswer={selectedAnswer}
              correctAnswer={normalizeText(currentQuestion.correctAnswer)}
              explanation={normalizeText(currentQuestion.explanation)}
              nextQuestion={nextQuestion}
            />
          )}
        </div>
      ) : (
        /* Open answer textarea and controls */
        <OpenAnswer
          answer={selectedAnswer || ""}
          handleAnswerChange={(value) =>
            handleAnswer(
              currentQuestion.id,
              value,
              currentQuestion.explanation
            )
          }
          nextQuestion={nextQuestion}
          questionId={currentQuestion.id}
          showExplanation={showExplanation}
          isLastQuestion={isLastQuestion}
          isLoadingAi={isLoadingAi}
          aiScore={aiScore}
          isDisabled={isDisabled}
          correctAnswer={currentQuestion.correctAnswer}
        />
      )}
    </div>
  );
};

export default ActiveQuizScreen;
