// File: generatePdf.ts
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { QuestionFromPdf } from './pdfExtractor.tsx';

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

const sanitizeText = (text: string) => {
  return text.replace(/[≥≤−×÷≠≈±Δ\u0394\u2212\u2264\u2265–—]/g, (match) => 
    SPECIAL_CHARS_MAP[match] || match
  );
};

export async function generatePdf(questions: QuestionFromPdf[]) {
  if (questions.length === 0) {
    throw new Error('Nessuna domanda da convertire in PDF');
  }

  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let page = pdfDoc.addPage([595, 842]);
  let y = 800;
  const margin = 50;
  const fontSize = 12;
  const lineHeight = 18;
  const maxWidth = 500;

  const splitLines = (text: string) => {
    const sanitized = sanitizeText(text);
    const words = sanitized.split(' ');
    const lines: string[] = [];
    let currentLine = words[0] || '';

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const testLine = currentLine + ' ' + word;
      const width = font.widthOfTextAtSize(testLine, fontSize);
      
      if (width < maxWidth) {
        currentLine = testLine;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  };

  const addText = (text: string, x: number, y: number, bold = false) => {
    const currentFont = bold ? boldFont : font;
    const lines = splitLines(text);
    
    lines.forEach((line, index) => {
      page.drawText(line, {
        x,
        y: y - (index * lineHeight),
        size: fontSize,
        font: currentFont,
        color: rgb(0, 0, 0),
      });
    });
    return lines.length * lineHeight;
  };

  const sortedQuestions = questions.sort((a, b) => {
    const lecA = parseInt(a.lecture.split(' ')[1]);
    const lecB = parseInt(b.lecture.split(' ')[1]);
    const numA = parseInt(a.question.split('.')[0]);
    const numB = parseInt(b.question.split('.')[0]);
    return lecA - lecB || numA - numB;
  });

  let currentLecture = '';
  for (const question of sortedQuestions) {
    if (y < margin + 100) {
      page = pdfDoc.addPage([595, 842]);
      y = 800;
      currentLecture = '';
    }

    if (question.lecture !== currentLecture) {
      currentLecture = question.lecture;
      y -= addText(currentLecture, margin, y, true) + lineHeight;
      y -= lineHeight * 2;
    }

    const qText = question.question.split('. ').slice(1).join('. ');
    y -= addText(qText, margin, y, true) + lineHeight;

    if (question.type === 'multiple-choice') {
      question.options.forEach((option, i) => {
        const optText = `${String.fromCharCode(65 + i)}) ${option}`;
        y -= addText(optText, margin + 20, y) + lineHeight;
      });
    } else {
      y -= addText("[Spazio per risposta aperta]", margin + 20, y) + lineHeight;
    }
    y -= lineHeight * 1.5;
  }

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'domande_ordinate.pdf';
  link.click();
}