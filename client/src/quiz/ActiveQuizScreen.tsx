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
import type { Question } from "../components/type/Types.tsx";
import { HelpCircle } from "lucide-react";

// Import the new components
import QuizHeader from "../components/quiz/QuizHeader.tsx";
import QuestionDisplay from "../components/quiz/QuestionDisplay.tsx";
import MultipleChoiceQuestion from "../components/quiz/MultipleChoiceQuestion.tsx";
import OpenAnswerQuestion from "../components/quiz/OpenAnswerQuestion.tsx";
import QuestionInfo from "../components/common/QuestionInfo.tsx";

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
 * Normalizes text by removing extra whitespace and trimming
 * @param {string} text - The text to normalize
 * @returns {string} Normalized text
 */
const normalizeText = (text: string): string => {
  return text.replace(/\s+/g, " ").trim();
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

  return (
    <div className="quiz-container bg-white rounded-xl shadow-lg p-5 sm:p-8 space-y-6 max-w-2xl mx-4 sm:mx-auto relative">
      <style>{styles}</style>
      
      {/* Quiz Header Component */}
      <QuizHeader 
        quizName={quizName}
        progress={progress}
        timeRemaining={timeRemaining}
        timerActive={timerActive}
        timerEnabled={timerEnabled}
        isTimerWarning={isTimerWarning}
        onBackToSetup={onBackToSetup}
        questionType={currentQuestion.type}
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={totalQuestions}
        score={score}
      />

      {/* Question info (number and score) */}
      <QuestionInfo
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={totalQuestions}
        className="flex-col sm:flex-row items-start sm:items-center"
        score={score}
      />

      {/* Question Display Component */}
      <QuestionDisplay question={currentQuestion.question} />

      {/* Question content - either multiple choice or open answer */}
      {currentQuestion.type === "multiple-choice" ? (
        <MultipleChoiceQuestion 
          options={currentQuestion.options}
          selectedAnswer={selectedAnswer}
          correctAnswer={currentQuestion.correctAnswer}
          onSelect={handleOptionSelect}
          showExplanation={showExplanation}
          explanation={currentQuestion.explanation}
          nextQuestion={nextQuestion}
        />
      ) : (
        <OpenAnswerQuestion 
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
