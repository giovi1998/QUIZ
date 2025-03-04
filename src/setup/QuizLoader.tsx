import React, { useState, useCallback, useEffect, useRef } from "react";
import { SetupScreen } from "./SetupScreen.tsx";
import { FormatInfoModal } from "./FormatInfoModal.tsx";
import QuizManager from "../quiz/QuizManager.tsx";
import questionsDefaults from "../Data/questionsDefaults.json";
import { EmptyScreen } from "./EmptyScreen.tsx";
import {QuizStatus,Question} from "../components/type/types.tsx";

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

function shuffleArray<T>(array: T[]): T[] {
  console.log(`🚀 Mescolamento di ${array.length} domande`);
  return array.sort(() => Math.random() - 0.5);
}

function QuizLoader() {
  const [quizName, setQuizName] = useState("Computer Vision");
  const [quizMode, setQuizMode] = useState<"default" | "custom">("default");
  const [quizStatus, setQuizStatus] = useState<QuizStatus>("setup");
  const [timerEnabled, setTimerEnabled] = useState(true);
  const [timerDuration, setTimerDuration] = useState(30);
  const [showFormatInfo, setShowFormatInfo] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const [externalLoaded, setExternalLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [jsonLoading, setJsonLoading] = useState(false);
  const showTemporaryAlert = useCallback(
    (message: string) => {
      console.log("✅ Nuovo alert mostrato: " + message);
      setAlertMessage(message);
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
        console.log("✅ Alert nascosto");
      }, 3000);
    },
    []
  );

  useEffect(() => {
    if (!externalLoaded && questions.length === 0 && !loading) {
      console.log("🚀 Caricamento domande di default");
      const defaultQuestions = shuffleArray(questionsDefaults).slice(0, 24);
      console.log(`✅ ${defaultQuestions.length} domande di default caricate`);
      setQuestions(defaultQuestions);
    }
  }, [externalLoaded, questions, setQuestions]);

    useEffect(() => {
        console.log(`🚀 Aggiornamento stato caricamento: ${loading}`);
        setLoading(jsonLoading);
    }, [jsonLoading]);



  const handleSetupComplete = useCallback(() => {
    console.log("🚀 Setup completato");
    if (quizMode === "custom" && questions.length === 0) {
      console.log("⚠️ Modalità personalizzata selezionata ma nessuna domanda caricata");
      showTemporaryAlert("Carica almeno una domanda!");
      return;
    }
    setQuizStatus("active");
    console.log("✅ Stato quiz impostato su 'attivo'");
  }, [quizMode, questions, showTemporaryAlert]);

    useEffect(() => {
        console.log("QuizLoader rendered. Current quizStatus:", quizStatus);
    });

    return (
    <div>
      {showAlert && (
        <div className="alert">
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
          onSetupComplete={handleSetupComplete}
          setShowFormatInfo={setShowFormatInfo}
        />
      )}

      {(quizStatus === "active" || quizStatus === "completed") && (
        <QuizManager 
          quizName={quizName}
          questions={questions}
          setQuestions={setQuestions}
          quizStatus={quizStatus}
          setQuizStatus={setQuizStatus}
          timerEnabled={timerEnabled}
          timerDuration={timerDuration}
          showTemporaryAlert={showTemporaryAlert}
        />
      )}

      {quizStatus === "empty" && <EmptyScreen />}

      {showFormatInfo && (
        <FormatInfoModal onClose={() => setShowFormatInfo(false)} />
      )}
    </div>
  );
}

export default QuizLoader;
