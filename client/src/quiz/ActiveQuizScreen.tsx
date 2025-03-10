import React, { useEffect } from "react";
import ProgressBar from "../components/common/ProgressBar.tsx";
import TimerDisplay from "../components/common/TimerDisplay.tsx";
import QuestionInfo from "../components/common/QuestionInfo.tsx";
import ExplanationSection from "../components/ExplanationSection.tsx";
import type { Question } from "../components/type/Types.tsx";
import { Loader2, ArrowRight, CheckCircle, XCircle, ArrowLeft  } from "lucide-react";

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

  button:focus-visible, [role="button"]:focus-visible {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
  }
`;

type OptionSquareProps = {
  option: string;
  index: number;
  selected: boolean;
  correct: boolean;
  onSelect: (option: string) => void;
  showExplanation: boolean;
};

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
  correctAnswer?: string; // Add correctAnswer prop
};

type AiEvaluationProps = {
  aiScore: number | undefined;
  isLoading: boolean;
};

const normalizeText = (text: string): string => {
  return text.replace(/\s+/g, " ").trim();
};

const OptionSquare: React.FC<OptionSquareProps> = ({
  option,
  index,
  selected,
  correct,
  onSelect,
  showExplanation,
}) => {
  const normalizedOption = normalizeText(option);
  const letter = String.fromCharCode(65 + index);

  return (
    <div
      className="flex items-center group w-full mb-4"
      role="button"
      tabIndex={0}
      aria-label={`Opzione ${letter}: ${normalizedOption}`}
      onClick={() => onSelect(normalizedOption)}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(normalizedOption)}
    >
      <div
        className={`flex items-center w-full p-4 rounded-lg transition-all duration-200 border-2
          ${
            selected 
              ? `highlighted ${correct ? 'border-green-300' : 'border-red-300'} shadow-md`
              : 'border-gray-200 hover:border-blue-200'
          }`}
      >
        <div className="flex items-center w-full">
          <span className="text-lg font-medium mr-2 w-8">{letter}.</span>
          <span
            className={`text-base sm:text-lg relative z-10 ${
              selected ? "text-gray-800 font-medium" : "text-gray-700"
            }`}
          >
            {normalizedOption}
          </span>
          {showExplanation && (
            <span className="ml-auto">
              {correct ? (
                <CheckCircle className="text-green-500" size={20} aria-hidden="true" />
              ) : (
                <XCircle className="text-red-500" size={20} aria-hidden="true" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const AiEvaluation: React.FC<AiEvaluationProps> = ({ aiScore, isLoading }) => {
  return (
    <div className="flex justify-between items-center mt-4" aria-live="polite">
      <div className="flex items-center">
        {isLoading && <Loader2 className="animate-spin h-6 w-6 mr-2" aria-hidden="true" />}
        <span className="text-gray-700">
          {isLoading
            ? "Valutazione AI in corso..."
            : aiScore !== undefined
            ? `Valutazione AI: ${aiScore}/3`
            : ""}
        </span>
      </div>
    </div>
  );
};

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
  correctAnswer // Add correctAnswer parameter
}) => {
  return (
    <div className="mb-6 w-full">
      <textarea
        className="w-full p-4 border-2 border-gray-200 rounded-xl resize-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
        placeholder="Scrivi qui la tua risposta"
        value={answer}
        onChange={(e) => handleAnswerChange(e.target.value)}
        rows={4}
        disabled={isDisabled}
        aria-label="Campo per risposta aperta"
      />
      <AiEvaluation aiScore={aiScore} isLoading={isLoadingAi} />
      {showExplanation && (
        <div className="bg-gray-50 p-4 rounded-xl">
         <p className="text-green-600">
            <span className="emoji mr-2" aria-hidden="true">✅</span>
           Risposta corretta: <span className="font-normal">{correctAnswer}</span>
          </p>
        </div>
      )}
      <div className="flex justify-end mt-4">
        <button
          onClick={nextQuestion}
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors disabled:bg-gray-400"
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
  const totalQuestions = questions.length;
  const progress = (currentQuestionIndex / totalQuestions) * 100;
  const currentQuestion = questions[currentQuestionIndex];
  const selectedAnswer = currentQuestion.userAnswer;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const aiScore = currentQuestion.aiScore;
  const isDisabled = isQuizCompleted || (timerEnabled && timeRemaining === 0);

  useEffect(() => {
    if (currentQuestion.type === "multiple-choice" && selectedAnswer) {
      setShowExplanation(true);
    }
    if (currentQuestion.type === "open" && showExplanation) {
      setShowExplanation(false);
    }
  }, [selectedAnswer, currentQuestion.type,showExplanation,setShowExplanation]);

  if (!questions?.length) {
    return (
      <div className="p-4 text-center text-lg font-semibold text-gray-700">
        Nessuna domanda disponibile. Carica un file JSON o PDF per iniziare il quiz.
      </div>
    );
  }

  const handleOptionSelect = (value: string) => {
    const isCorrect = normalizeText(value) === normalizeText(currentQuestion.correctAnswer);
    
    if (isCorrect) {
      setScore(score + 1);
    }

    handleAnswer(currentQuestion.id, value, currentQuestion.explanation);
    setShowExplanation(true)
  };

  const isOptionCorrect = (option: string) => 
    normalizeText(option) === normalizeText(currentQuestion.correctAnswer);

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 space-y-6 max-w-2xl mx-4 sm:mx-auto">
      <style>{styles}</style>
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
      <button
        onClick={onBackToSetup}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Torna alla configurazione del quiz"
      >
        <ArrowLeft className="w-6 h-6 text-gray-600" />
      </button>
    </div>
      <ProgressBar progress={progress} aria-label="Progresso del quiz" />

      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b border-gray-200">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 break-words max-w-[70%]">
          {quizName}
        </h1>
        
        {timerEnabled && timerActive && currentQuestion.type === "multiple-choice" && (
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

      <div 
        className="question-text text-lg sm:text-xl mb-6 leading-tight bg-gray-50 p-5 rounded-xl border-l-4 border-blue-500"
        role="heading"
        aria-level={2}
      >
        <strong>{currentQuestion.question}</strong>
      </div>

      {currentQuestion.type === "multiple-choice" ? (
        <div className="space-y-4">
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
        <OpenAnswer
          answer={selectedAnswer || ""}
          handleAnswerChange={(value) =>
            handleAnswer(currentQuestion.id, value, currentQuestion.explanation)
          }
          nextQuestion={nextQuestion}
          questionId={currentQuestion.id}
          showExplanation={showExplanation}
          isLastQuestion={isLastQuestion}
          isLoadingAi={isLoadingAi}
          aiScore={aiScore}
          isDisabled={isDisabled}
          correctAnswer={currentQuestion.correctAnswer} // Pass the correctAnswer
        />
      )}
    </div>
  );
};

export default ActiveQuizScreen;
