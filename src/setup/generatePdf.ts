// File: generatePdf.ts
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { QuestionFromPdf } from './pdfExtractor';

// Mappa dei caratteri speciali da sostituire
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
  '→': '->',
  '•': '',
  '○': '',
  '▪': '',
  '▸': '',
  '⚠': '',
  '⚠️': '',
  'δ': 'omega',
  'Ω': 'omega',
  'Σ': 'sigma',
  'π': 'pi',
  'Π': 'pi',
  'λ': 'lambda',
  'γ': 'phi',
  'ϕ': 'phi',
  '∫': 'integral',
  '∑': 'sigma',
  '∞': 'infinity',
};

const sanitizeText = (text: string) => {
  return text
    .replace(/[\n\r\x00-\x1F\x7F-\x9F]/g, ' ') // Rimuove caratteri di controllo
    .replace(
      /[≥≤−×÷≠≈±Δ→•○▪▸⚠⚠️δλγϕΩΣπΠ∫\u26A0-\u26FF\uFE00-\uFE0F]/g,
      (match) => (SPECIAL_CHARS_MAP.hasOwnProperty(match) ? SPECIAL_CHARS_MAP[match] : '')
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

    const splitLines = (text: string, maxWidth: number = 500) => {
      const sanitized = sanitizeText(text);
      const words = sanitized.split(' ');
      const lines: string[] = [];
      let currentLine = words[0] || '';

      for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const testLine = currentLine + ' ' + word;
        const width = font.widthOfTextAtSize(testLine, 12);

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

    const addText = (text: string, x: number, y: number, bold = false, maxWidth: number = 500) => {
      const lines = splitLines(text, maxWidth);
      const fontToUse = bold ? boldFont : font;
      const totalHeight = lines.length * 18;

      lines.forEach((line, index) => {
        page.drawText(line, {
          x,
          y: y - index * 18,
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
      return lecA - lecB || parseInt(a.questionNumber) - parseInt(b.questionNumber);
    });

    let currentLecture = '';
    const printedLectures = new Set<string>();

    for (const question of sortedQuestions) {
      // Check if there is enough space for the next question
      const spaceNeededForQuestion =
        18 + // question text
        (question.type === 'multiple-choice'
          ? question.options.length * 18 + 18 + (question.explanation ? 18 : 0)
          : 0) + //options + correctAnswer and explanation
        (question.type === 'open' ? 18 : 0) + //openAnswer
        36 + // Spacing between questions
        (question.lecture !== currentLecture ? 36 + 18 : 0); //Space for the lecture + question title

      if (y - spaceNeededForQuestion < 50) {
        page = pdfDoc.addPage([595, 842]);
        y = 800;
        currentPage++;
      }

      if (question.lecture !== currentLecture) {
        currentLecture = question.lecture;
        if (!printedLectures.has(currentLecture)) {
          y -= addText(`LEZIONE ${question.lecture}`, 50, y, true) + 36;
          printedLectures.add(currentLecture);
        }
      }

      // Formattazione della domanda
      const qText = question.question.replace(/^\d+\.?\s*/, '').trim();
      y -= addText(qText, 50, y, true) + 18;

      // Aggiunta opzioni
      if (question.type === 'multiple-choice') {
        question.options.forEach((option, i) => {
          const optText = `${String.fromCharCode(65 + i)}) ${option}`;
          y -= addText(optText, 70, y);
        });
        y -= 18;

        // Visualizzazione della risposta corretta comprensiva della lettera, se disponibile
        if (question.correctAnswer && question.correctAnswer !== 'Errore: Risposta non determinabile') {
          let answerDisplay;
          if (question.answerLetter) {
              answerDisplay = question.answerLetter; // Mostra solo la lettera
          } else {
              answerDisplay = question.correctAnswer;
          }
          y -= addText(`Risposta corretta: ${answerDisplay}`, 70, y, true) + 18;
           if (!question.answerLetter) {
              y -= addText(`Risposta corretta: ${question.correctAnswer}`, 70, y, true) + 18;
          }
          // Aggiunta della spiegazione, se presente

          if (question.explanation && !question.explanation.startsWith(question.correctAnswer)) {
              y -= addText(`Spiegazione: ${question.explanation}`, 70, y) + 18;
          }
        } else {
          y -= addText('⚠️ Risposta non disponibile', 70, y, true) + 18;
        }
      } else if (question.type === 'open') {
        // Per domande aperte
        if (question.openAnswer) {
          y -= addText(`Risposta: ${question.openAnswer}`, 70, y) + 18;
        } else {
          y -= addText('⚠️ Risposta aperta non disponibile', 70, y, true) + 18;
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
