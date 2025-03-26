// pdfParser.ts
/**
 * pdfParser.ts
 *
 * Questo modulo contiene la logica per l'estrazione di domande da un file PDF con le risposte già risposte da pdfExtractor.
 * Analizza il contenuto testuale del PDF, identifica le domande a scelta multipla e aperte,
 * estrae le opzioni, le risposte corrette e le spiegazioni, e restituisce un array di oggetti Question.
 *
 * @module pdfParser
 */
import { Question } from "../type/Types";
import { getDocument } from "pdfjs-dist";
import * as pdfjsLib from "pdfjs-dist";

if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
}

function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export const extractQuestionsFromPdfContent = async (
  file: File,
  openQuestionsLimit: number, // Add openQuestionsLimit as a parameter
  multipleChoiceQuestionsLimit: number // Add multipleChoiceQuestionsLimit as a parameter
): Promise<{
  validQuestions: Question[];
  skippedOpenQuestions: string[];
  openQuestions: Question[];
  invalidQuestions: Partial<Question>[];
}> => {
  console.log("🚀 Inizio parsing del contenuto del PDF");

  const skippedOpenQuestions: string[] = [];
  const tempOpenQuestions: Question[] = [];
  const invalidQuestions: Partial<Question>[] = [];
  const tempQuestions: Question[] = [];

  const fileData = await new Promise<Uint8Array>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(new Uint8Array(reader.result));
      } else {
        reject(new Error("Failed to read file as ArrayBuffer"));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });

  const pdf = await getDocument({ data: fileData }).promise;
  let fullText = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    fullText += content.items
      .map((item) => (item as any).str)
      .filter((line) => line.trim() !== "")
      .join("\n");
  }

  fullText = fullText.replace(/(\S)(Domanda multipla)/g, "$1\n$2");

  const lines = fullText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "");

  let currentQuestion: Partial<Question> = defaultQuestion();
  let currentField: "question" | "option" | "answer" | "explanation" = "question";

  const domandaRegex = /^Domanda\s+(aperta|multipla)\s+(\d+):\s*(.*)$/i;
  const optionRegex = /^([A-D])\)\s+(.*?)(?=\s+[A-D]\)|$)/i;
  const answerRegexMulti = /^Risposta\s+corretta:\s*([A-D])/i;
  const answerRegexOpen= /^Risposta:\s/i;
  const explanationRegex = /^Spiegazione:\s*(.*)/i;

  let openQuestionCount = 0;
  let multipleQuestionCount = 0;

  for (const line of lines) {
    if (/^Lezione\s+\d+/i.test(line) || /^Powered by TCPDF/i.test(line)) continue;

    const domandaMatch = line.match(domandaRegex);
    if (domandaMatch) {
      const tipo = domandaMatch[1].toLowerCase();
      const testo = domandaMatch[3].trim();

      if (tipo === "aperta") {
        console.log(`pdfParser: Open question detected: ${testo}`);
        
        // Salva la domanda aperta precedente se esiste
        if (currentQuestion.question && currentQuestion.type === "open") {
          tempOpenQuestions.push({
            id: tempOpenQuestions.length.toString(),
            question: currentQuestion.question.trim(),
            options: [],
            correctAnswer: currentQuestion.correctAnswer || "",
            explanation: currentQuestion.explanation?.trim() || "",
            type: "open",
            userAnswer: "",
          });
        }
        
        // Inizia una nuova domanda aperta
        currentQuestion = defaultQuestion();
        currentQuestion.type = "open";
        currentQuestion.question = testo;
        currentField = "question";
        continue;
      } else {
        // È una domanda a scelta multipla
        if (currentQuestion.question) {
          // Se c'era una domanda precedente (sia aperta che multipla), salvala
          if (currentQuestion.type === "open") {
            tempOpenQuestions.push({
              id: tempOpenQuestions.length.toString(),
              question: currentQuestion.question.trim(),
              options: [],
              correctAnswer: currentQuestion.correctAnswer || "",
              explanation: currentQuestion.explanation?.trim() || "",
              type: "open",
              userAnswer: "",
            });
          } else if (currentQuestion.correctAnswer) {
            console.log(`pdfParser: Multichoice question detected: ${currentQuestion.question}`);
            saveQuestion(currentQuestion, tempQuestions, invalidQuestions);
          }
        }
        
        // Inizia una nuova domanda a scelta multipla
        currentQuestion = defaultQuestion();
        currentQuestion.question = testo;
        currentField = "question";
        continue;
      }
    }

    const optionMatch = line.match(optionRegex);
    if (optionMatch) {
      currentField = "option";
      currentQuestion.options = currentQuestion.options || [];
      currentQuestion.options.push(optionMatch[2].trim());
      continue;
    }

    const answerMatch = line.match(answerRegexMulti);
    if (answerMatch) {
      currentField = "answer";
      const letter = answerMatch[1].toUpperCase();
      const answerIndex = letter.charCodeAt(0) - 65;
      if (currentQuestion.options?.[answerIndex]) {
        currentQuestion.correctAnswer = currentQuestion.options[answerIndex].trim();
      }
      continue;
    }

    if (answerRegexOpen.test(line)) {
      currentField = "answer";
      const cleanedLine = line.replace(answerRegexOpen, "").trim();
      currentQuestion.correctAnswer = cleanedLine;
      continue;
    }

    if (explanationRegex.test(line)) {
      currentField = "explanation";
      const match = line.match(explanationRegex);
      currentQuestion.explanation = match ? match[1].trim() : "";
      continue;
    }

    switch (currentField) {
      case "question":
        currentQuestion.question += " " + line;
        break;
      case "option":
        if (currentQuestion.options?.length) {
          currentQuestion.options[currentQuestion.options.length - 1] += " " + line;
        }
        break;
      case "answer":
        if (currentQuestion.type === "open") {
          currentQuestion.correctAnswer = (currentQuestion.correctAnswer || "") + " " + line;
        }
        break;
      case "explanation":
        currentQuestion.explanation += " " + line;
        break;
    }
  }

  // Salva l'ultima domanda se esiste
  if (currentQuestion.question) {
    if (currentQuestion.type === "open") {
      tempOpenQuestions.push({
        id: tempOpenQuestions.length.toString(),
        question: currentQuestion.question.trim(),
        options: [],
        correctAnswer: currentQuestion.correctAnswer || "",
        explanation: currentQuestion.explanation?.trim() || "",
        type: "open",
        userAnswer: "",
      });
    } else if (currentQuestion.correctAnswer) {
      saveQuestion(currentQuestion, tempQuestions, invalidQuestions);
    }
  }

  // Esegui lo shuffle e seleziona il numero corretto di domande aperte
  const openQuestions = shuffleArray([...tempOpenQuestions]).slice(0, openQuestionsLimit);
  
  // Per le domande multiple, usa il limite appropriato
  const validQuestions = shuffleArray(tempQuestions).slice(0, multipleChoiceQuestionsLimit);

  console.log(`
    📊 Risultati parsing:
    - Domande totali aperte rilevate: ${tempOpenQuestions.length}
    - Domande aperte selezionate: ${openQuestions.length}/${openQuestionsLimit}
    - Domande aperte scartate: ${tempOpenQuestions.length - openQuestions.length}
    - Domande non valide: ${invalidQuestions.length}
    - Domande multiple valide trovate: ${tempQuestions.length}
    - Domande multiple selezionate per il quiz: ${validQuestions.length}/${multipleChoiceQuestionsLimit}
    - Domande multiple scartate per limite: ${tempQuestions.length - validQuestions.length}
  `);

  return {
    validQuestions,
    skippedOpenQuestions,
    openQuestions,
    invalidQuestions,
  };
};

const defaultQuestion = (): Partial<Question> => ({
  question: "",
  options: [],
  correctAnswer: "",
  explanation: "",
  userAnswer: "",
  type: "multiple-choice",
});

function saveQuestion(
  currentQuestion: Partial<Question>,
  validQuestions: Question[],
  invalidQuestions: Partial<Question>[]
) {
  if (
    !currentQuestion.question ||
    !currentQuestion.options ||
    currentQuestion.options.length < 2 ||
    currentQuestion.options.length > 4 ||
    !currentQuestion.correctAnswer ||
    !currentQuestion.options.includes(currentQuestion.correctAnswer)
  ) {
    invalidQuestions.push({ ...currentQuestion });
    return;
  }
  
  validQuestions.push({
    id: validQuestions.length.toString(),
    question: currentQuestion.question.trim(),
    options: currentQuestion.options.map((opt) => opt.trim()),
    correctAnswer: currentQuestion.correctAnswer.trim(),
    explanation: currentQuestion.explanation?.trim() || "Nessuna spiegazione",
    type: "multiple-choice",
    userAnswer: "",
  });
}