// File: pdfExtractor.ts
import * as pdfjsLib from 'pdfjs-dist';
import { TextItem } from 'pdfjs-dist/types/src/display/api';
import { getAiAnswer } from './aiService'; // Importa la funzione getAiAnswer

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

const SPECIAL_CHARS_MAP: { [key: string]: string } = {
  '≥': '>=',
  '≤': '<=',
  '−': '-',
  '×': 'x',
  '÷': '/',
  '≠': '!=',
  '≈': '≈',
  '±': '+/-',
  '': '',
  '–': '-',
  '—': '-',
  'Δ': 'Delta'
};

export interface QuestionFromPdf {
  question: string;
  options: string[];
  lecture: string;
  type: 'multiple-choice' | 'open';
  correctAnswer?: string;
  explanation?: string;
}

export async function extractFromPdf(file: File): Promise<QuestionFromPdf[]> {
  if (file.type !== 'application/pdf') {
    console.error('🚨 File non supportato: solo PDF ammessi');
    throw new Error('Il file non è un PDF valido');
  }

  try {
    console.log('🚀 Inizio estrazione del PDF...');
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      verbosity: 0
    }).promise;

    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map(item => (item as TextItem).str)
        .join('\n');
      fullText += pageText + '\n\n';
      console.log(`✅ Pagina ${i} processata con successo`);
    }

    console.log('🚀 Testo completo del PDF raccolto');
    return await processPdfText(fullText); // Ora la funzione è asincrona
  } catch (error) {
    console.error('🚨 Errore critico durante l estrazione:', error);
    throw new Error(`Estrazione fallita: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
  }
}

async function processPdfText(text: string): Promise<QuestionFromPdf[]> {
  const cleanedText = text
    .replace(/[≥≤−×÷≠≈±Δ\u0394\u2212\u2264\u2265–—]/g, (match) => SPECIAL_CHARS_MAP[match] || match)
    .replace(/(\r\n|\n|\r)/gm, '\n')
    .replace(/(\n\s*){2,}/g, '\n');
    
  console.log('✅ Testo del PDF pulito');

  const questions: QuestionFromPdf[] = [];
  const lectureMatches = [...cleanedText.matchAll(/Lezione\s+(\d{2,3})/gi)];

  for (const match of lectureMatches) {
    const index = lectureMatches.indexOf(match);
    const lectureStart = match.index!;
    const lectureEnd = index < lectureMatches.length - 1
      ? lectureMatches[index + 1].index!
      : cleanedText.length;

    const lectureContent = cleanedText.slice(lectureStart, lectureEnd);
    const lectureNumber = match[1].padStart(3, '0');
    const lecture = `Lezione ${lectureNumber}`;

    if (!match[1]) {
      console.error('⚠️ Errore: Numero lezione non riconosciuto');
      continue;
    }

    console.log(`🚀 Elaborazione ${lecture}`);
    const questionMatches = [...lectureContent.matchAll(/(\d{2}\.)\s+([\s\S]*?)(?=\n\d{2}\.|\nLezione\s+\d+|$)/g)];
    console.log(`⚠️ ${lecture} contiene ${questionMatches.length} domande`);

    for (const qMatch of questionMatches) {
      const [_, qNumber, qBody] = qMatch;
      const lines = qBody.split('\n').filter(l => l.trim() !== '');

      if (lines.length === 0) continue;

      const questionNumber = qNumber.padStart(2, '0');
      
      const questionText = lines[0]
        .replace(/^\d{2}\.\s*/, '')
        .trim()
        .replace(/\s+/g, ' ');

      console.log(`▸ Domanda ${questionNumber}: ${questionText}`);
      const isOpenQuestion = /descrivere|spiegare|fornire/i.test(questionText);
  const cleanedLines = lines.filter(line => 
    !/Set Domande:|© 2016-2024|Data Stampa|Lezione \d{3}/i.test(line)
  );
      const options = !isOpenQuestion
        ? lines.slice(1)
          .map(line => line
            .replace(/^[•○▪▸]\s*/, '')
            .replace(/\s+/g, ' ')
            .trim()
          )
          .filter(line => line.length > 0)
        : [];

      // Nuova logica per limitare a 4 opzioni
      if (options.length > 4) {
        // Prendi le prime 4 opzioni
        const firstFourOptions = options.slice(0, 4);
        // Unisci le opzioni rimanenti nell'ultima
        const mergedExtras = options.slice(4)
          .map(opt => opt.replace(/^[A-Z)]+\s*/i, '').trim()) // Rimuovi lettera e parentesi
          .join(', ');
        firstFourOptions[3] += ` ${mergedExtras}`;
        options.splice(0); // Svuota array originale
        options.push(...firstFourOptions);
      }
      options.forEach(option => console.log(`▸ Opzione: ${option}`));

      let correctAnswer;
      if (!isOpenQuestion) {
        try {
          // Ottieni la risposta corretta con l'IA
          correctAnswer = await getAiAnswer(questionText, options);
          console.log(`✅ Risposta corretta secondo la AI trovata: ${correctAnswer}`);
        } catch (error) {
          console.error(`🚨 Errore getAiAnswer ai:`, error);
          correctAnswer = "Risposta non determinabile"; // Imposta su "N/A" o qualcosa di simile
        }
      }

      questions.push({
        question: `${questionNumber}. ${questionText}`,
        options,
        lecture,
        type: isOpenQuestion ? 'open' : 'multiple-choice',
        correctAnswer,
      });
    }
  }

  console.log(`✅ ${questions.length} domande estratte totali`);
  return questions.sort((a, b) => {
    const lecA = parseInt(a.lecture.split(' ')[1]);
    const lecB = parseInt(b.lecture.split(' ')[1]);
    const numA = parseInt(a.question.split('.')[0]);
    const numB = parseInt(b.question.split('.')[0]);
    return lecA - lecB || numA - numB;
  });
}
