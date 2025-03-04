// setup/pdfParser.ts
import { Question } from "../components/type/Types";
import { getDocument } from "pdfjs-dist";
import * as pdfjsLib from "pdfjs-dist";

// Assign the worker to the global scope
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
}

export const extractQuestionsFromPdfContent = async (
  file: File
): Promise<Question[]> => {
  console.log("🚀 Inizio parsing del contenuto del PDF in extractQuestionsFromPdfContent");

  // Initialize the worker
  (window as any).pdfjsWorker = pdfjsLib;

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

  console.log("✅ Righe estratte:", fullText);

  // Inserisce un a capo prima di ogni "Domanda multipla" se non è già presente
  // Così, se nel testo c'è "... trasformazione.Domanda multipla 3:" verrà trasformato in:
  // "... trasformazione.
  // Domanda multipla 3:"
  fullText = fullText.replace(/(\S)(Domanda multipla)/g, "$1\n$2");

  const lines = fullText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "");

  const questions: Question[] = [];
  let currentQuestion: Partial<Question> = {
    question: "",
    options: [],
    correctAnswer: "",
    explanation: "",
    userAnswer: "",
    type: "multiple-choice"
  };

  // currentField indica la sezione corrente in cui stiamo accumulando il testo
  let currentField: "question" | "option" | "answer" | "explanation" = "question";

  // Regex per opzioni, risposta e spiegazione
  const optionRegex = /^([A-D])\)\s+(.+)/i;
  const answerRegex = /^Risposta\s+corretta:\s*([A-D])/i;
  const explanationRegex = /^Spiegazione:\s*(.*)/i;
  // Regex per identificare l'inizio di una domanda multipla e rimuovere il prefisso
  const domandaMultiplaRegex = /^Domanda multipla\s*\d+:\s*(.*)/i;

  for (const line of lines) {
    console.log(`🔍 Analizzo la riga: "${line}"`);

    // Salta righe non rilevanti
    if (/^Lezione\s+\d+/i.test(line) || /^Powered by TCPDF/i.test(line)) {
      console.log(`⏩ Riga saltata: "${line}"`);
      continue;
    }

    // Salta domande aperte
    if (line.toLowerCase().startsWith("domanda aperta")) {
      console.log("❌ Domanda aperta rilevata, salto");
      currentQuestion = {
        question: "",
        options: [],
        correctAnswer: "",
        explanation: "",
        userAnswer: "",
        type: "multiple-choice"
      };
      currentField = "question";
      continue;
    }

    // Inizio di una nuova domanda multipla
    if (line.toLowerCase().startsWith("domanda multipla")) {
      // Se esiste già una domanda attiva e completa, salvala
      if (currentQuestion.question && currentQuestion.correctAnswer) {
        console.log("💾 Salvataggio domanda finale");
        saveQuestion(currentQuestion, questions);
        if (questions.length >= 24) {
          console.log("🎯 Quiz di 24 domande completato");
          break;
        }
        currentQuestion = {
          question: "",
          options: [],
          correctAnswer: "",
          explanation: "",
          userAnswer: "",
          type: "multiple-choice"
        };
      }
      currentField = "question";
      const match = line.match(domandaMultiplaRegex);
      if (match && match[1]) {
        // Il testo della domanda viene preso senza il prefisso "Domanda multipla X:"
        currentQuestion.question = match[1].trim();
      } else {
        // Se non riesce a rimuovere il prefisso, usa la linea completa
        currentQuestion.question = line;
      }
      continue;
    }

    // Se la linea corrisponde a un’opzione (A-D)
    if (optionRegex.test(line)) {
      console.log(`🔖 Trovata opzione: "${line}"`);
      currentField = "option";
      const match = line.match(optionRegex);
      if (match && match[2]) {
        currentQuestion.options?.push(match[2].trim());
      }
      continue;
    }

    // Se la linea corrisponde alla risposta corretta
    if (answerRegex.test(line)) {
      console.log(`✅ Trovata risposta corretta: "${line}"`);
      currentField = "answer";
      const match = line.match(answerRegex);
      if (match?.[1]) {
        const letter = match[1].toUpperCase();
        const answerIndex = letter.charCodeAt(0) - 65;
        if (currentQuestion.options && currentQuestion.options[answerIndex]) {
          currentQuestion.correctAnswer = `${letter}) ${currentQuestion.options[answerIndex]}`;
        }
      }
      continue;
    }

    // Se la linea corrisponde a una spiegazione
    if (explanationRegex.test(line)) {
      console.log(`💡 Trovata spiegazione: "${line}"`);
      currentField = "explanation";
      const match = line.match(explanationRegex);
      if (match) {
        currentQuestion.explanation = match[1].trim();
        if (!line.trim().endsWith(".")) {
          console.log(`➡️ Spiegazione multi-riga attivata`);
        }
      }
      continue;
    }

    // Se la linea non corrisponde ad alcun marker, aggiungila al campo corrente
    switch (currentField) {
      case "question":
        currentQuestion.question += " " + line;
        break;
      case "option":
        if (currentQuestion.options && currentQuestion.options.length > 0) {
          currentQuestion.options[currentQuestion.options.length - 1] += " " + line;
        } else {
          currentQuestion.question += " " + line;
        }
        break;
      case "explanation":
        currentQuestion.explanation += " " + line;
        break;
      case "answer":
        // Raramente le risposte sono multilinea
        currentQuestion.question += " " + line;
        break;
    }
  }

  // Salva l'ultima domanda se completa
  if (currentQuestion.question && currentQuestion.correctAnswer) {
    console.log("💾 Salvataggio ultima domanda");
    saveQuestion(currentQuestion, questions);
  }

  // Se ci sono più di 24 domande, mantieni solo le prime 24
  if (questions.length > 24) {
    console.log("🎯 Limito il quiz alle prime 24 domande");
    questions.splice(24);
  }

  console.log(`✅ Trovate ${questions.length} domande multiple valide in extractQuestionsFromPdfContent`);
  return questions;
};

function saveQuestion(
  currentQuestion: Partial<Question>,
  questions: Question[]
) {
  console.log("💾 Salvataggio domanda in saveQuestion");
  // Salva la domanda solo se esiste del testo, almeno 2 opzioni e una risposta corretta
  if (
    currentQuestion.question &&
    currentQuestion.options &&
    currentQuestion.options.length >= 2 &&
    currentQuestion.correctAnswer
  ) {
    console.log("💾 Domanda salvata con successo");
    questions.push({
      id: questions.length.toString(),
      question: currentQuestion.question.trim(),
      options: currentQuestion.options.map((opt) => opt.trim()),
      correctAnswer: currentQuestion.correctAnswer.trim(),
      explanation: (currentQuestion.explanation || "Nessuna spiegazione disponibile").trim(),
      type: "multiple-choice",
      userAnswer: ""
    });
  } else {
    console.log("❌ Domanda non valida");
    console.log("Question:", currentQuestion.question);
    console.log("Options", currentQuestion.options);
    console.log("Correct Answer:", currentQuestion.correctAnswer);
  }
}

