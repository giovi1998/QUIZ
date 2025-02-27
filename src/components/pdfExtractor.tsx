// pdfExtractor.tsx
import * as pdfjsLib from 'pdfjs-dist';
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
interface Question {
  question: string;
  options: string[];
  lecture: string;
  type: 'multiple-choice' | 'open';
}
export interface QuestionFromPdf {
    question: string;
    options: string[];
    correctAnswer?: string;
    explanation?: string;
    lecture?: string;
    type?: 'multiple-choice' | 'open';
}

const LEC_PATTERN = /Lezione\s+\d+/gi;
const QUEST_PATTERN = /(\d+)\.\s+([^\n]+)/gmi;
const OPTION_PATTERN = /^\s+(.+)$/gm; // Pattern per opzioni con indentazione

/**
 * Estrae il testo da un file PDF e lo elabora per ricavare domande, opzioni e informazioni aggiuntive.
 * @param file - Il file PDF da cui estrarre i dati.
 * @returns Una promessa che risolve in un array di oggetti QuestionFromPdf.
 * @throws Se l'estrazione fallisce o se il file non è un PDF valido.
 */
export async function extractFromPdf(file: File): Promise<QuestionFromPdf[]> {
    try {
        // Verifica se il file è un PDF
        if (file.type !== 'application/pdf') {
            throw new Error('Il file caricato non è un PDF.');
        }
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;

        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();

            fullText += textContent.items
                .map((item) => ('str' in item) ? item.str : '')
                .join('\n') + '\n\n';
        }

        return processPdfText(fullText);
    } catch (error) {
        throw new Error(`Estrazione da PDF fallita: ${error instanceof Error ? error.message : String(error)}`);
    }
}

/**
 * Elabora il testo estratto dal PDF per identificare e formattare le domande, le opzioni, le risposte e le spiegazioni.
 * @param text - Il testo estratto dal PDF.
 * @returns Un array di oggetti QuestionFromPdf.
 */
function processPdfText(text: string): QuestionFromPdf[] {
    const questions: QuestionFromPdf[] = [];
    const cleanedText = text
        .replace(/(\r\n|\n|\r)/gm, '\n')  // Normalizza i terminatori di riga
        .replace(/\s{2,}/g, ' ');           // Rimuove gli spazi multipli

    // Divide il testo in sezioni basandosi sul pattern di "Lezione"
    const lectures = cleanedText.split(LEC_PATTERN).slice(1);

    // Itera su ogni sezione di "lezione"
    lectures.forEach((lectureContent, index) => {
        const lecture = `Lezione ${index + 1}`; // Assegna un numero di lezione basato sull'indice

        const questionBlocks = [...lectureContent.matchAll(QUEST_PATTERN)];

        questionBlocks.forEach(match => {
            const qNumber = match[1];
            const qText = match[2].trim();
            let options: string[] = [];
             // Trova il testo rimanente dopo la domanda
            let remainingText = lectureContent.substring(match.index! + match[0].length)
              const optionMatches = [...remainingText.matchAll(OPTION_PATTERN)];
               for (const optionMatch of optionMatches) {
                if (optionMatch[1] && !optionMatch[1].trim().toLowerCase().startsWith("descrivere") ) {
                    options.push(optionMatch[1].trim());
                } else {
                    break; // Esci dal ciclo se trovi "descrivere"
                }
               }
            
               if (!qText.toLowerCase().includes("descrivere") && options.length > 0) {
                //trovo la risposta corretta nel testo
                let correctAnswer: string | undefined = undefined;
                const correctAnswerMatch = lectureContent.match(/Risposta\s+corretta\s*:\s*(.+)/i);
                if (correctAnswerMatch && correctAnswerMatch[1]) {
                    correctAnswer = correctAnswerMatch[1].trim();
                } else {
                    console.error(`Risposta corretta non trovata per la domanda: ${qText}`);
                }
                questions.push({
                    question: `${qNumber}. ${qText.trim()}`,
                    options: options,
                    correctAnswer: correctAnswer,
                    lecture,
                    type: "multiple-choice"
                });
            }

        });
    });
    return questions;
}