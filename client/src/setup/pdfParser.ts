// setup/pdfParser.ts
import { Question } from "../components/type/Types";
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
  file: File
): Promise<{
  validQuestions: Question[];
  skippedOpenQuestions: string[];
  openQuestions: Question[];
  invalidQuestions: Partial<Question>[];
}> => {
  console.log("🚀 Inizio parsing del contenuto del PDF");

  const skippedOpenQuestions: string[] = [];
  const openQuestions: Question[] = [];
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
  const answerRegex = /^Risposta\s+corretta:\s*([A-D])/i;
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
        if (openQuestionCount < 2) {
          openQuestions.push({
            id: openQuestions.length.toString(),
            question: testo,
            options: [],
            correctAnswer: "",
            explanation: "",
            type: "open",
            userAnswer: "",
          });
          openQuestionCount++;
        } else {
          skippedOpenQuestions.push(line);
        }
        currentQuestion = defaultQuestion();
        currentField = "question";
        continue;
      } else {
        if (currentQuestion.question && currentQuestion.correctAnswer) {
          saveQuestion(currentQuestion, tempQuestions, invalidQuestions);
          multipleQuestionCount++;
        }
        currentQuestion = defaultQuestion();
        currentQuestion.question = testo;
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

    if (answerRegex.test(line)) {
      currentField = "answer";
      const match = line.match(answerRegex);
      if (match?.[1]) {
        const letter = match[1].toUpperCase();
        const answerIndex = letter.charCodeAt(0) - 65;
        if (currentQuestion.options?.[answerIndex]) {
          currentQuestion.correctAnswer = currentQuestion.options[answerIndex].trim();
        }
      }
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
      case "explanation":
        currentQuestion.explanation += " " + line;
        break;
    }
  }

  if (currentQuestion.question && currentQuestion.correctAnswer) {
    saveQuestion(currentQuestion, tempQuestions, invalidQuestions);
  }

  const validQuestions = shuffleArray(tempQuestions).slice(0, 24);

  console.log(`
    📊 Risultati parsing:
    - Domande totali aperte rilevate: ${openQuestions.length + skippedOpenQuestions.length}
    - Domande aperte scartate: ${skippedOpenQuestions.length}
    - Domande non valide: ${invalidQuestions.length}
    - Domande multiple valide trovate: ${tempQuestions.length}
    - Domande multiple selezionate per il quiz: ${validQuestions.length}/24
    - Domande multiple scartate per limite: ${tempQuestions.length - validQuestions.length}
    - Domande aperte selezionate: ${openQuestions.length}/2
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