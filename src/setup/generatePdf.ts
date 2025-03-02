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
  'Δ': 'Delta',
  '→': '->' // Added mapping for the arrow
};

const sanitizeText = (text: string) => {
  return text.replace(/[≥≤−×÷≠≈±Δ→\u26A0-\u26FF\uFE00-\uFE0F]/g, (match) =>
    SPECIAL_CHARS_MAP[match] || match
  );
};

export async function generatePdf(questions: QuestionFromPdf[]) {
  if (questions.length === 0) {
    throw new Error('Nessuna domanda da convertire in PDF');
  }

  try {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    let page = pdfDoc.addPage([595, 842]);
    let y = 800;
    let currentPage = 1;

    const splitLines = (text: string) => {
      const sanitized = sanitizeText(text);
      const words = sanitized.split(' ');
      const lines: string[] = [];
      let currentLine = words[0] || '';
      
      for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const testLine = currentLine + ' ' + word;
        const width = font.widthOfTextAtSize(testLine, 12);
        
        if (width < 500) {
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
      const lines = splitLines(text);
      const fontToUse = bold ? boldFont : font;
      const totalHeight = lines.length * 18;
      
      lines.forEach((line, index) => {
        page.drawText(line, {
          x,
          y: y - (index * 18),
          size: 12,
          font: fontToUse,
          color: rgb(0, 0, 0),
        });
      });
      return totalHeight;
    };

    const sortedQuestions = questions.sort((a, b) => {
      const lecA = parseInt(a.lecture.split(' ')[1]);
      const lecB = parseInt(b.lecture.split(' ')[1]);
      return lecA - lecB;
    });

    let currentLecture = '';

    for (const question of sortedQuestions) {
      if (y < 50 + 100) {
        page = pdfDoc.addPage([595, 842]);
        y = 800;
        currentPage++;
      }

      if (question.lecture !== currentLecture) {
        currentLecture = question.lecture;
        y -= addText(`LEZIONE ${question.lecture}`, 50, y, true) + 36;
      }

      // Formattazione domanda
      // Modifica la formattazione della domanda
      const qText = question.question.replace(/^\d+\.?\s*/, ''); // Rimuove numero e punto
      y -= addText(qText, 50, y, true) + 18;

      // Aggiunta opzioni
      if (question.type === 'multiple-choice') {
        question.options.forEach((option, i) => {
          const optText = `${String.fromCharCode(65 + i)}) ${option}`;
          y -= addText(optText, 70, y);
        });
        y -= 18; // Spaziatura

        // Visualizza la risposta corretta dalla proprietà correctAnswer
        if (question.correctAnswer) {
          y -= addText(`→ Risposta corretta: ${question.correctAnswer}`, 70, y, true) + 18;
        } else {
          y -= addText('⚠️ Risposta non disponibile', 70, y, true) + 18;
        }

        // Aggiungi spiegazione dopo la risposta
        if (question.correctAnswer && question.explanation) {
          y -= addText(`→ Spiegazione: ${question.explanation}`, 70, y) + 18;
        }
        
      }

      // Spaziatura tra domande
      y -= 36;
    }

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'domande_ordinate.pdf';
    link.click();
    
  } catch (error) {
    console.error('Errore generazione PDF:', error);
    throw error;
  }
}