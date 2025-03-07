// quiz/QuizManager.tsx
import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import ActiveQuizScreen from "./ActiveQuizScreen.tsx";
import ReportQuiz from "../components/common/ReportQuiz.tsx";
import { QuizStatus, Question, Report } from "../components/type/Types.tsx";

interface MissedQuestion {
  question: string;
  yourAnswer: string;
  correctAnswer: string;
}

interface QuizManagerProps {
  quizName: string;
  questions: Question[];
  quizStatus: QuizStatus;
  setQuizStatus: React.Dispatch<React.SetStateAction<QuizStatus>>;
  timerEnabled: boolean;
  timerDuration: number;
  showTemporaryAlert: (message: string) => void;
}

const QuizManager: React.FC<QuizManagerProps> = ({
  quizName,
  questions: initialQuestions,
  quizStatus,
  setQuizStatus,
  timerEnabled,
  timerDuration,
  showTemporaryAlert,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(timerDuration);
  const [timerActive, setTimerActive] = useState(timerEnabled);
  const [userAnswers, setUserAnswers] = useState<{ [questionId: string]: string }>({});
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [score, setScore] = useState(0);
  const [report, setReport] = useState<Report | null>(null);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);

  // Sincronizza le domande quando cambiano le initialQuestions
  useEffect(() => {
    setQuestions(initialQuestions);
  }, [initialQuestions]);

  const checkAnswer = (userAnswer: string, correctAnswer: string) => {
    return userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
  };

  const nextQuestion = useCallback(() => {
    const currentQuestion = questions[currentQuestionIndex];
    
    // Aggiorna il punteggio
    if (currentQuestion) {
      const userAnswer = userAnswers[currentQuestion.id];
      
      if (currentQuestion.type === "multiple-choice") {
        if (userAnswer && checkAnswer(userAnswer, currentQuestion.correctAnswer)) {
          setScore(prev => prev + 1);
        }
      } else if (currentQuestion.type === "open" && userAnswer) {
        setScore(prev => prev + 1);
      }
    }

    // Reset timer e indice
    setTimeRemaining(timerDuration);
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowExplanation(false);
    } else {
      calculateReport();
    }
  }, [currentQuestionIndex, questions, userAnswers, timerDuration]);

  useEffect(() => {
    if (timerEnabled && timerActive && timeRemaining > 0) {
      timerRef.current = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      calculateReport();
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeRemaining, timerEnabled, timerActive]);

  const handleAnswer = useCallback((questionId: string, answer: string | null) => {
    setUserAnswers(prev => ({ 
      ...prev, 
      [questionId]: answer || "" 
    }));
    
    setQuestions(prev => 
      prev.map(q => 
        q.id === questionId ? { ...q, userAnswer: answer || "" } : q
      )
    );
  }, []);

  const generateReport = useCallback((): Report => {
    const missed: MissedQuestion[] = [];
    let correctAnswers = 0;

    questions.forEach(q => {
      const userAnswer = userAnswers[q.id];
      
      if (q.type === "multiple-choice") {
        if (userAnswer && checkAnswer(userAnswer, q.correctAnswer)) {
          correctAnswers++;
        } else {
          missed.push({
            question: q.question,
            yourAnswer: userAnswer || "Nessuna risposta",
            correctAnswer: q.correctAnswer
          });
        }
      } else if (q.type === "open") {
        if (userAnswer) {
          correctAnswers++;
        } else {
          missed.push({
            question: q.question,
            yourAnswer: "Nessuna risposta",
            correctAnswer: "Domanda aperta - risposta libera"
          });
        }
      }
    });

    return {
      totalQuestions: questions.length,
      correctAnswers,
      percentage: Math.round((correctAnswers / questions.length) * 100),
      missed
    };
  }, [questions, userAnswers]);

  const calculateReport = useCallback(() => {
    if (report) return;
    
    const generatedReport = generateReport();
    setReport(generatedReport);
    setTimerActive(false);
    setIsQuizCompleted(true);
    setQuizStatus("completed");
  }, [generateReport, report, setQuizStatus]);

  const restartQuiz = useCallback(() => {
    setQuizStatus("setup");
    setReport(null);
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowExplanation(false);
    setTimeRemaining(timerDuration);
    setTimerActive(timerEnabled);
    setUserAnswers({});
    setIsQuizCompleted(false);
    setQuestions(initialQuestions.map(q => ({ ...q, userAnswer: "" })));
  }, [initialQuestions, timerDuration, timerEnabled, setQuizStatus]);

  if (!questions?.length) {
    return (
      <div className="p-4 text-center text-lg font-semibold">
        Nessuna domanda disponibile
      </div>
    );
  }

  return (
    <div>
      {quizStatus === "active" && (
        <ActiveQuizScreen
          quizName={quizName}
          questions={questions}
          currentQuestionIndex={currentQuestionIndex}
          handleAnswer={handleAnswer}
          showExplanation={showExplanation}
          nextQuestion={nextQuestion}
          timeRemaining={timeRemaining}
          timerActive={timerActive}
          timerEnabled={timerEnabled}
          score={score}
          isQuizCompleted={isQuizCompleted}
          setShowExplanation={setShowExplanation}
        />
      )}

      {quizStatus === "completed" && report && (
        <ReportQuiz report={report} onRestart={restartQuiz} />
      )}
    </div>
  );
};

export default QuizManager;