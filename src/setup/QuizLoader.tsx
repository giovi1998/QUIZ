// setup/QuizLoader.tsx
import React, { useState, useCallback, useEffect, useMemo, ChangeEvent } from "react";
import { SetupScreen } from "./SetupScreen.tsx";
import QuizManager from "../quiz/QuizManager.tsx";
import questionsDefaults from "../Data/questionsDefaults.json";
import { EmptyScreen } from "./EmptyScreen.tsx";
import { generatePdf } from "./generatePdf.ts";
import { extractFromPdf } from "./pdfExtractor.tsx";
import { QuizStatus, Question } from "../components/type/Types.ts";

function shuffleArray<T>(array: T[]): T[] {
  console.log(`Shuffling ${array.length} questions`);
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

interface QuizLoaderProps {
  showTemporaryAlert: (message: string) => void;
}

function QuizLoader({ showTemporaryAlert }: QuizLoaderProps) {
  const [quizName, setQuizName] = useState("Computer Vision");
  const [quizMode, setQuizMode] = useState<"default" | "custom">("default");
  const [quizStatus, setQuizStatus] = useState<QuizStatus>("setup");
  const [timerEnabled, setTimerEnabled] = useState(true);
  const [timerDuration, setTimerDuration] = useState(30);
  const [showFormatInfo, setShowFormatInfo] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [externalLoaded, setExternalLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [jsonLoading, setJsonLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null!);
  const pdfInputRef = React.useRef<HTMLInputElement>(null!);

  const defaultQuestions = useMemo(() => {
    return shuffleArray(questionsDefaults).slice(0, 24).map((q, index) => ({
      ...q,
      id: index.toString(),
      type: "multiple-choice",
      userAnswer: "",
    }));
  }, []);

  // Se non sono state caricate domande esterne, carica le domande di default
  useEffect(() => {
    if (!externalLoaded && questions.length === 0) {
      console.log("No external questions loaded. Loading default questions.");
      setQuestions(defaultQuestions);
      console.log(`Default questions loaded: ${defaultQuestions.length}`);
    }
  }, [externalLoaded, questions, setQuestions, defaultQuestions]);

  // Aggiorna lo stato di loading
  useEffect(() => {
    console.log(
      `Loading state updated - JSON: ${jsonLoading}, PDF: ${pdfLoading}`
    );
    setLoading(jsonLoading || pdfLoading);
  }, [jsonLoading, pdfLoading, setLoading]);

  // Gestione upload file JSON
  const handleFileChangeJson = useCallback(
    async (file: File) => {
      if (!file) {
        console.log("No JSON file provided.");
        return;
      }

      console.log(`Starting JSON upload. File: ${file.name}`);

      setJsonLoading(true);
      setQuestions([]); // Puliamo le domande correnti

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const content = event.target?.result as string;
          console.log("JSON file content loaded.");
          let parsedData: Omit<Question, "id" | "type" | "userAnswer">[] =
            JSON.parse(content);
          let parsedDataWithId: Question[] = parsedData.map((q, index) => ({
            ...q,
            id: index.toString(),
            type: "multiple-choice",
            userAnswer: "",
          }));

          // let parsedData: Question[] = JSON.parse(content);
          console.log(`Found ${parsedData.length} questions in JSON file.`);

          if (!Array.isArray(parsedData)) {
            throw new Error(
              "Formato file non valido: il file JSON non contiene un array."
            );
          }

          const MAX_QUESTIONS = 24;
          parsedDataWithId = shuffleArray(parsedDataWithId).slice(
            0,
            MAX_QUESTIONS
          );
          console.log(
            `After shuffling, selected ${parsedDataWithId.length} questions.`
          );
          // Validazione: la risposta corretta deve essere presente tra le opzioni
          parsedDataWithId.forEach((q, i) => {
            if (!q.options.includes(q.correctAnswer)) {
              throw new Error(
                `Domanda ${i + 1}: Risposta corretta mancante nei dati.`
              );
            }
          });

          setQuestions(parsedDataWithId);
          setExternalLoaded(true);
          console.log("JSON upload successful. Questions set.");
          showTemporaryAlert(
            `Caricate ${parsedDataWithId.length} domande dal file JSON.`
          );
        } catch (error) {
          console.error("Errore durante il caricamento del file JSON:", error);
          showTemporaryAlert(
            `Errore JSON: ${(error as Error).message || "Errore sconosciuto"}`
          );
        } finally {
          setJsonLoading(false);
          console.log("JSON loading state set to false.");
        }
      };
      reader.onerror = (error) => {
        console.error("FileReader encountered an error:", error);
        showTemporaryAlert("Errore durante la lettura del file JSON.");
        setJsonLoading(false);
      };
      reader.readAsText(file);
    },
    [showTemporaryAlert]
  );

  // Gestione upload file PDF
  const handleFileChangePdf = useCallback(
    async (file: File) => {
      if (!file) {
        console.log("No PDF file provided.");
        return;
      }
      console.log(`Starting PDF upload. File: ${file.name}`);
      setPdfLoading(true);
      // Puliamo le domande correnti (non vogliamo mostrare quelle estratte)
      setQuestions([]);

      try {
        const extractedData = await extractFromPdf(file);
        console.log(
          `Extracted ${extractedData.length} questions from PDF file.`
        );
        // Non limitiamo il numero: usiamo tutte le domande estratte per generare il file PDF.
        const pdfQuestions = shuffleArray(extractedData);
        console.log(
          `After shuffling, using ${pdfQuestions.length} questions for PDF generation.`
        );
        // Genera il PDF con le domande estratte, passando anche la funzione showTemporaryAlert
        await generatePdf(pdfQuestions, showTemporaryAlert);
        showTemporaryAlert("PDF generato correttamente");
        console.log(
          "Ricarico le domande di default, poiché le domande PDF non contengono risposta."
        );
        // Ricarica le domande di default
        setQuestions(defaultQuestions);
        // Non impostiamo externalLoaded a true, così la logica delle default rimane attiva
        setExternalLoaded(false);
      } catch (error) {
        console.error("Errore durante il caricamento del file PDF:", error);
        showTemporaryAlert(
          `Errore PDF: ${(error as Error).message || "Errore sconosciuto"}`
        );
      } finally {
        setPdfLoading(false);
        console.log("PDF loading state set to false.");
      }
    },
    [showTemporaryAlert, defaultQuestions]
  );

  const handleSetupComplete = useCallback(() => {
    console.log("Setup complete. Quiz mode:", quizMode);
    if (quizMode === "custom" && questions.length === 0) {
      console.log("Custom mode selected but no questions loaded.");
      showTemporaryAlert("Carica almeno una domanda!");
      return;
    }
    setQuizStatus("active");
    console.log("Quiz status changed to active.");
  }, [quizMode, questions, showTemporaryAlert, setQuizStatus]);

  useEffect(() => {
    console.log("QuizLoader rendered. Current quizStatus:", quizStatus);
  }, [quizStatus]);

  return (
    <div>
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
          onFileChangeJson={handleFileChangeJson}
          onFileChangePdf={handleFileChangePdf}
          loading={loading}
          fileInputRef={fileInputRef}
          pdfInputRef={pdfInputRef}
          setShowFormatInfo={setShowFormatInfo}
          showFormatInfo={showFormatInfo}
        />
      )}

      {(quizStatus === "active" || quizStatus === "completed") && (
        <QuizManager
          quizName={quizName}
          questions={questions}
          quizStatus={quizStatus}
          setQuizStatus={setQuizStatus}
          timerEnabled={timerEnabled}
          timerDuration={timerDuration}
          showTemporaryAlert={showTemporaryAlert} setQuestions={function (value: React.SetStateAction<Question[]>): void {
            throw new Error("Function not implemented.");
          } }        />
      )}

      {quizStatus === "empty" && (
        <EmptyScreen
          quizName={quizName}
          fileInputRef={fileInputRef}
          handleFileUpload={(e: ChangeEvent<HTMLInputElement>) =>
            handleFileChangeJson(e.target.files![0])
          }
          setQuizStatus={setQuizStatus}
          setShowFormatInfo={setShowFormatInfo}
        />
      )}
    </div>
  );
}

export default QuizLoader;
