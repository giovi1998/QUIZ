import React, { useState, useCallback, useEffect, useRef } from "react";
import { SetupScreen } from "./SetupScreen.tsx";
import { FormatInfoModal } from "./FormatInfoModal.tsx";
import QuizManager from "../quiz/QuizManager.tsx";
import { extractFromPdf } from "./pdfExtractor.tsx";
import { generatePdf } from "./generatePdf.ts";
import questionsDefaults from "../Data/questionsDefaults.json";
import { EmptyScreen } from "./EmptyScreen.tsx";

export type QuizStatus = "setup" | "active" | "completed" | "empty";

export type Question = {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
};

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

function App() {
  const [quizName, setQuizName] = useState("Computer Vision");
  const [quizMode, setQuizMode] = useState<"default" | "custom">("default");
  const [quizStatus, setQuizStatus] = useState<QuizStatus>("setup");
  const [timerEnabled, setTimerEnabled] = useState(true);
  const [timerDuration, setTimerDuration] = useState(30);
  const [showFormatInfo, setShowFormatInfo] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [externalLoaded, setExternalLoaded] = useState(false);
  const [jsonLoading, setJsonLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

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
    if (!externalLoaded && questions.length === 0) {
      console.log("🚀 Caricamento domande di default");
      const defaultQuestions = shuffleArray(questionsDefaults).slice(0, 24);
      console.log(`✅ ${defaultQuestions.length} domande di default caricate`);
      setQuestions(defaultQuestions);
    }
  }, [externalLoaded, questions, setQuestions]);

  useEffect(() => {
    console.log(`🚀 Aggiornamento stato caricamento: ${loading}`);
    setLoading(jsonLoading || pdfLoading);
  }, [jsonLoading, pdfLoading, setLoading]);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) {
        console.log("⚠️ Nessun file JSON selezionato");
        return;
      }
      console.log(`🚀 caricamento JSON iniziato. File: ${file.name}`);
      setJsonLoading(true);
      setQuestions([]);

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const content = event.target?.result as string;
          console.log("✅ File JSON letto correttamente");
          let parsedData: Question[] = JSON.parse(content);
          console.log(`✅ ${parsedData.length} domande rilevate nel file`);

          if (!Array.isArray(parsedData)) {
            throw new Error("Il file JSON non contiene un array");
          }

          const MAX_QUESTIONS = 24;
          parsedData = shuffleArray(parsedData).slice(0, MAX_QUESTIONS);
          console.log(`✅ ${parsedData.length} domande selezionate dopo il mescolamento`);

          parsedData.forEach((q, i) => {
            if (!q.options.includes(q.correctAnswer)) {
              throw new Error(`Domanda ${i + 1}: risposta corretta non trovata`);
            }
          });

          setQuestions(parsedData);
          setExternalLoaded(true);
          console.log("✅ File JSON caricato con successo");
          showTemporaryAlert(`Caricate ${parsedData.length} domande dal file JSON`);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
            console.log("✅ Input file JSON resettato");
          }
        } catch (error) {
          console.error("🚨 Errore durante il caricamento JSON:", error);
          showTemporaryAlert(`Errore JSON: ${(error as Error).message}`);
        } finally {
          setJsonLoading(false);
          console.log("✅ Stato caricamento JSON aggiornato");
        }
      };
      reader.onerror = (error) => {
        console.error("🚨 Errore lettura file JSON:", error);
        showTemporaryAlert("Errore durante la lettura del file JSON");
        setJsonLoading(false);
      };
      reader.readAsText(file);
    },
    [showTemporaryAlert]
  );

  const handlePdfUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) {
        console.log("⚠️ Nessun file PDF selezionato");
        return;
      }
      console.log(`🚀 caricamento PDF iniziato. File: ${file.name}`);
      setPdfLoading(true);
      setQuestions([]);

      try {
        const extractedData = await extractFromPdf(file);
        console.log(`✅ ${extractedData.length} domande estratte dal PDF`);
        const pdfQuestions = shuffleArray(extractedData);
        console.log("🚀 Generazione PDF in corso");
        await generatePdf(pdfQuestions);
        console.log("✅ PDF generato con successo");
        showTemporaryAlert(`PDF generato con ${pdfQuestions.length} domande`);

        console.log("⚠️ Ricarica domande di default (domande PDF non valide per il quiz)");
        const defaultQuestions = shuffleArray(questionsDefaults).slice(0, 24);
        setQuestions(defaultQuestions);
        setExternalLoaded(false);
      } catch (error) {
        console.error("🚨 Errore durante il caricamento PDF:", error);
        showTemporaryAlert(`Errore PDF: ${(error as Error).message}`);
      } finally {
        setPdfLoading(false);
        if (pdfInputRef.current) {
          pdfInputRef.current.value = "";
          console.log("✅ Input file PDF resettato");
        }
      }
    },
    [showTemporaryAlert]
  );

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
          handleSetupComplete={handleSetupComplete}
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

export default App;