import React, {
  Dispatch,
  SetStateAction,
  useRef,
  useCallback,
  useEffect,
  useState,
} from "react";
import { Question } from "../App";
import { extractFromPdf } from "./pdfExtractor";
import questionsDefaults from "../Data/questionsDefaults.json";
import { generatePdf } from "./generatePdf";

type QuizLoaderProps = {
  setQuestions: Dispatch<SetStateAction<Question[]>>;
  showTemporaryAlert: (message: string) => void;
  questions: Question[];
  setLoading: Dispatch<SetStateAction<boolean>>;
};

function shuffleArray<T>(array: T[]): T[] {
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
  // externalLoaded indica se è stato caricato un file esterno (JSON o PDF)
  // Per la modalità PDF, dopo la generazione del file PDF, ricarichiamo le domande di default.
  const [externalLoaded, setExternalLoaded] = useState(false);

  // Carica le domande di default se non sono state caricate domande esterne
  useEffect(() => {
    if (!externalLoaded && questions.length === 0) {
      console.log("Caricamento domande di default");
      const defaultQuestions = shuffleArray(questionsDefaults).slice(0, 24);
      console.log(`Default questions loaded: ${defaultQuestions.length}`);
      setQuestions(defaultQuestions);
    }
  }, [externalLoaded, questions, setQuestions]);

  // Gestione caricamento file JSON (rimane invariata)
  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setJsonLoading(true);
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        try {
          const content = event.target?.result as string;
          let parsedData: Question[] = JSON.parse(content);
          if (!Array.isArray(parsedData)) {
            throw new Error("Formato file non valido");
          }
          parsedData = shuffleArray(parsedData).slice(0, 24);
          setQuestions(parsedData);
          setExternalLoaded(true);
          showTemporaryAlert(`Caricate ${parsedData.length} domande da JSON`);
        } catch (error) {
          showTemporaryAlert(`Errore JSON: ${(error as Error).message}`);
        } finally {
          setJsonLoading(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      };
      reader.readAsText(file);
    },
    [setQuestions, showTemporaryAlert]
  );

  // Gestione caricamento file PDF
  // Logica:
  // 1) Estrae le domande dal PDF e genera il PDF con il formato desiderato:
  //    ad esempio, con la struttura:
  //      Lezione 002
  //      Domanda chiusa 01. La visione è il senso che consente all'essere umano di...
  //      A) Opzione 1
  //      B) Opzione 2
  //      ...
  //      Domanda aperta 05: Fornire una descrizione del concetto di Visione e Visione Artificiale
  // 2) Una volta generato il PDF, carica le domande di default (perché le domande estratte dal PDF non hanno risposta)
  const handlePdfUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setPdfLoading(true);
      try {
        const extractedQuestions = await extractFromPdf(file);
        console.log("Domande estratte dal PDF:", extractedQuestions);
        // Genera il file PDF con le domande estratte
        await generatePdf(extractedQuestions);
        showTemporaryAlert(`PDF generato con ${extractedQuestions.length} domande`);
        console.log("Ricarico le domande di default, poiché le domande PDF non contengono risposta");
        // Ricarica le domande di default
        const defaultQuestions = shuffleArray(questionsDefaults).slice(0, 24);
        setQuestions(defaultQuestions);
        // Imposta externalLoaded a false (per far rimanere attive le default)
        setExternalLoaded(false);
      } catch (error) {
        showTemporaryAlert(`Errore PDF: ${(error as Error).message}`);
      } finally {
        setPdfLoading(false);
        if (pdfInputRef.current) pdfInputRef.current.value = "";
      }
    },
    [setQuestions, showTemporaryAlert]
  );

  useEffect(() => {
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
