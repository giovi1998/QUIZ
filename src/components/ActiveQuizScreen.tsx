// components/ActiveQuizScreen.tsx
import React from "react";
import ProgressBar from "./ProgressBar.tsx";
import TimerDisplay from "./TimerDisplay.tsx";
import QuestionInfo from "./QuestionInfo.tsx";
import AnswerButton from "./AnswerButton.tsx";
import ExplanationSection from "./ExplanationSection.tsx";
import type { Question } from "../App.tsx";

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
`;

type OptionSquareProps = {
  option: string;
  selected: boolean;
  onSelect: () => void;
};

const OptionSquare: React.FC<OptionSquareProps> = ({ option, selected, onSelect }) => {
  return (
    <div 
      className="flex items-center cursor-pointer group w-full"
      onClick={onSelect}
    >
      <div className={`flex items-center w-full p-3 rounded-md transition-all duration-200
        ${selected 
          ? "highlighted border-yellow-400" 
          : "hover:bg-gray-50"}`}
      >
        <span className={`text-lg relative z-10 flex-1
          ${selected ? "text-gray-800 font-medium" : "text-gray-700"}`}
        >
          {option}
        </span>
      </div>
    </div>
  );
};

type ActiveQuizScreenProps = {
  quizName: string;
  currentQuestionIndex: number;
  totalQuestions: number;
  score: number;
  question: Question;
  selectedAnswer: string | null;
  setSelectedAnswer: (answer: string | null) => void;
  showExplanation: boolean;
  handleAnswer: (answer: string | null) => void;
  nextQuestion: () => void;
  timeRemaining: number;
  timerActive: boolean;
  timerEnabled: boolean;
};

export const ActiveQuizScreen: React.FC<ActiveQuizScreenProps> = ({
  quizName,
  currentQuestionIndex,
  totalQuestions,
  score,
  question,
  selectedAnswer,
  setSelectedAnswer,
  showExplanation,
  handleAnswer,
  nextQuestion,
  timeRemaining,
  timerActive,
  timerEnabled,
}) => {
  const progress = (currentQuestionIndex / totalQuestions) * 100;

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 space-y-6 max-w-md mx-auto">
      <style>{styles}</style>
      
      <ProgressBar progress={progress} />

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">{quizName}</h1>
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
        score={score}
      />

      <div className="text-xl font-semibold mb-6">
        {question.question}
      </div>

      <div className="space-y-2">
        {question.options.map((option, idx) => (
          <OptionSquare
            key={idx}
            option={option}
            selected={selectedAnswer === option}
            onSelect={() => {
              if (!showExplanation) {
                setSelectedAnswer(option);
              }
            }}
          />
        ))}
      </div>

      {!showExplanation && (
        <AnswerButton 
          selectedAnswer={selectedAnswer}
          handleAnswer={handleAnswer}
        />
      )}

      {showExplanation && (
        <ExplanationSection 
          selectedAnswer={selectedAnswer}
          correctAnswer={question.correctAnswer}
          explanation={question.explanation}
          nextQuestion={nextQuestion}
        />
      )}
    </div>
  );
};

export default ActiveQuizScreen;