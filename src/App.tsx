import React, { useState, useCallback, useEffect, useRef } from "react";
import { SetupScreen } from "./setup/SetupScreen.tsx";
import { FormatInfoModal } from "./setup/FormatInfoModal.tsx";
import QuizManager from "./quiz/QuizManager.tsx";
import { extractFromPdf } from "./setup/pdfExtractor.tsx";
import { generatePdf } from "./setup/generatePdf.ts";
import questionsDefaults from "./Data/questionsDefaults.json";
import { EmptyScreen } from "./setup/EmptyScreen.tsx";
import { Question, QuizStatus } from "./components/type/types.tsx"
function shuffleArray<T>(array: T[]): T[] {
  console.log(`Shuffling ${array.length} questions`);
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
  // externalLoaded indica se un file esterno (JSON) è stato caricato;
  // per PDF, dopo la generazione del file PDF, carichiamo le domande di default.
  const [externalLoaded, setExternalLoaded] = useState(false);
  const [jsonLoading, setJsonLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const showTemporaryAlert = useCallback((message: string) => {
    console.log("Showing alert:", message);
    setAlertMessage(message);
    setShowAlert(true);
    setTimeout(() => {
      setShowAlert(false);
      console.log("Alert hidden.");
    }, 3000);
  }, []);

  // Se non sono state caricate domande esterne, carica le domande di default
  useEffect(() => {
    if (!externalLoaded && questions.length === 0) {
      console.log("No external questions loaded. Loading default questions.");
      const defaultQuestions = shuffleArray(questionsDefaults).slice(0, 24);
      console.log(`Default questions loaded: ${defaultQuestions.length}`);
      setQuestions(defaultQuestions);
    }
  }, [externalLoaded, questions, setQuestions]);

  // Aggiorna lo stato di loading
  useEffect(() => {
    console.log(`Loading state updated - JSON: ${jsonLoading}, PDF: ${pdfLoading}`);
    setLoading(jsonLoading || pdfLoading);
  }, [jsonLoading, pdfLoading, setLoading]);

  // Gestione upload file JSON (rimane invariata)
  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) {
        console.log("No JSON file selected.");
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
          let parsedData: Question[] = JSON.parse(content);
          console.log(`Found ${parsedData.length} questions in JSON file.`);

          if (!Array.isArray(parsedData)) {
            throw new Error("Formato file non valido: il file JSON non contiene un array.");
          }

          const MAX_QUESTIONS = 24;
          parsedData = shuffleArray(parsedData).slice(0, MAX_QUESTIONS);
          console.log(`After shuffling, selected ${parsedData.length} questions.`);
          // Validazione: la risposta corretta deve essere presente tra le opzioni
          parsedData.forEach((q, i) => {
            if (!q.options.includes(q.correctAnswer)) {
              throw new Error(`Domanda ${i + 1}: Risposta corretta mancante nei dati.`);
            }
          });

          setQuestions(parsedData);
          setExternalLoaded(true);
          console.log("JSON upload successful. Questions set.");
          showTemporaryAlert(`Caricate ${parsedData.length} domande dal file JSON.`);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
            console.log("Reset JSON file input.");
          }
        } catch (error) {
          console.error("Errore durante il caricamento del file JSON:", error);
          showTemporaryAlert(`Errore JSON: ${(error as Error).message}`);
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
  // Logica:
  // 1) Estrae TUTTE le domande dal PDF e genera un file PDF formattato come richiesto:
  //    - Per domande chiuse: mostra il testo della domanda con opzioni formattate (A), B), ecc.)
  //    - Per domande aperte: mostra il testo e una dicitura "[Spazio per risposta aperta]"
  // 2) Dopo aver generato il PDF, ricarica le domande di default (poiché le domande estratte dal PDF non contengono risposta)
  const handlePdfUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) {
        console.log("No PDF file selected.");
        return;
      }
      console.log(`Starting PDF upload. File: ${file.name}`);
      setPdfLoading(true);
      // Puliamo le domande correnti (non vogliamo mostrare quelle estratte)
      setQuestions([]);

      try {
        const extractedData = await extractFromPdf(file);
        console.log(`Extracted ${extractedData.length} questions from PDF file.`);
        // Non limitiamo il numero: usiamo tutte le domande estratte per generare il file PDF.
        const pdfQuestions = shuffleArray(extractedData);
        console.log(`After shuffling, using ${pdfQuestions.length} questions for PDF generation.`);
        // Genera il PDF con le domande estratte
        await generatePdf(pdfQuestions);
        showTemporaryAlert(`PDF generato con ${pdfQuestions.length} domande`);
        console.log("Ricarico le domande di default, poiché le domande PDF non contengono risposta.");
        // Ricarica le domande di default
        const defaultQuestions = shuffleArray(questionsDefaults).slice(0, 24);
        setQuestions(defaultQuestions);
        // Non impostiamo externalLoaded a true, così la logica delle default rimane attiva
        setExternalLoaded(false);
      } catch (error) {
        console.error("Errore durante il caricamento del file PDF:", error);
        showTemporaryAlert(`Errore PDF: ${(error as Error).message}`);
      } finally {
        setPdfLoading(false);
        console.log("PDF loading state set to false.");
        if (pdfInputRef.current) {
          pdfInputRef.current.value = "";
          console.log("Reset PDF file input.");
        }
      }
    },
    [setQuestions, showTemporaryAlert]
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
  }, [quizMode, questions, showTemporaryAlert]);

  useEffect(() => {
    console.log("App rendered. Current quizStatus:", quizStatus);
  });

  useEffect(() => {
    console.log("App - quizStatus changed:", quizStatus);
  }, [quizStatus]);

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white rounded-lg shadow-lg min-h-screen">
      {showAlert && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white p-3 rounded">
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
          pdfInputRef={pdfInputRef}
          handleFileUpload={handleFileUpload}
          handlePdfUpload={handlePdfUpload}
          onSetupComplete={handleSetupComplete}
          showFormatInfo={showFormatInfo}
          setShowFormatInfo={setShowFormatInfo}
          loading={loading}
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

      {quizStatus === "empty" && (
        <EmptyScreen
          quizName={quizName}
          setQuizStatus={setQuizStatus}
          setShowFormatInfo={setShowFormatInfo}
          fileInputRef={fileInputRef}
          handleFileUpload={handleFileUpload}
        />
      )}

      {showFormatInfo && (
        <FormatInfoModal onClose={() => setShowFormatInfo(false)} />
      )}
    </div>
  );
}

export default App;
