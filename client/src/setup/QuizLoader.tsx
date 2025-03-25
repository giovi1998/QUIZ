// QuizLoader.tsx
/**
 * QuizLoader Component
 *
 * Questo componente è il punto di ingresso principale per la gestione del quiz.
 * Gestisce lo stato del quiz, il caricamento delle domande, la configurazione del quiz e il passaggio tra le diverse fasi del quiz.
 *
 * @param {function} showTemporaryAlert - Funzione per mostrare un messaggio temporaneo all'utente.
 *
 * Usage:
 * Questo componente è utilizzato come componente principale dell'applicazione, gestendo l'intero flusso del quiz.
 */


import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  ChangeEvent,
} from "react";
import { SetupScreen } from "./SetupScreen.tsx";
import QuizManager from "../quiz/QuizManager.tsx";
import questionsDefaults from "../Data/questionsDefaults.json";
import { EmptyScreen } from "./EmptyScreen.tsx";
import { generatePdf } from "./generatePdf.ts";
import { extractFromPdf } from "./pdfExtractor.tsx";
import { extractQuestionsFromPdfContent } from "./pdfParser.ts"; // Import pdfParser for the fallback
import { QuizStatus, Question } from "../components/type/Types.tsx";

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
  const [uploadedFile, setUploadedFile] = useState<{ name: string; type: "json" | "pdf" } | undefined>(undefined);
  const [uploadError, setUploadError] = useState<string | undefined>(undefined);
  const fileInputRef = React.useRef<HTMLInputElement>(null!);
  const pdfInputRef = React.useRef<HTMLInputElement>(null!);
  const [openQuestionsLimit, setOpenQuestionsLimit] = useState(2);
  const [multipleChoiceQuestionsLimit, setMultipleChoiceQuestionsLimit] =
    useState(24);

  const defaultQuestions = useMemo(() => {
    return shuffleArray(questionsDefaults)
      .slice(0, multipleChoiceQuestionsLimit)
      .map((q, index) => ({
        ...q,
        id: index.toString(),
        type: "multiple-choice",
        userAnswer: "",
        explanation: q.explanation,
      }));
  }, [multipleChoiceQuestionsLimit]);

  // Se non sono state caricate domande esterne, carica le domande di default
  useEffect(() => {
    if (!externalLoaded && questions.length === 0) {
      console.log("No external questions loaded. Loading default questions.");
      setQuestions(defaultQuestions.map((q) => ({
        ...q,
        id: q.id,
        type: "multiple-choice",
        userAnswer: "",
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
      })));
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
      setUploadedFile({ name: file.name, type: "json" }); // Set the uploaded file info

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const content = event.target?.result as string;
          console.log("JSON file content loaded.");
          let parsedData: Omit<Question, "id" | "type" | "userAnswer">[] =
            JSON.parse(content);
          let parsedDataWithId: Question[] = parsedData.map((q, index) => ({
            ...(q as Question),
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

          parsedDataWithId = shuffleArray(parsedDataWithId).slice(
            0,
            multipleChoiceQuestionsLimit
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
    [showTemporaryAlert, multipleChoiceQuestionsLimit]
  );
  const handleFileChangePdfSpecial = useCallback(
    async (file: File) => {
      if (!file) {
        console.log("No PDF file provided.");
        return;
      }
      console.log(`Starting special PDF upload. File: ${file.name}`);
      setPdfLoading(true);
      setUploadedFile({ name: file.name, type: "pdf" }); // Set the uploaded file info
      setQuestions([]);
      // No need to readAsText for special files
      try {
        console.log("Calling extractQuestionsFromPdfContent"); // Added log
        // Pass the limits to the pdfParser
        const extractedQuestions = await extractQuestionsFromPdfContent(
          file,
          openQuestionsLimit,
          multipleChoiceQuestionsLimit
        ); // Pass the file object

        console.log(
          "extractQuestionsFromPdfContent completed:",
          extractedQuestions.validQuestions.length,
          "multiple-choice questions extracted"
        ); // Added log
        console.log(
          "extractQuestionsFromPdfContent completed:",
          extractedQuestions.openQuestions.length,
          "open-ended questions extracted"
        ); // Added log
        if (
          extractedQuestions.validQuestions.length === 0 &&
          extractedQuestions.openQuestions.length === 0
        ) {
          throw new Error("No questions extracted.");
        }

        //merge questions
        const completeQuestions: Question[] = [
          ...extractedQuestions.validQuestions,
          ...extractedQuestions.openQuestions,
        ];
        setQuestions(completeQuestions as Question[]);
        setExternalLoaded(true);
        showTemporaryAlert(
          `Caricate ${extractedQuestions.validQuestions.length} domande multiple e ${extractedQuestions.openQuestions.length} domande aperte.`
        );
      } catch (error) {
        console.error(
          "Error during special PDF processing, falling back to extractFromPdf:",
          error
        );
        // Fallback to extractFromPdf
        try {
          console.log("Falling back to extractFromPdf"); // Added log
          const extractedData = await extractFromPdf(file);
          const pdfQuestions = shuffleArray(extractedData);
          await generatePdf(pdfQuestions, quizName);
          showTemporaryAlert("PDF generato correttamente");
          setQuestions(defaultQuestions as Question[]);
          setExternalLoaded(false);
        } catch (fallbackError) {
          console.error(
            "Error during fallback PDF extraction:",
            fallbackError
          );
          showTemporaryAlert(
            `Errore PDF (fallback): ${
              (fallbackError as Error).message || "Errore sconosciuto"
            }`
          );
          // Ricarica le domande di default con il tipo corretto
          const defaultQuestionsWithType: Question[] = defaultQuestions.map(
            (q) => ({
              ...q,
              type: "multiple-choice",
              userAnswer: "",
            })
          ) as Question[];
          setQuestions(defaultQuestionsWithType);
          setExternalLoaded(false);
        }
      } finally {
        console.log("handleFileChangePdfSpecial finally block executed"); // Added log
        setPdfLoading(false);
      }
    },
    [
      defaultQuestions,
      showTemporaryAlert,
      multipleChoiceQuestionsLimit,
      quizName,
      openQuestionsLimit,
    ]
  );

  // Gestione upload file PDF
  const handleFileChangePdf = useCallback(
    async (file: File) => {
      console.log("handleFileChangePdf called with:", file.name);
      if (file.name.startsWith("domande_")) {
        console.log(
          "Detected special file type: invoking handleFileChangePdfSpecial"
        );
        setUploadedFile({ name: file.name, type: "pdf" }); // Set the uploaded file info
        await handleFileChangePdfSpecial(file);
      } else {
        console.log(
          "Detected standard file type: invoking normal PDF extraction"
        );
        if (!file) {
          console.log("No PDF file provided.");
          return;
        }
        console.log(`Starting PDF upload. File: ${file.name}`);
        setPdfLoading(true);
        setUploadedFile({ name: file.name, type: "pdf" }); // Set the uploaded file info
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
          await generatePdf(pdfQuestions, quizName);
          showTemporaryAlert("PDF generato correttamente");
          console.log(
            "Ricarico le domande di default, poiché le domande PDF non contengono risposta."
          );
          // Ricarica le domande di default con il tipo corretto
          const defaultQuestionsWithType: Question[] = defaultQuestions.map(
            (q) => ({
              ...q,
              type: "multiple-choice",
              userAnswer: "",
            })
          ) as Question[];

          // Aggiorna lo stato con le domande di default
          setQuestions(defaultQuestions as Question[]);
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
      }
    },
    [
      showTemporaryAlert,
      defaultQuestions,
      handleFileChangePdfSpecial,
      quizName,
    ]
  );

  useEffect(() => {
    console.log("QuizLoader rendered. Current quizStatus:", quizStatus);
  }, [quizStatus]);

  function handleSetupComplete(): void {
    console.log("handleSetupComplete called");
    
    if (quizMode === "custom") {
      if (questions.length === 0) {
        console.log("Custom mode selected but no questions loaded.");
        showTemporaryAlert("Carica almeno una domanda!");
        return;
      }
      if (openQuestionsLimit === 0 && multipleChoiceQuestionsLimit === 0) {
        console.log("Custom mode selected but open questions limit and multiple choice question limit are zero");
        showTemporaryAlert("Seleziona almeno una domanda aperta o a scelta multipla");
        return;
      }
    }

    setQuizStatus("active");
    console.log("Quiz status changed to active.");
  }


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
          uploadedFile={uploadedFile}
          uploadError={uploadError}
          openQuestionsLimit={openQuestionsLimit}
          setOpenQuestionsLimit={setOpenQuestionsLimit}
          multipleChoiceQuestionsLimit={multipleChoiceQuestionsLimit}
          setMultipleChoiceQuestionsLimit={setMultipleChoiceQuestionsLimit}
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
          showTemporaryAlert={showTemporaryAlert}
        />
      )}

      {quizStatus === "empty" && (
        <EmptyScreen
          quizName={quizName}
          fileInputRef={fileInputRef}
          handleFileUpload={(e: ChangeEvent<HTMLInputElement>) =>
            handleFileChangeJson(e.target.files![0])
          }
          handlePdfUpload={handleFileChangePdf}
          setQuizStatus={setQuizStatus}
          setShowFormatInfo={setShowFormatInfo}
        />
      )}
    </div>
  );
}

export default QuizLoader;
