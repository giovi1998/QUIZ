import React, { useState, useEffect, useRef } from "react";
import { SetupScreen } from "./components/SetupScreen.tsx";
import { ActiveQuizScreen } from "./components/ActiveQuizScreen.tsx";
import { CompletedScreen, Report } from "./components/CompletedScreen.tsx";
import { EmptyScreen } from "./components/EmptyScreen.tsx";
import { FormatInfoModal } from "./components/FormatInfoModal.tsx";
import { extractFromPdf } from "./components/pdfExtractor.ts";

// Tipo per rappresentare una domanda del quiz
export type Question = {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
};

// Stati possibili del quiz
type QuizStatus = "setup" | "active" | "completed" | "empty";

// Funzione helper: mescola un array (algoritmo Fisher-Yates)
function shuffleArray<T>(array: T[]): T[] {
  const newArr = array.slice();
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

function App() {
  // Stato configurazione quiz
  const [quizName, setQuizName] = useState("Computer Vision");
  const [quizMode, setQuizMode] = useState<"default" | "custom">("default");
  const [quizStatus, setQuizStatus] = useState<QuizStatus>("setup");
  const [timerEnabled, setTimerEnabled] = useState(true);
  const [timerDuration, setTimerDuration] = useState(30);
  const [showFormatInfo, setShowFormatInfo] = useState(false);

  // Stato gestione quiz
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(timerDuration);
  const [timerActive, setTimerActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  // Domande predefinite (modalità default)
  const defaultQuestions: Question[] = [
    {
      question: "Qual è l'obiettivo principale della visione artificiale?",
      options: [
        "Creare programmi computer",
        "Abilitare i computer ad interpretare e comprendere informazioni visive",
        "Progettare hardware computer",
        "Sviluppare algoritmi software",
      ],
      correctAnswer: "Abilitare i computer ad interpretare e comprendere informazioni visive",
      explanation:
        "La visione artificiale ha lo scopo di abilitare i computer ad interpretare e comprendere informazioni visive dal mondo.",
    },
    // ...altri esempi se necessario
  ];

  // Gestione del timer
  useEffect(() => {
    if (timerActive && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timerActive && timeRemaining === 0) {
      handleAnswer(null);
    }
  }, [timerActive, timeRemaining]);

  useEffect(() => {
    if (quizStatus === "active") {
      setTimeRemaining(timerDuration);
      setTimerActive(timerEnabled);
    }
  }, [currentQuestionIndex, timerEnabled, timerDuration, quizStatus]);

  // Gestione della risposta
  const handleAnswer = (selectedOption: string | null) => {
    setSelectedAnswer(selectedOption);
    setShowExplanation(true);
    setTimerActive(false);
    const current = questions[currentQuestionIndex];
    if (selectedOption === current?.correctAnswer) {
      setScore(prev => prev + 1);
    }
    setAnswers(prev => [...prev, selectedOption || ""]);
  };

  // Passa alla prossima domanda o completa il quiz
  const nextQuestion = () => {
    setTimeRemaining(timerDuration);
    setTimerActive(timerEnabled);
    setSelectedAnswer(null);
    setShowExplanation(false);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setQuizStatus("completed");
    }
  };

  // Reset del quiz
  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setAnswers([]);
    setShowExplanation(false);
    setSelectedAnswer(null);
    setTimeRemaining(timerDuration);
    setTimerActive(timerEnabled);
    setQuizStatus("active");
  };

  // Svuota le domande e resetta lo stato
  const clearQuestions = () => {
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setScore(0);
    setAnswers([]);
    setShowExplanation(false);
    setSelectedAnswer(null);
    setTimeRemaining(timerDuration);
    setTimerActive(false);
    setQuizStatus("empty");
  };

  // Mostra un alert temporaneo (accessibilità: role e aria-live)
  const showTemporaryAlert = (message: string) => {
    setAlertMessage(message);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  // Gestione del caricamento del file JSON (domande personalizzate)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        let parsedData: Question[] = JSON.parse(content);
        if (!Array.isArray(parsedData)) {
          throw new Error("Formato JSON non valido: deve essere un array");
        }
        parsedData.forEach((q, i) => {
          if (!q.question || !Array.isArray(q.options) || !q.correctAnswer || !q.explanation) {
            throw new Error(`Domanda ${i + 1} manca dei campi obbligatori`);
          }
          q.options = shuffleArray(q.options);
          if (!q.options.includes(q.correctAnswer)) {
            throw new Error(`Domanda ${i + 1}: la risposta corretta non è presente tra le opzioni`);
          }
        });
        parsedData = shuffleArray(parsedData);
        if (parsedData.length > 24) parsedData = parsedData.slice(0, 24);
        setQuestions(parsedData);
        resetQuiz();
        showTemporaryAlert(`Caricate ${parsedData.length} domande con successo!`);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } catch (error) {
        console.error("Errore di caricamento:", error);
        showTemporaryAlert(`Errore: ${(error as Error).message}`);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };

  // Gestione del caricamento del file PDF usando extractFromPdf
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const extractedQuestions = await extractFromPdf(file);
      extractedQuestions.forEach((q: Question, i: number) => {
        if (q.options.length === 0 && q.question.toLowerCase().includes("scelta multipla")) {
          throw new Error(`Domanda ${i + 1} manca delle opzioni attese per una domanda a scelta multipla`);
        }
        q.options = shuffleArray(q.options);
      });
      let parsedData = shuffleArray(extractedQuestions);
      if (parsedData.length > 24) parsedData = parsedData.slice(0, 24);
      setQuestions(parsedData);
      resetQuiz();
      showTemporaryAlert(`Caricate ${parsedData.length} domande da PDF con successo!`);
      if (pdfInputRef.current) pdfInputRef.current.value = "";
    } catch (error) {
      console.error("Errore di caricamento PDF:", error);
      showTemporaryAlert(`Errore: ${(error as Error).message}`);
      if (pdfInputRef.current) pdfInputRef.current.value = "";
    }
  };

  // Completamento della configurazione
  const handleSetupComplete = () => {
    if (quizMode === "default") {
      setQuestions(defaultQuestions);
    } else if (questions.length === 0) {
      showTemporaryAlert("Nessuna domanda caricata per la modalità personalizzata");
      return;
    }
    setQuizStatus("active");
    setTimerActive(timerEnabled);
  };

  // Genera il report finale del quiz
  const generateReport = (): Report => {
    const totalQuestions = questions.length;
    const correctAnswers = score;
    const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    const missed = questions
      .map((q, idx) => ({
        question: q.question,
        yourAnswer: answers[idx] || "Nessuna risposta",
        correctAnswer: q.correctAnswer,
      }))
      .filter((item, idx) => answers[idx] !== questions[idx].correctAnswer);
    return { totalQuestions, correctAnswers, percentage, missed };
  };

  // Torna alla schermata di configurazione
  const backToSetup = () => {
    clearQuestions();
    setQuizStatus("setup");
  };

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white rounded-lg shadow-lg min-h-screen">
      {showAlert && (
        <div
          role="alert"
          aria-live="assertive"
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white px-4 py-2 rounded transition-opacity duration-300"
        >
          {alertMessage}
        </div>
      )}

      {quizStatus === "setup" && (
        <SetupScreen
          quizName={quizName}
          setQuizName={setQuizName}
          quizMode={quizMode}
          setQuizMode={setQuizMode}
          timerEnabled={timerEnabled}
          setTimerEnabled={setTimerEnabled}
          timerDuration={timerDuration}
          setTimerDuration={setTimerDuration}
          questions={questions}
          fileInputRef={fileInputRef}
          handleFileUpload={handleFileUpload}
          onSetupComplete={handleSetupComplete}
          showFormatInfo={showFormatInfo}
          setShowFormatInfo={setShowFormatInfo}
          pdfInputRef={pdfInputRef}
          handlePdfUpload={handlePdfUpload}
        />
      )}

      {quizStatus === "empty" && (
        <EmptyScreen
          quizName={quizName}
          fileInputRef={fileInputRef}
          handleFileUpload={handleFileUpload}
          setQuizStatus={setQuizStatus}
          setShowFormatInfo={setShowFormatInfo}
        />
      )}

      {quizStatus === "active" && questions.length > 0 && (
        <ActiveQuizScreen
          quizName={quizName}
          currentQuestionIndex={currentQuestionIndex}
          totalQuestions={questions.length}
          score={score}
          question={questions[currentQuestionIndex]}
          selectedAnswer={selectedAnswer}
          setSelectedAnswer={setSelectedAnswer}
          showExplanation={showExplanation}
          handleAnswer={handleAnswer}
          nextQuestion={nextQuestion}
          timeRemaining={timeRemaining}
          timerActive={timerActive}
          timerEnabled={timerEnabled}
        />
      )}

      {quizStatus === "completed" && (
        <CompletedScreen
          quizName={quizName}
          report={generateReport()}
          resetQuiz={resetQuiz}
          backToSetup={backToSetup}
        />
      )}

      {showFormatInfo && (
        <FormatInfoModal onClose={() => setShowFormatInfo(false)} />
      )}
    </div>
  );
}

export default App;
