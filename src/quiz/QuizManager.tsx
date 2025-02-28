// components/QuizManager.tsx
import React, {
  useState,
  useEffect,
  useCallback,
  Dispatch,
  SetStateAction,
} from "react";
import { Question, Report, QuizStatus } from "../App.tsx";
import ActiveQuizScreen from "./ActiveQuizScreen.tsx";
import { CompletedScreen } from "./CompletedScreen.tsx";

interface QuizManagerProps {
  quizName: string;
  questions: Question[];
  setQuestions: Dispatch<SetStateAction<Question[]>>;
  quizStatus: QuizStatus;
  setQuizStatus: Dispatch<SetStateAction<QuizStatus>>;
  timerEnabled: boolean;
  timerDuration: number;
  showTemporaryAlert: (message: string) => void;
}

const QuizManager = ({
  quizName,
  questions,
  setQuestions,
  quizStatus,
  setQuizStatus,
  timerEnabled,
  timerDuration,
  showTemporaryAlert,
}: QuizManagerProps) => {
  console.log("[QuizManager] Component rendered");

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answers, setAnswers] = useState<string[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(timerDuration);
  const [timerActive, setTimerActive] = useState(false);
  const [score, setScore] = useState(0); // Added score state

  useEffect(() => {
    console.log("[QuizManager] useEffect - timerActive or timeRemaining changed");
    if (timerActive && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining((prev) => prev - 1);
        console.log("[QuizManager] Time remaining:", timeRemaining - 1);
      }, 1000);
      return () => {
        console.log("[QuizManager] Clearing timer");
        clearTimeout(timer);
      };
    } else if (timerActive && timeRemaining === 0) {
      console.log("[QuizManager] Timer reached 0, calling handleAnswer");
      handleAnswer(null);
    }
  }, [timerActive, timeRemaining]);

  const handleAnswer = useCallback((answer: string | null) => {
    console.log("[QuizManager] handleAnswer called with:", answer);
    if (!showExplanation) {
      setSelectedAnswer(answer);
      setShowExplanation(true);
      if (answer && questions[currentQuestionIndex].correctAnswer === answer) {
        console.log("[QuizManager] Correct answer!");
        setScore((prevScore) => {
          const newScore = prevScore + 1;
          console.log("[QuizManager] Score updated:", newScore);
          return newScore;
        });
        setAnswers((prev) => {
          const newAnswers = [...prev];
          newAnswers[currentQuestionIndex] = answer;
          return newAnswers;
        });
      } else {
        console.log("[QuizManager] Incorrect answer");
        setAnswers((prev) => {
          const newAnswers = [...prev];
          newAnswers[currentQuestionIndex] = answer || "Nessuna risposta";
          return newAnswers;
        });
      }
    }
  }, [showExplanation, currentQuestionIndex, questions]);

  useEffect(() => {
    console.log("[QuizManager] useEffect - quizStatus changed to:", quizStatus);
    if (quizStatus === "active" && questions.length > 0) {
      setTimeRemaining(timerDuration);
      setTimerActive(timerEnabled);
      console.log(
        "[QuizManager] Timer reset to:",
        timerDuration,
        "and set to:",
        timerEnabled
      );
    }
  }, [currentQuestionIndex, timerEnabled, timerDuration, quizStatus, questions]);

  const nextQuestion = useCallback(() => {
    console.log("[QuizManager] nextQuestion called");
    setTimeRemaining(timerDuration);
    setTimerActive(timerEnabled);
    setSelectedAnswer(null);
    setShowExplanation(false);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prevIndex) => {
        const newIndex = prevIndex + 1;
        console.log("[QuizManager] Moving to next question, index:", newIndex);
        return newIndex;
      });
    } else {
      console.log("[QuizManager] Last question reached. Completing quiz.");
      setTimeout(() => {
        setQuizStatus("completed");
      }, 0);
    }
  }, [
    currentQuestionIndex,
    questions.length,
    timerDuration,
    timerEnabled,
    setQuizStatus,
  ]);

  const resetQuiz = useCallback(() => {
    console.log("[QuizManager] resetQuiz called");
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setShowExplanation(false);
    setSelectedAnswer(null);
    setTimeRemaining(timerDuration);
    setTimerActive(timerEnabled);
    setQuizStatus("active");
    setQuestions([]);
    setScore(0); // Reset score on quiz reset
    console.log("[QuizManager] Quiz reset");
  }, [timerDuration, timerEnabled, setQuizStatus, setQuestions]);

  const clearQuestions = useCallback(() => {
    console.log("[QuizManager] clearQuestions called");
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setShowExplanation(false);
    setSelectedAnswer(null);
    setTimeRemaining(timerDuration);
    setTimerActive(false);
    setQuizStatus("empty");
    setScore(0);
    console.log("[QuizManager] Questions cleared, status:", quizStatus);
  }, [setQuestions, setQuizStatus, timerDuration]);

  const generateReport = useCallback((): Report => {
    console.log("[QuizManager] generateReport called");
    const totalQuestions = questions.length;
    const correctAnswers = answers.filter((answer, index) => {
      return answer === questions[index].correctAnswer;
    }).length;
    const percentage =
      totalQuestions > 0
        ? Math.round((correctAnswers / totalQuestions) * 100)
        : 0;
    const missed =
      questions.length > 0
        ? questions
            .map((q, idx) => ({
              question: q.question,
              yourAnswer: answers[idx] || "Nessuna risposta",
              correctAnswer: q.correctAnswer,
            }))
            .filter(
              (_, idx) =>
                answers[idx] && answers[idx] !== questions[idx].correctAnswer
            )
        : [];
    console.log("[QuizManager] Report generated");
    return { totalQuestions, correctAnswers, percentage, missed };
  }, [questions, answers]);

  const backToSetup = useCallback(() => {
    console.log("[QuizManager] backToSetup called");
    clearQuestions();
    setQuizStatus("setup");
  }, [clearQuestions, setQuizStatus]);

  // Rendering condizionale
  let content;
  console.log("[QuizManager] Rendering content with quizStatus:", quizStatus);

  if (quizStatus === "active") {
    if (questions.length > 0) {
      content = (
        <ActiveQuizScreen
          quizName={quizName}
          currentQuestionIndex={currentQuestionIndex}
          totalQuestions={questions.length}
          question={questions[currentQuestionIndex]}
          selectedAnswer={selectedAnswer}
          handleAnswer={handleAnswer}
          showExplanation={showExplanation}
          nextQuestion={nextQuestion}
          timeRemaining={timeRemaining}
          timerActive={timerActive}
          timerEnabled={timerEnabled}
          score={score}
        />
      );
    } else {
      content = (
        <div className="p-4 text-center text-lg font-semibold">
          Nessuna domanda disponibile. Carica un file JSON o PDF per iniziare
          il quiz.
        </div>
      );
    }
  } else if (quizStatus === "completed") {
    content = (
      <CompletedScreen
        quizName={quizName}
        report={generateReport()}
        resetQuiz={resetQuiz}
        backToSetup={backToSetup}
      />
    );
  } else {
    content = null;
  }

  return <>{content}</>;
};
export default QuizManager;

export type QuizManagerType = {
  resetQuiz: () => void;
  backToSetup: () => void;
};
