import React, { useEffect, useState } from "react";
import ProgressBar from "../ProgressBar.tsx";
import TimerDisplay from "../TimerDisplay.tsx";
import QuestionInfo from "../QuestionInfo.tsx";
import AnswerButton from "../AnswerButton.tsx";
import ExplanationSection from "../ExplanationSection.tsx";
import type { Question } from "../types.ts"; // Import Question
import { QuestionDisplay } from "./QuestionDisplay.tsx";
import { OptionsList } from "./OptionsList.tsx";
import { shuffleArray } from "../types.ts";

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
  setCurrentQuestionIndex: (index: number) => void;
  setQuizStatus: (status: "setup" | "active" | "completed" | "empty") => void;
  timerDuration: number;
  dispatch: React.Dispatch<any>;
};

const ActiveQuizScreen: React.FC<ActiveQuizScreenProps> = ({
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
  setCurrentQuestionIndex,
  setQuizStatus,
  timerDuration,
  dispatch
}) => {
  const progress = (currentQuestionIndex / totalQuestions) * 100;
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);

  useEffect(() => {
    if (question) {
      setShuffledOptions(shuffleArray(question.options));
    }
  }, [question]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-2xl mx-4 sm:mx-auto">
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
            className="text-base sm:text-lg"
          />
        )}
      </div>

      <QuestionInfo
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={totalQuestions}
        score={score}
        className="flex-col sm:flex-row items-start sm:items-center"
      />

      <QuestionDisplay question={question.question} />

      <OptionsList
        shuffledOptions={shuffledOptions}
        selectedAnswer={selectedAnswer}
        setSelectedAnswer={setSelectedAnswer}
        showExplanation={showExplanation}
      />

      {!showExplanation ? (
        <AnswerButton
          selectedAnswer={selectedAnswer}
          handleAnswer={handleAnswer}
          className=""
        />
      ) : (
        <ExplanationSection
          selectedAnswer={selectedAnswer}
          correctAnswer={question.correctAnswer}
          explanation={question.explanation}
          nextQuestion={() => {
            console.log("nextQuestion called. Current index:", currentQuestionIndex + 1, "of", totalQuestions);


            dispatch({ type: 'SET_SELECTED_ANSWER', payload: null });
            dispatch({ type: 'SET_SHOW_EXPLANATION', payload: false });
            if (currentQuestionIndex < totalQuestions - 1) {
              setCurrentQuestionIndex(currentQuestionIndex + 1);
            } else {
setQuizStatus("completed");
dispatch({ type: 'RESET_SCORE' });

              return; // **Added return here**
            }
            if (timerEnabled) {
              dispatch({ type: 'SET_TIMER_ACTIVE', payload: timerEnabled });
              dispatch({ type: 'SET_TIME_REMAINING', payload: timerDuration });
            }
          }}
          className="mt-4 sm:mt-6"
        />
      )}
    </div>
  );
};

export default ActiveQuizScreen;
