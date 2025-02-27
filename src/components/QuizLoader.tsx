// components/QuizLoader.tsx
import React, { Dispatch, SetStateAction, useRef, useCallback, useEffect } from "react";
import { Question } from "../App.tsx";
import { extractFromPdf } from "./pdfExtractor.tsx";
import questionsDefaults from "../Data/questionsDefaults.json";

type QuizLoaderProps = {
  setQuestions: Dispatch<SetStateAction<Question[]>>;
  showTemporaryAlert: (message: string) => void;
};

function shuffleArray<T>(array: T[]): T[] {
  const newArr = array.slice();
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

const QuizLoader: React.FC<QuizLoaderProps> = ({
  setQuestions,
  showTemporaryAlert,
}) => {
  console.log("QuizLoader rendered"); // Added log
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load default questions on initial render
    setQuestions(shuffleArray(questionsDefaults));
    console.log("QuizLoader - Default questions loaded");
  }, [setQuestions]);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      console.log("QuizLoader - handleFileUpload called"); // Added log
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          console.log(
            "QuizLoader - File content loaded:",
            content.substring(0, 100) + "..."
          );
          let parsedData: Question[] = JSON.parse(content);
          if (!Array.isArray(parsedData)) {
            throw new Error("Formato JSON non valido: deve essere un array");
          }
          parsedData.forEach((q, i) => {
            if (
              !q.question ||
              !Array.isArray(q.options) ||
              !q.correctAnswer ||
              !q.explanation
            ) {
              throw new Error(`Domanda ${i + 1} manca dei campi obbligatori`);
            }
            q.options = shuffleArray(q.options);
            if (!q.options.includes(q.correctAnswer)) {
              throw new Error(
                `Domanda ${i + 1}: la risposta corretta non è presente tra le opzioni`
              );
            }
          });
          parsedData = shuffleArray(parsedData);
          if (parsedData.length > 24) parsedData = parsedData.slice(0, 24);
          setQuestions(parsedData);
          showTemporaryAlert(
            `Caricate ${parsedData.length} domande con successo!`
          );
          console.log("QuizLoader - Questions loaded:", parsedData.length);
          if (fileInputRef.current) fileInputRef.current.value = "";
        } catch (error) {
          console.error("Errore di caricamento:", error);
          showTemporaryAlert(`Errore: ${(error as Error).message}`);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      };
      reader.readAsText(file);
    },
    [setQuestions, showTemporaryAlert]
  );

  // Gestione del caricamento del file PDF usando extractFromPdf
  const handlePdfUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      console.log("QuizLoader - handlePdfUpload called");
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const extractedQuestions = await extractFromPdf(file);
        console.log(
          "QuizLoader - Questions extracted from PDF:",
          extractedQuestions.length
        );
        extractedQuestions.forEach((q: Question, i: number) => {
          if (
            q.options.length === 0 &&
            q.question.toLowerCase().includes("scelta multipla")
          ) {
            throw new Error(
              `Domanda ${i + 1} manca delle opzioni attese per una domanda a scelta multipla`
            );
          }
          q.options = shuffleArray(q.options);
        });
        let parsedData = shuffleArray(extractedQuestions);
        if (parsedData.length > 24) parsedData = parsedData.slice(0, 24);
        setQuestions(parsedData);
        showTemporaryAlert(
          `Caricate ${parsedData.length} domande da PDF con successo!`
        );
        console.log("QuizLoader - Questions set:", parsedData.length);
        if (pdfInputRef.current) pdfInputRef.current.value = "";
      } catch (error) {
        console.error("Errore di caricamento PDF:", error);
        showTemporaryAlert(`Errore: ${(error as Error).message}`);
        if (pdfInputRef.current) pdfInputRef.current.value = "";
      }
    },
    [setQuestions, showTemporaryAlert]
  );

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

      {/* Upload file PDF */}
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
