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

.question-text {
  font-weight: 700 !important;
}
`;

type OptionSquareProps = {
  option: string;
  index: number;
  selected: boolean;
  onSelect: (option: string) => void;
};

// Function to normalize text
const normalizeText = (text: string): string => {
  return text.replace(/\s+/g, ' ').trim();
};

const OptionSquare: React.FC<OptionSquareProps> = ({ option, index, selected, onSelect }) => {
  const normalizedOption = normalizeText(option);
  const letter = String.fromCharCode(65 + index);
  
  return (
    <div
      className="flex items-center cursor-pointer group w-full mb-4 pl-12"
      onClick={() => onSelect(normalizedOption)}
    >
      <div
        className={`flex items-center w-full p-4 rounded-md transition-all duration-200 border
          ${selected 
            ? "highlighted border-yellow-400 shadow-md" 
            : "border-gray-200 hover:bg-gray-50 hover:border-gray-300"}`}
      >
        <div className="flex items-center w-full">
          <span className="text-lg font-medium mr-2">{letter}.</span>
          <span
            className={`text-base sm:text-lg relative z-10 ${
              selected ? "text-gray-800 font-medium" : "text-gray-700"
            }`}
          >
            {normalizedOption}
          </span>
        </div>
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
    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:p-8 space-y-6 max-w-2xl mx-4 sm:mx-auto">
      <style>{styles}</style>

      <ProgressBar progress={progress} />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4 border-gray-100">
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

      <div className="question-text text-lg sm:text-xl mb-6 leading-tight bg-gray-50 p-5 rounded-lg border-l-4 border-blue-500 ml-4">
        <strong>{question.question}</strong>
      </div>

      <div className="mt-8">
        {question.options.map((option, idx) => (
          <OptionSquare
            key={idx}
            index={idx}
            option={option}
            selected={selectedAnswer === normalizeText(option)}
            onSelect={handleAnswer}
          />
        ))}
      </div>

      {showExplanation && (
        <ExplanationSection
          selectedAnswer={selectedAnswer}
          correctAnswer={normalizeText(question.correctAnswer)}
          explanation={normalizeText(question.explanation)}
          nextQuestion={nextQuestion}
        />
      )}
    </div>
  );
};

export default ActiveQuizScreen;