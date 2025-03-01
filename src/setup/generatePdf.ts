// File: generatePdf.ts
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { QuestionFromPdf } from './pdfExtractor.tsx';
import { getAiAnswer } from './aiService.ts';

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
  const sanitized = text.replace(/[≥≤−×÷≠≈±Δ\u0394\u2212\u2264\u2265–—]/g, (match) => 
    SPECIAL_CHARS_MAP[match] || match
  );
  console.log('✅ Testo sanitizzato:', sanitized);
  return sanitized;
};

export async function generatePdf(questions: QuestionFromPdf[]) {
  if (questions.length === 0) {
    console.error('🚨 Nessuna domanda trovata per la generazione del PDF');
    throw new Error('Nessuna domanda da convertire in PDF');
  }

  try {
    console.log('🚀 Inizio generazione PDF...');
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    let page = pdfDoc.addPage([595, 842]);
    let y = 800;
    let currentPage = 1;
    
    console.log('✅ Font caricati con successo');

    const splitLines = (text: string) => {
      console.log(`▸ Divisione testo in righe per: ${text}`);
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
      const currentFont = bold ? boldFont : font;
      const lines = splitLines(text);
      const totalHeight = lines.length * 18;
      
      lines.forEach((line, index) => {
        page.drawText(line, {
          x,
          y: y - (index * 18),
          size: 12,
          font: currentFont,
          color: rgb(0, 0, 0),
        });
      });
      console.log(`✅ Testo aggiunto: "${text}" (altezza totale: ${totalHeight})`);
      return totalHeight;
    };

    const sortedQuestions = questions.sort((a, b) => {
      const lecA = parseInt(a.lecture.split(' ')[1]);
      const lecB = parseInt(b.lecture.split(' ')[1]);
      const numA = parseInt(a.question.split('.')[0]);
      const numB = parseInt(b.question.split('.')[0]);
      return lecA - lecB || numA - numB;
    });

    let currentLecture = '';
    // Nel ciclo delle domande
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

  // Aggiungi la domanda
  const qText = question.question.split('. ').slice(1).join('. ');
  y -= addText(qText, 50, y, true) + 18;

  // Aggiungi le opzioni
  if (question.type === 'multiple-choice') {
    question.options.forEach((option, i) => {
      const optText = `${String.fromCharCode(65 + i)}) ${option}`;
      y -= addText(optText, 70, y) + 18;
    });
    
    // Aggiungi la risposta dell'IA dopo le opzioni
    try {
      const answer = await getAiAnswer(question.question, question.options);
      y -= addText(`→ Risposta generata: ${answer}`, 70, y, true) + 18;
      question.correctAnswer = answer; // Aggiorna il dato
    } catch (error) {
      y -= addText('⚠️ Errore AI', 70, y, true) + 18;
    }
  } else {
    y -= addText("[Spazio per risposta aperta]", 70, y) + 18;
  }

  // Spaziatura tra domande
  y -= 36;
};

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'domande_ordinate.pdf';
    link.click();

  } catch (error) {
      console.error('Errore durante la generazione del PDF:', error);
      throw error;
    }
}