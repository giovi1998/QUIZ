// setup/pdfParser.ts
import { Question } from "../components/type/Types";
import { getDocument } from "pdfjs-dist";
import * as pdfjsLib from "pdfjs-dist";

if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
}

export const extractQuestionsFromPdfContent = async (
  file: File
): Promise<Question[]> => {
  console.log("🚀 Inizio parsing del contenuto del PDF in extractQuestionsFromPdfContent");

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

  console.log("✅ Testo estratto:", fullText);

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
    type: "multiple-choice",
  };

  let currentField: "question" | "option" | "answer" | "explanation" = "question";

  const optionRegex = /^([A-D])\)\s+(.+)/i;
  const answerRegex = /^Risposta\s+corretta:\s*([A-D])/i;
  const explanationRegex = /^Spiegazione:\s*(.*)/i;
  const domandaMultiplaRegex = /^Domanda multipla\s*\d+:\s*(.*)/i;

  for (const line of lines) {
    console.log(`🔍 Analizzo la riga: "${line}"`);

    if (/^Lezione\s+\d+/i.test(line) || /^Powered by TCPDF/i.test(line)) {
      console.log(`⏩ Riga saltata: "${line}"`);
      continue;
    }

    if (line.toLowerCase().startsWith("domanda aperta")) {
      console.log("❌ Domanda aperta rilevata, salto");
      currentQuestion = {
        question: "",
        options: [],
        correctAnswer: "",
        explanation: "",
        userAnswer: "",
        type: "multiple-choice",
      };
      currentField = "question";
      continue;
    }

    if (line.toLowerCase().startsWith("domanda multipla")) {
      if (currentQuestion.question && currentQuestion.correctAnswer) {
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
          type: "multiple-choice",
        };
      }

      currentField = "question";
      const match = line.match(domandaMultiplaRegex);
      if (match && match[1]) {
        currentQuestion.question = match[1].trim();
      } else {
        currentQuestion.question = line;
      }
      continue;
    }

    if (optionRegex.test(line)) {
      console.log(`🔖 Trovata opzione: "${line}"`);
      currentField = "option";
      const match = line.match(optionRegex);
      if (match && match[2]) {
        currentQuestion.options?.push(match[2]); // Senza .trim()
      }
      continue;
    }

    if (answerRegex.test(line)) {
      console.log(`✅ Risposta corretta trovata: "${line}"`);
      currentField = "answer";
      const match = line.match(answerRegex);
      if (match?.[1]) {
        const letter = match[1].toUpperCase();
        const answerIndex = letter.charCodeAt(0) - 65;
        if (currentQuestion.options && currentQuestion.options[answerIndex]) {
          // Normalizza il testo della risposta corretta
          currentQuestion.correctAnswer = `${currentQuestion.options[answerIndex].trim()}`;
        }
      }
      continue;
    }

    if (explanationRegex.test(line)) {
      console.log(`💡 Trovata spiegazione: "${line}"`);
      currentField = "explanation";
      const match = line.match(explanationRegex);
      if (match) {
        currentQuestion.explanation = match[1].trim();
      }
      continue;
    }

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
        currentQuestion.question += " " + line;
        break;
    }
  }

  if (currentQuestion.question && currentQuestion.correctAnswer) {
    saveQuestion(currentQuestion, questions);
  }

  if (questions.length > 24) {
    questions.splice(24);
    console.log("🎯 Limitato a 24 domande");
  }

  console.log(`✅ ${questions.length} domande valide estratte`);
  return questions;
};

function saveQuestion(
  currentQuestion: Partial<Question>,
  questions: Question[]
) {
  console.log("💾 Salvataggio domanda");
  if (
    currentQuestion.question &&
    currentQuestion.options &&
    currentQuestion.options.length >= 2 &&
    currentQuestion.correctAnswer
  ) {
    questions.push({
      id: questions.length.toString(),
      question: currentQuestion.question.trim(),
      options: currentQuestion.options, // Senza .map(opt => opt.trim())
      correctAnswer: currentQuestion.correctAnswer.trim(), // Normalizza qui
      explanation: (currentQuestion.explanation || "Nessuna spiegazione").trim(),
      type: "multiple-choice",
      userAnswer: "",
    });
    console.log("✅ Domanda salvata con successo");
  } else {
    console.log("❌ Domanda non valida");
    console.log("Domanda:", currentQuestion.question);
    console.log("Opzioni:", currentQuestion.options);
    console.log("Risposta corretta:", currentQuestion.correctAnswer);
  }
}
