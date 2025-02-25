// components/ActiveQuizScreen.tsx
import React from "react";
import ProgressBar from "./ProgressBar.tsx";
import TimerDisplay from "./TimerDisplay.tsx";
import QuestionInfo from "./QuestionInfo.tsx";
import OptionButton from "./OptionButton.tsx";
import AnswerButton from "./AnswerButton.tsx";
import ExplanationSection from "./ExplanationSection.tsx";
import type { Question } from "../App.tsx";

type Props = {
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

export const ActiveQuizScreen: React.FC<Props> = ({
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
      <ProgressBar progress={progress} />
      
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">{quizName}</h1>
        <TimerDisplay 
          timerEnabled={timerEnabled}
          timerActive={timerActive}
          timeRemaining={timeRemaining}
        />
      </div>
      
      <QuestionInfo 
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={totalQuestions}
        score={score}
      />
      
      <div className="text-xl font-semibold mb-6">
        {question.question}
      </div>
      
      <div className="space-y-4">
        {question.options.map(option => (
          <OptionButton 
            key={option} 
            option={option} 
            selectedAnswer={selectedAnswer} 
            showExplanation={showExplanation} 
            setSelectedAnswer={setSelectedAnswer}
            correctAnswer={question.correctAnswer}
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