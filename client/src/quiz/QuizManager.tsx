// QuizManager.tsx
/**
 * QuizManager Component
 *
 * Questo componente gestisce il flusso principale del quiz, dalla visualizzazione delle domande alla gestione del timer,
 * del punteggio e del report finale.
 *
 * @param {string} quizName - Il nome del quiz.
 * @param {Question[]} questions - L'array di domande del quiz.
 * @param {QuizStatus} quizStatus - Lo stato attuale del quiz (setup, active, completed).
 * @param {(status: QuizStatus) => void} setQuizStatus - Funzione per aggiornare lo stato del quiz.
 * @param {boolean} timerEnabled - Indica se il timer è abilitato.
 * @param {number} timerDuration - La durata del timer per ogni domanda.
 * @param {(message: string) => void} showTemporaryAlert - Funzione per mostrare un messaggio temporaneo all'utente.
 *
 * Usage:
 * Questo componente è utilizzato in QuizLoader per gestire l'intero ciclo di vita del quiz,
 * dalla configurazione alla visualizzazione delle domande e alla generazione del report finale.
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import ActiveQuizScreen from "./ActiveQuizScreen.tsx";
import CompletedScreen from "./CompletedScreen.tsx";
import { QuizStatus, Question, Report } from "../components/type/Types.tsx";
import { evaluateAnswer } from "../setup/aiService.ts";

interface MissedQuestion {
  question: string;
  yourAnswer: string;
  correctAnswer: string;
  aiScore: number; //added aiScore
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
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [score, setScore] = useState(0);
  const [report, setReport] = useState<Report | null>(null);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  // Sincronizza le domande quando cambiano le initialQuestions
  useEffect(() => {
    setQuestions(initialQuestions);
  }, [initialQuestions]);

  const handleAnswer = useCallback(async (questionId: string, answer: string | null, explanation: string | null) => {
    // Aggiorna la risposta dell'utente nella domanda, ma non valuta immediatamente
    const updatedQuestions = questions.map(q => 
      q.id === questionId ? { ...q, userAnswer: answer || "" } : q
    );
    setQuestions(updatedQuestions);
  }, [questions]);

  const nextQuestion = useCallback(() => {
    // Reset timer e indice
    setTimeRemaining(timerDuration);
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowExplanation(false);
    } else {
      // Ultima domanda, calcola il report
      calculateReport();
    }
  }, [currentQuestionIndex, questions, timerDuration]);

  useEffect(() => {
    if (timerEnabled && timerActive && timeRemaining > 0) {
      timerRef.current = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (timerEnabled && timerActive && timeRemaining === 0) {
      // Il tempo è scaduto per la domanda corrente.
      const currentQuestion = questions[currentQuestionIndex];
      // Se non è stata fornita una risposta, la registra come vuota
      if (!currentQuestion.userAnswer) {
        handleAnswer(currentQuestion.id, "", "");
      }
      // Ferma il timer e mostra la sezione di spiegazione (che segnala l'errore)
      setTimerActive(false);
      setShowExplanation(true);
    }
  
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [
    timeRemaining,
    timerEnabled,
    timerActive,
    questions,
    currentQuestionIndex,
    handleAnswer
  ]);

  const evaluateAllOpenAnswers = async (questionsToEvaluate: Question[]): Promise<Question[]> => {
    setIsLoadingAi(true);
    const evaluatedQuestions = [...questionsToEvaluate];
    
    try {
      // Collect all open questions that need evaluation
      const openQuestions = evaluatedQuestions.filter(
        q => q.type === "open" && q.userAnswer && !q.aiScore
      );
      
      // Evaluate each open question
      for (const question of openQuestions) {
        try {
          const aiScore = await evaluateAnswer(
            question.question,
            question.userAnswer || "",
            question.correctAnswer || question.explanation || ""
          );
          
          // Update the question with AI score
          const index = evaluatedQuestions.findIndex(q => q.id === question.id);
          if (index !== -1) {
            evaluatedQuestions[index] = { ...evaluatedQuestions[index], aiScore };
          }
        } catch (error) {
          console.error(`Errore durante la valutazione della domanda ${question.id}:`, error);
          // Set a default score of 1 if there's an answer
          const index = evaluatedQuestions.findIndex(q => q.id === question.id);
          if (index !== -1 && evaluatedQuestions[index].userAnswer) {
            evaluatedQuestions[index] = { ...evaluatedQuestions[index], aiScore: 1 };
          }
        }
      }
    } catch (error) {
      console.error("Errore durante la valutazione delle risposte:", error);
      showTemporaryAlert("Errore nella valutazione AI. Verrà utilizzato il punteggio predefinito.");
    } finally {
      setIsLoadingAi(false);
    }
    
    return evaluatedQuestions;
  };

  const checkAnswer = (userAnswer: string, correctAnswer: string) => {
    return userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
  };

  const generateReport = useCallback((evaluatedQuestions: Question[]): Report => {
    const missed: MissedQuestion[] = [];
    let correctAnswers = 0;

    evaluatedQuestions.forEach(q => {
      const userAnswer = q.userAnswer || "";
      const aiScore = q.aiScore !== undefined ? q.aiScore : (userAnswer ? 1 : 0);

      if (q.type === "multiple-choice") {
        if (userAnswer && checkAnswer(userAnswer, q.correctAnswer)) {
          correctAnswers++;
        } else {
          missed.push({
            question: q.question,
            yourAnswer: userAnswer || "Nessuna risposta",
            correctAnswer: q.correctAnswer,
            aiScore:0,
          });
        }
      } else if (q.type === "open") {
        // Per le domande aperte, usa il punteggio AI
        correctAnswers += aiScore;
        
        missed.push({
          question: q.question,
          yourAnswer: userAnswer || "Nessuna risposta",
          correctAnswer: q.correctAnswer || "Nessuna risposta corretta, domanda aperta.", // Use the actual correctAnswer if available
          aiScore:aiScore
        });
      }
    });

    return {
      totalQuestions: evaluatedQuestions.length,
      correctAnswers,
      percentage: Math.round((correctAnswers / evaluatedQuestions.length) * 100),
      missed
    };
  }, []);

  const calculateReport = useCallback(async () => {
    if (report) return;
    
    setIsLoadingAi(true);
    showTemporaryAlert("Valutazione delle risposte in corso...");
    
    try {
      // Evaluate all open answers at once
      const evaluatedQuestions = await evaluateAllOpenAnswers(questions);
      
      // Generate report with evaluated questions
      const generatedReport = generateReport(evaluatedQuestions);
      setReport(generatedReport);
      setQuestions(evaluatedQuestions); // Update questions with AI scores
      
      // Update the total score based on the evaluations
      let totalScore = 0;
      evaluatedQuestions.forEach(q => {
        if (q.type === "multiple-choice") {
          if (q.userAnswer && checkAnswer(q.userAnswer, q.correctAnswer)) {
            totalScore++;
          }
        } else if (q.type === "open") {
          totalScore += q.aiScore !== undefined ? q.aiScore : (q.userAnswer ? 1 : 0);
        }
      });
      setScore(totalScore);
    } catch (error) {
      console.error("Errore durante il calcolo del report:", error);
      showTemporaryAlert("Errore nel calcolo del report. Utilizzando valutazione predefinita.");
      
      // Fallback to basic report if AI evaluation fails
      const generatedReport = generateReport(questions);
      setReport(generatedReport);
    } finally {
      setIsLoadingAi(false);
      setTimerActive(false);
      setIsQuizCompleted(true);
      setQuizStatus("completed");
    }
  }, [generateReport, questions, report, setQuizStatus, showTemporaryAlert]);

  const restartQuiz = useCallback(() => {
    setQuizStatus("setup");
    setReport(null);
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowExplanation(false);
    setTimeRemaining(timerDuration);
    setTimerActive(timerEnabled);
    setIsLoadingAi(false);
    setIsQuizCompleted(false);
    setQuestions(initialQuestions.map(q => ({ ...q, userAnswer: "", aiScore: undefined })));
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
          isLoadingAi={isLoadingAi}
          setScore={setScore}
          onBackToSetup={restartQuiz} 
        />
      )}

      {quizStatus === "completed" && report && (
        <CompletedScreen report={report} backToSetup={restartQuiz} quizName={quizName} questions={questions} />
      )}
    </div>
  );
};

export default QuizManager;
