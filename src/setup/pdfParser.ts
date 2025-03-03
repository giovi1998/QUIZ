// pdfParser.ts
import { Question } from '../components/type/types';

export const extractQuestionsFromPdfContent = async (pdfContent: string): Promise<Question[]> => {
  console.log("🚀 Inizio parsing del contenuto del PDF");
  const lines = pdfContent
    .split('\n')
    .map(line => line.trim())
    .filter(line => line !== "");
  console.log("✅ Righe estratte:", lines);

  const questions: Question[] = [];
  let currentQuestion: Partial<Question> = {};
  let currentOptions: string[] = [];
  let isQuestionActive = false;
  let isExplanationActive = false;

  // Pattern per riconoscere le opzioni, la risposta e la spiegazione
  const optionRegex = /^([A-D])[\)\.]?\s+/i;
  const answerRegex = /^Risposta\s+corretta:\s*([A-D])/i;
  const explanationRegex = /^Spiegazione:\s*(.*)/i;

  for (const line of lines) {
    // Salta le righe che iniziano con "Lezione ..."
    if (/^Lezione\s+\d+/i.test(line)) {
      continue;
    }

    // Gestione delle multilinee per la spiegazione
    if (isExplanationActive) {
      // Se la linea corrente sembra iniziare un nuovo marker, interrompiamo la spiegazione
      if (optionRegex.test(line) || answerRegex.test(line) || explanationRegex.test(line)) {
        isExplanationActive = false;
      } else {
        currentQuestion.explanation = (currentQuestion.explanation || "") + " " + line;
        if (line.endsWith('.')) {
          isExplanationActive = false;
        }
        continue;
      }
    }

    // Se la linea corrisponde a un’opzione (A-D)
    if (optionRegex.test(line)) {
      if (!isQuestionActive) {
        // Se non è ancora attiva una domanda, inizializziamo una domanda vuota
        currentQuestion = { question: "", correctAnswer: "", explanation: "" };
        isQuestionActive = true;
      }
      const cleanedLine = line.replace(optionRegex, '').trim();
      currentOptions.push(cleanedLine);
      continue;
    }

    // Se la linea corrisponde alla risposta corretta
    if (answerRegex.test(line)) {
      const match = line.match(answerRegex);
      if (match?.[1]) {
        const letter = match[1].toUpperCase();
        const answerIndex = letter.charCodeAt(0) - 65;
        if (currentOptions[answerIndex]) {
          currentQuestion.correctAnswer = `${letter}) ${currentOptions[answerIndex]}`;
        }
      }
      continue;
    }

    // Se la linea corrisponde a una spiegazione
    if (explanationRegex.test(line)) {
      const match = line.match(explanationRegex);
      if (match?.[1]) {
        currentQuestion.explanation = match[1];
        // Se la linea non termina con un punto, assumiamo che la spiegazione prosegua su più righe
        isExplanationActive = !line.endsWith('.');
      }
      continue;
    }

    // Se la linea non corrisponde a nessun marker e una domanda è già attiva...
    if (isQuestionActive) {
      if (currentOptions.length === 0) {
        // Se non sono ancora state aggiunte opzioni, la linea è una continuazione del testo della domanda
        currentQuestion.question = currentQuestion.question 
          ? currentQuestion.question + " " + line 
          : line;
      } else {
        // Se sono già state aggiunte opzioni, la linea viene considerata come continuazione dell'ultima opzione
        currentOptions[currentOptions.length - 1] += " " + line;
      }
    } else {
      // Se non è ancora attiva una domanda, inizializza una nuova domanda con il testo corrente
      currentQuestion = { question: line, correctAnswer: "", explanation: "" };
      isQuestionActive = true;
    }
  }

  // Alla fine, se una domanda è ancora attiva, salvala
  if (isQuestionActive) {
    saveQuestion(currentQuestion, currentOptions, questions);
  }

  console.log(`✅ Trovate ${questions.length} domande valide`);
  return questions;
};

function saveQuestion(currentQuestion: Partial<Question>, options: string[], questions: Question[]) {
  // Salva la domanda solo se esiste del testo, sono presenti almeno 2 opzioni e una risposta corretta
  if (currentQuestion.question && options.length >= 2 && currentQuestion.correctAnswer) {
    questions.push({
      id: questions.length.toString(),
      question: currentQuestion.question.trim(),
      options: options.map(opt => opt.trim()),
      correctAnswer: currentQuestion.correctAnswer.trim(),
      explanation: (currentQuestion.explanation || "Nessuna spiegazione disponibile").trim(),
      type: "multiple-choice",
      userAnswer: ""
    });
  }
}
