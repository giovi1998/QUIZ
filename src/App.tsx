// App.tsx
import React, { useState, useEffect, useRef } from "react";
import { SetupScreen } from "./components/SetupScreen.tsx";
import { ActiveQuizScreen } from "./components/ActiveQuizScreen.tsx";
import { CompletedScreen, Report } from "./components/CompletedScreen.tsx";
import { EmptyScreen } from "./components/EmptyScreen.tsx";
import { FormatInfoModal } from "./components/FormatInfoModal.tsx";

export type Question = {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
};

type QuizStatus = "setup" | "active" | "completed" | "empty";

// Helper function: Shuffle un array usando l'algoritmo Fisher–Yates
function shuffleArray<T>(array: T[]): T[] {
  const newArr = array.slice();
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

function App() {
  // Setup state
  const [quizName, setQuizName] = useState("Visione Artificiale");
  const [quizMode, setQuizMode] = useState<"default" | "custom">("default");
  const [quizStatus, setQuizStatus] = useState<QuizStatus>("setup");
  const [timerEnabled, setTimerEnabled] = useState(true);
  const [timerDuration, setTimerDuration] = useState(30);
  const [showFormatInfo, setShowFormatInfo] = useState(false);

  // Quiz state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(timerDuration);
  const [timerActive, setTimerActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  // Default questions (modalità default)
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
    {
      question: "Quale delle seguenti non è un'applicazione comune della visione artificiale?",
      options: [
        "Riconoscimento facciale",
        "Riconoscimento vocale",
        "Rilevamento oggetti",
        "Segmentazione immagini",
      ],
      correctAnswer: "Riconoscimento vocale",
      explanation:
        "Il riconoscimento vocale non fa parte della visione artificiale; rientra nel campo del riconoscimento vocale.",
    },
    {
      question: "Quale tecnica è fondamentale per il riconoscimento di oggetti nella visione artificiale?",
      options: ["Data Warehousing", "Deep Learning", "Query Processing", "Network Routing"],
      correctAnswer: "Deep Learning",
      explanation:
        "Il Deep Learning, in particolare le reti neurali convoluzionali (CNN), è diventato fondamentale per il riconoscimento di oggetti nella visione artificiale.",
    },
  ];

  // Timer logic
  useEffect(() => {
    if (timerActive && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining((prevTime) => prevTime - 1);
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

  const handleAnswer = (selectedOption: string | null) => {
    setSelectedAnswer(selectedOption);
    setShowExplanation(true);
    setTimerActive(false);
    const currentQuestion = questions[currentQuestionIndex];
    if (selectedOption === currentQuestion?.correctAnswer) {
      setScore((prevScore) => prevScore + 1);
    }
    setAnswers((prevAnswers) => [...prevAnswers, selectedOption || ""]);
  };

  // Aggiornamento della funzione nextQuestion per resettare il timer
  const nextQuestion = () => {
    // Ripristina il timer per la nuova domanda
    setTimeRemaining(timerDuration);
    setTimerActive(timerEnabled);

    setSelectedAnswer(null);
    setShowExplanation(false);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setQuizStatus("completed");
    }
  };

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

  const showTemporaryAlert = (message: string) => {
    setAlertMessage(message);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  // Gestione del caricamento del file JSON, con selezione casuale di 24 domande e mescolamento delle opzioni
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
        // Verifica e trasforma ogni domanda
        parsedData.forEach((q, i) => {
          if (!q.question || !Array.isArray(q.options) || !q.correctAnswer || !q.explanation) {
            throw new Error(`Domanda ${i + 1} manca dei campi obbligatori`);
          }
          if (q.correctAnswer.endsWith(" correct")) {
            q.correctAnswer = q.correctAnswer.replace(" correct", "").trim();
          }
          // Mescola le opzioni per aumentare la difficoltà
          q.options = shuffleArray(q.options);
          if (!q.options.includes(q.correctAnswer)) {
            throw new Error(`Domanda ${i + 1}: la risposta corretta non è presente tra le opzioni`);
          }
        });
        // Mescola l'array completo di domande in modo casuale
        parsedData = shuffleArray(parsedData);
        // Se ci sono più di 24 domande, seleziona solo 24
        if (parsedData.length > 24) {
          parsedData = parsedData.slice(0, 24);
        }
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

  const generateReport = (): Report => {
    const totalQuestions = questions.length;
    const correctAnswers = score;
    const percentage =
      totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    const missed = questions
      .map((q, idx) => ({
        question: q.question,
        yourAnswer: answers[idx] || "Nessuna risposta",
        correctAnswer: q.correctAnswer,
      }))
      .filter((item, idx) => answers[idx] !== questions[idx].correctAnswer);
    return { totalQuestions, correctAnswers, percentage, missed };
  };

  const backToSetup = () => {
    clearQuestions();
    setQuizStatus("setup");
  };

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white rounded-lg shadow-lg min-h-screen">
      {showAlert && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white px-4 py-2 rounded transition-opacity duration-300">
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
