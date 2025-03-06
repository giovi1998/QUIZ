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
): Promise<{
  validQuestions: Question[];
  skippedOpenQuestions: string[];
  invalidQuestions: Partial<Question>[];
}> => {
  console.log("🚀 Inizio parsing del contenuto del PDF");

  const skippedOpenQuestions: string[] = [];
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

  // Estrae il testo da tutte le pagine
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    fullText += content.items
      .map((item) => (item as any).str)
      .filter((line) => line.trim() !== "")
      .join("\n");
  }

  console.log("📝 Testo estratto:", fullText);

  // Normalizza il testo per assicurarsi che ogni "Domanda multipla" inizi su una nuova riga
  fullText = fullText.replace(/(\S)(Domanda multipla)/g, "$1\n$2");

  const lines = fullText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "");

  // Inizializzazione variabili per il parsing
  let currentQuestion: Partial<Question> = defaultQuestion();
  let currentField: "question" | "option" | "answer" | "explanation" = "question";

  // Regex unificata per catturare sia domande aperte che multiple (cattura tipo, numero e testo)
  const domandaRegex = /^Domanda\s+(aperta|multipla)\s+(\d+):\s*(.*)$/i;
  const optionRegex = /^([A-D])\)\s+(.*?)(?=\s+[A-D]\)|$)/i;
  const answerRegex = /^Risposta\s+corretta:\s*([A-D])/i;
  const explanationRegex = /^Spiegazione:\s*(.*)/i;

  for (const line of lines) {
    console.log(`🔍 Analizzo la riga: "${line}"`);

    // Salta intestazioni e footer
    if (/^Lezione\s+\d+/i.test(line) || /^Powered by TCPDF/i.test(line)) {
      console.log(`⏩ Riga di intestazione/footer saltata: "${line}"`);
      continue;
    }

    // Se la linea corrisponde a una domanda (aperta o multipla)
    const domandaMatch = line.match(domandaRegex);
    if (domandaMatch) {
      const tipo = domandaMatch[1].toLowerCase(); // "aperta" oppure "multipla"
      // const numero = domandaMatch[2]; // se serve il numero
      const testo = domandaMatch[3].trim();

      if (tipo === "aperta") {
        console.log("❌ Domanda aperta rilevata - salvata in lista scartate");
        skippedOpenQuestions.push(line);
        // Resetta la domanda corrente per evitare conflitti
        currentQuestion = defaultQuestion();
        currentField = "question";
        continue;
      } else {
        // Prima di iniziare una nuova domanda multipla, salva quella corrente se valida
        if (currentQuestion.question && currentQuestion.correctAnswer) {
          saveQuestion(currentQuestion, tempQuestions, invalidQuestions);
        }
        // Resetta la domanda corrente e imposta il campo "question"
        currentQuestion = defaultQuestion();
        currentField = "question";
        currentQuestion.question = testo;
        continue;
      }
    }

    // Se la riga corrisponde a un'opzione
    const optionMatch = line.match(optionRegex);
    if (optionMatch) {
      currentField = "option";
      currentQuestion.options = currentQuestion.options || [];
      currentQuestion.options.push(optionMatch[2].trim());
      continue;
    }

    // Se la riga contiene la risposta corretta
    if (answerRegex.test(line)) {
      currentField = "answer";
      const match = line.match(answerRegex);
      if (match?.[1]) {
        const letter = match[1].toUpperCase();
        const answerIndex = letter.charCodeAt(0) - 65;
        if (currentQuestion.options && currentQuestion.options[answerIndex]) {
          currentQuestion.correctAnswer = currentQuestion.options[answerIndex].trim();
        }
      }
      continue;
    }

    // Se la riga contiene la spiegazione
    if (explanationRegex.test(line)) {
      currentField = "explanation";
      const match = line.match(explanationRegex);
      currentQuestion.explanation = match ? match[1].trim() : "";
      continue;
    }

    // Gestione dei contenuti su più righe in base al campo corrente
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

  // Salva l'ultima domanda se valida
  if (currentQuestion.question && currentQuestion.correctAnswer) {
    saveQuestion(currentQuestion, tempQuestions, invalidQuestions);
  }

  // Statistiche finali
  console.log(`
    📊 Risultati parsing:
    - Domande aperte scartate: ${skippedOpenQuestions.length}
    - Domande non valide: ${invalidQuestions.length}
    - Domande multiple valide trovate: ${tempQuestions.length}
  `);

  // Seleziona al massimo 24 domande per il quiz
  const validQuestions = tempQuestions.slice(0, 24);
  console.log(`✅ Selezionate ${validQuestions.length}/24 domande per il quiz`);

  return {
    validQuestions,
    skippedOpenQuestions,
    invalidQuestions,
  };
};

// Helper per inizializzare una nuova domanda
const defaultQuestion = (): Partial<Question> => ({
  question: "",
  options: [],
  correctAnswer: "",
  explanation: "",
  userAnswer: "",
  type: "multiple-choice",
});

// Funzione di salvataggio con validazione migliorata
function saveQuestion(
  currentQuestion: Partial<Question>,
  validQuestions: Question[],
  invalidQuestions: Partial<Question>[]
) {
  console.log("💾 Salvataggio domanda in corso...");

  if (
    !currentQuestion.question ||
    !currentQuestion.options ||
    currentQuestion.options.length < 2 ||
    currentQuestion.options.length > 4 ||
    !currentQuestion.correctAnswer
  ) {
    console.log("❌ Domanda non valida - requisiti non soddisfatti");
    invalidQuestions.push({ ...currentQuestion });
    return;
  }

  if (!currentQuestion.options.includes(currentQuestion.correctAnswer)) {
    console.log("❌ Risposta corretta non presente nelle opzioni");
    invalidQuestions.push({ ...currentQuestion });
    return;
  }

  const newQuestion: Question = {
    id: validQuestions.length.toString(),
    question: currentQuestion.question.trim(),
    options: currentQuestion.options.map((opt) => opt.trim()),
    correctAnswer: currentQuestion.correctAnswer.trim(),
    explanation: currentQuestion.explanation?.trim() || "Nessuna spiegazione",
    type: "multiple-choice",
    userAnswer: "",
  };

  validQuestions.push(newQuestion);
  console.log("✅ Domanda valida salvata:", newQuestion);
}
