// File: pdfExtractor.ts
import * as pdfjsLib from 'pdfjs-dist';
import { TextItem } from 'pdfjs-dist/types/src/display/api';

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
    return processPdfText(fullText);
  } catch (error) {
    console.error('🚨 Errore critico durante l estrazione:', error);
    throw new Error(`Estrazione fallita: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
  }
}

function processPdfText(text: string): QuestionFromPdf[] {
  const cleanedText = text
    .replace(/[≥≤−×÷≠≈±Δ\u0394\u2212\u2264\u2265–—]/g, (match) => SPECIAL_CHARS_MAP[match] || match)
    .replace(/(\r\n|\n|\r)/gm, '\n')
    .replace(/(\n\s*){2,}/g, '\n');
  console.log('✅ Testo del PDF pulito');

  const questions: QuestionFromPdf[] = [];
  const lectureMatches = [...cleanedText.matchAll(/Lezione\s+(\d{2,3})/gi)];

  lectureMatches.forEach((match, index) => {
    const lectureStart = match.index!;
    const lectureEnd = index < lectureMatches.length - 1 
      ? lectureMatches[index + 1].index!
      : cleanedText.length;

    const lectureContent = cleanedText.slice(lectureStart, lectureEnd);
    const lectureNumber = match[1].padStart(3, '0');
    const lecture = `Lezione ${lectureNumber}`;
    
    if (!match[1]) {
      console.error('⚠️ Errore: Numero lezione non riconosciuto');
      return;
    }

    console.log(`🚀 Elaborazione ${lecture}`);
    const questionMatches = [...lectureContent.matchAll(/(\d{2}\.)\s+([\s\S]*?)(?=\n\d{2}\.|\nLezione\s+\d+|$)/g)];
    console.log(`⚠️ ${lecture} contiene ${questionMatches.length} domande`);

    questionMatches.forEach(qMatch => {
      const [_, qNumber, qBody] = qMatch;
      const lines = qBody.split('\n').filter(l => l.trim() !== '');

      if (lines.length === 0) return;

      const questionNumber = qNumber.padStart(2, '0');
      const questionText = lines[0]
        .replace(/^\d{2}\.\s*/, '')
        .trim()
        .replace(/\s+/g, ' ');

      console.log(`▸ Domanda ${questionNumber}: ${questionText}`);
      const isOpenQuestion = /descrivere|fornire|spiegare/i.test(questionText);

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

      questions.push({
        question: `${questionNumber}. ${questionText}`,
        options,
        lecture,
        type: isOpenQuestion ? 'open' : 'multiple-choice'
      });
    });
  });

  console.log(`✅ ${questions.length} domande estratte totali`);
  return questions.sort((a, b) => {
    const lecA = parseInt(a.lecture.split(' ')[1]);
    const lecB = parseInt(b.lecture.split(' ')[1]);
    const numA = parseInt(a.question.split('.')[0]);
    const numB = parseInt(b.question.split('.')[0]);
    return lecA - lecB || numA - numB;
  });
}