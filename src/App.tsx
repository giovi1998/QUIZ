// App.tsx
import React, { useState, useCallback, useEffect } from "react";
import { SetupScreen } from "./components/SetupScreen.tsx";
import { EmptyScreen } from "./components/EmptyScreen.tsx";
import { FormatInfoModal } from "./components/FormatInfoModal.tsx";
import QuizManager, {QuizManagerType} from "./components/QuizManager.tsx";
import QuizLoader from "./components/QuizLoader.tsx";

// Stato per gestire la vista da visualizzare
export type QuizStatus = "setup" | "active" | "completed" | "empty";

// Tipo per rappresentare una domanda del quiz
export type Question = {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
};

// Tipo per il report finale
export type Report = {
  totalQuestions: number;
  correctAnswers: number;
  percentage: number;
  missed: {
    question: string;
    yourAnswer: string;
    correctAnswer: string;
  }[];
};

function App() {
  console.log("App rendered"); // Added log
  // Stato configurazione quiz
  const [quizName, setQuizName] = useState("Computer Vision");
  const [quizMode, setQuizMode] = useState<"default" | "custom">("default");
  const [quizStatus, setQuizStatus] = useState<QuizStatus>("setup");
  const [timerEnabled, setTimerEnabled] = useState(true);
  const [timerDuration, setTimerDuration] = useState(30);
  const [showFormatInfo, setShowFormatInfo] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  // Stato gestione quiz
  const [questions, setQuestions] = useState<Question[]>([]);

  // Helper per mostrare un alert temporaneo
  const showTemporaryAlert = useCallback((message: string) => {
    console.log("App - showTemporaryAlert called with:", message); // Added log
    setAlertMessage(message);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  }, []);

  // QuizLoader Hook
  const {
    handleFileUpload,
    handlePdfUpload,
    fileInputRef,
    pdfInputRef,
  } = QuizLoader({
    setQuestions,
    showTemporaryAlert,
  });

  // Handler per il completamento della configurazione
  const handleSetupComplete = useCallback(() => {
    console.log("App - handleSetupComplete called"); // Added log
    if (quizMode === "default") {
      console.log("App - Using default questions"); // Added log
    } else if (questions.length === 0) {
      showTemporaryAlert(
        "Nessuna domanda caricata per la modalità personalizzata"
      );
      console.log("App - handleSetupComplete: No custom questions loaded");
      return;
    }
    setQuizStatus("active");
    console.log("App - Setup complete, quiz status set to active"); // Added log
  }, [quizMode, questions, setQuizStatus, showTemporaryAlert]);

  useEffect(() => {
    console.log("App - quizStatus Changed:", quizStatus);
  }, [quizStatus]);

  //use QuizManager
  const quizManagerProps: Omit<QuizManagerType & {showTemporaryAlert:(message:string)=>void}, never> = {
    quizName,
    questions,
    setQuestions,
    quizStatus,
    setQuizStatus,
    timerEnabled,
    timerDuration,
    showTemporaryAlert,
  };

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white rounded-lg shadow-lg min-h-screen">
      {/* Alert temporaneo */}
      {showAlert && (
        <div
          role="alert"
          aria-live="assertive"
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white px-4 py-2 rounded transition-opacity duration-300"
        >
          {alertMessage}
        </div>
      )}

      {/* Schermata di configurazione */}
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
          fileInputRef={fileInputRef}
          handleFileUpload={handleFileUpload}
          onSetupComplete={handleSetupComplete}
          showFormatInfo={showFormatInfo}
          setShowFormatInfo={setShowFormatInfo}
          pdfInputRef={pdfInputRef}
          handlePdfUpload={handlePdfUpload}
        />
      )}

      {/* Schermata vuota */}
      {quizStatus === "empty" && (
        <EmptyScreen
          quizName={quizName}
          fileInputRef={fileInputRef}
          handleFileUpload={handleFileUpload}
          setQuizStatus={setQuizStatus}
          setShowFormatInfo={setShowFormatInfo}
        />
      )}

      {/* Gestione del quiz */}
      {quizStatus !== "setup" && quizStatus !== "empty" && (
        <QuizManager {...quizManagerProps}/>
      )}

      {/* Modal per informazioni sul formato del file */}
      {showFormatInfo && (
        <FormatInfoModal onClose={() => setShowFormatInfo(false)} />
      )}
    </div>
  );
}

export default App;
