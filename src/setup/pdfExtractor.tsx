import * as pdfjsLib from 'pdfjs-dist';
import { TextItem } from 'pdfjs-dist/types/src/display/api';

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

export interface QuestionFromPdf {
  question: string;
  options: string[];
  lecture: string;
  type: 'multiple-choice' | 'open';
}

// Pattern aggiornati:
// - Le lezioni iniziano con "Lezione" seguito da spazi e un numero
// - Le domande iniziano con due cifre seguite da punto (es. "03.") e finiscono
//   quando ne inizia una nuova o si raggiunge il termine della sezione
const LEC_PATTERN = /Lezione\s+\d+/gi;
const QUEST_PATTERN = /(\d{2}\.)\s+([\s\S]*?)(?=\n\d{2}\.\s+|\nLezione\s+\d+|$)/g;
const OPTION_PATTERN = /^([•○▪▸]\s*)?([^\n]+)/gm;

export async function extractFromPdf(file: File): Promise<QuestionFromPdf[]> {
  if (file.type !== 'application/pdf') {
    throw new Error('Il file non è un PDF valido');
  }

  try {
    console.log("Inizio estrazione dal PDF...");
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      verbosity: 0
    }).promise;

    console.log(`PDF caricato: ${pdf.numPages} pagine`);

    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map(item => (item as TextItem).str)
        .join('\n');
      console.log(`Pagina ${i} - Lunghezza testo: ${pageText.length}`);
      fullText += pageText + '\n\n';
    }
    console.log(`Lunghezza testo estratto totale: ${fullText.length}`);
    const questions = processPdfText(fullText);
    console.log(`Domande estratte: ${questions.length}`);
    return questions;
  } catch (error) {
    throw new Error(`Estrazione fallita: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
  }
}

function processPdfText(text: string): QuestionFromPdf[] {
  const questions: QuestionFromPdf[] = [];

  console.log("Inizio processamento del testo estratto dal PDF");
  // Pulizia del testo: rimuove checkbox, normalizza terminatori di riga e spazi multipli
  const cleanedText = text
    .replace(//g, '')
    .replace(/(\r\n|\n|\r)/gm, '\n')
    .replace(/(\n\s*){2,}/g, '\n');
  console.log("Testo pulito - Lunghezza:", cleanedText.length);

  // Dividi il testo in lezioni usando il pattern "Lezione"
  const lectureSplits = cleanedText.split(LEC_PATTERN);
  console.log(`Lezioni trovate: ${lectureSplits.length - 1}`);
  const lectures = lectureSplits.slice(1); // ignora il contenuto prima della prima lezione

  lectures.forEach((content, index) => {
    const lecture = `Lezione ${String(index + 1).padStart(3, '0')}`;
    console.log(`Elaborazione ${lecture}...`);

    // Estrae le domande usando QUEST_PATTERN
    const questionMatches = [...content.matchAll(QUEST_PATTERN)];
    console.log(`In ${lecture} trovate ${questionMatches.length} domande`);

    questionMatches.forEach(match => {
      const [fullMatch, qNumber, qBody] = match;
      console.log(`Match domanda "${qNumber}" - Lunghezza body: ${qBody.length}`);
      const lines = qBody.split('\n');
      if (lines.length === 0) {
        console.log("Nessuna riga nel body della domanda, salto");
        return;
      }
      // La prima riga contiene il testo della domanda
      let questionText = lines[0].replace(/^\d{2}\.\s*/, '').trim();
      console.log(`Testo domanda estratto: "${questionText}"`);
      if (!questionText) {
        console.log("Testo domanda vuoto, salto");
        return;
      }
      // Determina se la domanda è aperta (basata su parole chiave)
      const isOpenQuestion = /descrivere|fornire|spiegare/i.test(questionText);
      let options: string[] = [];
      if (!isOpenQuestion) {
        // Le righe successive vengono interpretate come opzioni
        options = lines.slice(1)
          .map(line => {
            const optionMatch = OPTION_PATTERN.exec(line);
            // Reset per usare nuovamente il pattern per ogni riga
            OPTION_PATTERN.lastIndex = 0;
            return optionMatch ? optionMatch[2].trim() : line.trim();
          })
          .filter(line => line.length > 0);
      }
      console.log(`Opzioni estratte: ${options.length > 0 ? options.join(" | ") : "nessuna"}`);
      questions.push({
        question: questionText,
        options: options,
        lecture: lecture,
        type: isOpenQuestion ? 'open' : 'multiple-choice'
      });
    });
  });

  return questions;
}
