// components/ActiveQuizScreen.tsx
import React from "react";
import ProgressBar from "../components/common/ProgressBar.tsx";
import TimerDisplay from "../components/common/TimerDisplay.tsx";
import QuestionInfo from "../components/common/QuestionInfo.tsx";
import ExplanationSection from "../components/ExplanationSection.tsx";
import type { Question } from "../components/type/Types.tsx";

const styles = `
@keyframes highlightAnim {
  0% { background-size: 0% 100%; }
  100% { background-size: 100% 100%; }
}

.highlighted {
  background-image: linear-gradient(to right, #fef08a 0%, #fef08a 100%);
  background-repeat: no-repeat;
  background-position: left center;
  animation: highlightAnim 0.3s ease-out;
}

@media (max-width: 640px) {
  .highlighted {
    background-size: 100% 100% !important;
    animation: none;
  }
}
`;

type OptionSquareProps = {
  option: string;
  selected: boolean;
  onSelect: (option: string) => void;
};

// Function to normalize text
const normalizeText = (text: string): string => {
  return text.replace(/\s+/g, ' ').trim();
};

const OptionSquare: React.FC<OptionSquareProps> = ({ option, selected, onSelect }) => {
  const normalizedOption = normalizeText(option);
  return (
    <div
      className="flex items-center cursor-pointer group w-full"
      onClick={() => onSelect(normalizedOption)}
    >
      <div
        className={`flex items-center w-full p-2 sm:p-3 rounded-md transition-all duration-200
          ${selected ? "highlighted border-yellow-400" : "hover:bg-gray-50"}`}
      >
        <span
          className={`text-base sm:text-lg relative z-10 flex-1 ${
            selected ? "text-gray-800 font-medium" : "text-gray-700"
          }`}
        >
          {normalizedOption}
        </span>
      </div>
    </div>
  );
};

type ActiveQuizScreenProps = {
  quizName: string;
  currentQuestionIndex: number;
  totalQuestions: number;
  question: Question;
  selectedAnswer: string | null;
  handleAnswer: (answer: string | null) => void;
  showExplanation: boolean;
  nextQuestion: () => void;
  timeRemaining: number;
  timerActive: boolean;
  timerEnabled: boolean;
  score: number;
};

const ActiveQuizScreen: React.FC<ActiveQuizScreenProps> = ({
  quizName,
  currentQuestionIndex,
  totalQuestions,
  question,
  selectedAnswer,
  handleAnswer,
  showExplanation,
  nextQuestion,
  timeRemaining,
  timerActive,
  timerEnabled,
  score,
}) => {
  const progress = (currentQuestionIndex / totalQuestions) * 100;

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-2xl mx-4 sm:mx-auto">
      <style>{styles}</style>

      <ProgressBar progress={progress} />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 break-words max-w-[70%]">
          {quizName}
        </h1>
        {timerEnabled && timerActive && (
          <TimerDisplay
            timerEnabled={timerEnabled}
            timerActive={timerActive}
            timeRemaining={timeRemaining}
          />
        )}
      </div>

      <QuestionInfo
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={totalQuestions}
        className="flex-col sm:flex-row items-start sm:items-center"
        score={score}
      />

      <div className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 leading-tight">
        {question.question}
      </div>

      <div className="space-y-2 sm:space-y-3">
        {question.options.map((option, idx) => (
          <OptionSquare
            key={idx}
            option={option}
            selected={selectedAnswer === normalizeText(option)} // Confronta le opzioni normalizzate
            onSelect={handleAnswer}
          />
        ))}
      </div>

      {showExplanation && (
        <ExplanationSection
          selectedAnswer={selectedAnswer}
          correctAnswer={normalizeText(question.correctAnswer)} // Normalizza anche la risposta corretta
          explanation={normalizeText(question.explanation)} // Normalizza la spiegazione
          nextQuestion={nextQuestion}
        />
      )}
    </div>
  );
};

export default ActiveQuizScreen;
