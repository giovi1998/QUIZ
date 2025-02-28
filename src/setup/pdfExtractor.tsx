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
    throw new Error('Il file non è un PDF valido');
  }

  try {
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
    }

    return processPdfText(fullText);
  } catch (error) {
    throw new Error(`Estrazione fallita: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
  }
}

function processPdfText(text: string): QuestionFromPdf[] {
  const cleanedText = text
    .replace(/[≥≤−×÷≠≈±Δ\u0394\u2212\u2264\u2265–—]/g, (match) => SPECIAL_CHARS_MAP[match] || match)
    .replace(/(\r\n|\n|\r)/gm, '\n')
    .replace(/(\n\s*){2,}/g, '\n');

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

    const questionMatches = [...lectureContent.matchAll(/(\d{2}\.)\s+([\s\S]*?)(?=\n\d{2}\.|\nLezione\s+\d+|$)/g)];

    questionMatches.forEach(qMatch => {
      const [_, qNumber, qBody] = qMatch;
      const lines = qBody.split('\n').filter(l => l.trim() !== '');

      if (lines.length === 0) return;

      const questionNumber = qNumber.padStart(2, '0');
      const questionText = lines[0]
        .replace(/^\d{2}\.\s*/, '')
        .trim()
        .replace(/\s+/g, ' ');

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

      questions.push({
        question: `${questionNumber}. ${questionText}`,
        options,
        lecture,
        type: isOpenQuestion ? 'open' : 'multiple-choice'
      });
    });
  });

  return questions.sort((a, b) => {
    const lecA = parseInt(a.lecture.split(' ')[1]);
    const lecB = parseInt(b.lecture.split(' ')[1]);
    const numA = parseInt(a.question.split('.')[0]);
    const numB = parseInt(b.question.split('.')[0]);
    return lecA - lecB || numA - numB;
  });
}