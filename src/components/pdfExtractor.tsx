// pdfExtractor.tsx
import * as pdfjsLib from 'pdfjs-dist';
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface Question {
  question: string;
  options: string[];
  lecture: string;
  type: 'multiple-choice' | 'open';
}

const LEC_PATTERN = /Lezione\s+\d+/gi;
const QUEST_PATTERN = /\*\*(\d+)\.\*\*\s*(.+?)(?=\n\*\*|\n\s*$|\nLezione|$)/gis;
const OPTION_PATTERN = /^(\d+\.\s*|◦|•|○|—|\))\s*(.+)/gm;

export async function extractFromPdf(file: File): Promise<Question[]> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      fullText += textContent.items.map(item => item.str).join('\n') + '\n\n';
    }

    return processPdfText(fullText);
  } catch (error) {
    throw new Error(`Extraction failed: ${error}`);
  }
}

function processPdfText(text: string): Question[] {
  const questions: Question[] = [];
  const cleanedText = text
    .replace(/(\r\n|\n|\r)/gm, '\n')
    .replace(/\s{2,}/g, ' ')
    .replace(/(\d+)\.(\D)/g, '$1. $2');

  const lectures = cleanedText.split(LEC_PATTERN).slice(1);
  lectures.forEach((lectureContent, index) => {
    const lecture = `Lezione ${index + 1}`;
    const questionBlocks = [...lectureContent.matchAll(QUEST_PATTERN)];
    
    questionBlocks.forEach((match) => {
      const qNumber = match[1];
      const qText = match[2].trim();
      const isMultipleChoice = qText.toLowerCase().includes('scelta multipla');
      const options: string[] = [];
      let currentLine = qText;
      let remainingText = lectureContent.split(qText)[1] || '';
      
      // Collect options until next question or end
      while (remainingText && options.length < 4) {
        const optionMatch = remainingText.match(OPTION_PATTERN);
        if (!optionMatch) break;
        
        const [, prefix, text] = optionMatch[0].match(OPTION_PATTERN)!;
        options.push(text.trim());
        remainingText = remainingText.slice(optionMatch[0].length);
      }

      questions.push({
        question: `${qNumber}. ${qText}`,
        options: options.length > 0 ? options : [''],
        lecture,
        type: isMultipleChoice ? 'multiple-choice' : 'open'
      });
    });
  });

  return questions.filter(q => q.question && q.options.length > 0);
  
}

