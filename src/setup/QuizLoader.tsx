import React, {
  Dispatch,
  SetStateAction,
  useRef,
  useCallback,
  useEffect,
  useState,
} from "react";
import { Question } from "../App.tsx";
import { extractFromPdf } from "../components/pdfExtractor.tsx";
import questionsDefaults from "../Data/questionsDefaults.json";

type QuizLoaderProps = {
  setQuestions: Dispatch<SetStateAction<Question[]>>;
  showTemporaryAlert: (message: string) => void;
  questions: Question[];
  setLoading: Dispatch<SetStateAction<boolean>>;
};

function shuffleArray<T>(array: T[]): T[] {
  console.log(`Shuffling ${array.length} questions`);
  return array.sort(() => Math.random() - 0.5);
}

const QuizLoader: React.FC<QuizLoaderProps> = ({
  setQuestions,
  showTemporaryAlert,
  questions,
  setLoading,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const [jsonLoading, setJsonLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [externalLoaded, setExternalLoaded] = useState(false);

  // Caricamento domande predefinite solo se non sono state caricate domande esterne
  useEffect(() => {
    if (!externalLoaded && questions.length === 0) {
      console.log("No external questions loaded. Loading default questions.");
      const defaultQuestions = shuffleArray(questionsDefaults).slice(0, 24);
      console.log(`Default questions loaded: ${defaultQuestions.length}`);
      setQuestions(defaultQuestions);
    }
  }, [externalLoaded, questions, setQuestions]);

  // Gestione file JSON
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

          // Selezione massimo 24 domande
          const MAX_QUESTIONS = 24;
          parsedData = shuffleArray(parsedData).slice(0, MAX_QUESTIONS);
          console.log(`After shuffling, selected ${parsedData.length} questions.`);

          // Validazione
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
    [setQuestions, showTemporaryAlert]
  );

  // Gestione file PDF
  const handlePdfUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) {
        console.log("No PDF file selected.");
        return;
      }
      console.log(`Starting PDF upload. File: ${file.name}`);
      setPdfLoading(true);
      setQuestions([]);

      try {
        let parsedData = await extractFromPdf(file);
        console.log(`Extracted ${parsedData.length} questions from PDF file.`);

        // Limite dinamico per PDF
        const MAX_QUESTIONS = parsedData.length > 50 ? 24 : parsedData.length;
        parsedData = shuffleArray(parsedData).slice(0, MAX_QUESTIONS);
        console.log(`After shuffling, selected ${parsedData.length} questions from PDF.`);

        setQuestions(parsedData);
        setExternalLoaded(true);
        console.log("PDF upload successful. Questions set.");
        showTemporaryAlert(`Caricate ${parsedData.length} domande dal file PDF.`);
        if (pdfInputRef.current) {
          pdfInputRef.current.value = "";
          console.log("Reset PDF file input.");
        }
      } catch (error) {
        console.error("Errore durante il caricamento del file PDF:", error);
        showTemporaryAlert(`Errore PDF: ${(error as Error).message}`);
      } finally {
        setPdfLoading(false);
        console.log("PDF loading state set to false.");
      }
    },
    [setQuestions, showTemporaryAlert]
  );

  // Gestione stato loading
  useEffect(() => {
    console.log(`Loading state updated - JSON: ${jsonLoading}, PDF: ${pdfLoading}`);
    setLoading(jsonLoading || pdfLoading);
  }, [jsonLoading, pdfLoading, setLoading]);

  return (
    <>
      <input
        id="json-upload"
        type="file"
        accept=".json"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
      />
      <input
        id="pdf-upload"
        type="file"
        accept=".pdf"
        ref={pdfInputRef}
        onChange={handlePdfUpload}
        className="hidden"
      />
    </>
  );
};

export default QuizLoader;
