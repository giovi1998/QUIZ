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
  'γ': 'gamma',
  'ϕ': 'phi',
  '∫': 'integral',
  '∞': 'infinity',
  '∈': 'e',
  'α': 'alpha',
  'β': 'beta',
  'ε': 'epsilon',
  'ζ': 'zeta',
  'η': 'eta',
  'θ': 'theta',
  'ι': 'iota',
  'κ': 'kappa',
  'μ': 'mu',
  'ν': 'nu',
  'ξ': 'xi',
  'ο': 'omicron',
  'ρ': 'rho',
  'σ': 'sigma',
  'τ': 'tau',
  'υ': 'upsilon',
  'φ': 'phi',
  'χ': 'chi',
  'ψ': 'psi',
  'ω': 'omega',
  '⊕': ''
};

const sanitizeText = (text: string) => {
  return text
    .replace(/[\n\r\x00-\x1F\x7F-\x9F]/g, ' ') // Rimuove caratteri di controllo
    .replace(
      /[≥≤−×÷≠≈±Δ→•○▪▸⚠⚠️δλγϕΩΣπΠ∫∞∈αβεζηθικμνξορστυφχψω⊕\u26A0-\u26FF\uFE00-\uFE0F]/g,
      (match) => (SPECIAL_CHARS_MAP.hasOwnProperty(match) ? SPECIAL_CHARS_MAP[match] : '')
    );
};

export async function generatePdf(questions: QuestionFromPdf[], quizName: string) {
  if (questions.length === 0) {
    throw new Error('Nessuna domanda da convertire in PDF');
  }

  try {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
    const boldItalicFont = await pdfDoc.embedFont(StandardFonts.HelveticaBoldOblique);
    const pageWidth = 595;
    const pageHeight = 842;
    const margin = 50; // Margine aumentato per migliore leggibilità
    const bottomMargin = 40; // Margine inferiore aumentato
    let page = pdfDoc.addPage([pageWidth, pageHeight]);
    let y = pageHeight - margin; // Inizio dalla parte alta
    let currentPage = 1;

    const splitLines = (text: string, maxWidth: number = pageWidth - 2 * margin) => {
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

    const addText = (
      text: string,
      x: number,
      y: number,
      style: 'normal' | 'bold' | 'italic' | 'boldItalic' = 'normal',
      color: [number, number, number] = [0.1, 0.1, 0.1], // Colore più leggero per migliore leggibilità
      maxWidth: number = pageWidth - 2 * margin
    ) => {
      const lines = splitLines(text, maxWidth);
      const fontToUse = 
        style === 'bold' ? boldFont :
        style === 'italic' ? italicFont :
        style === 'boldItalic' ? boldItalicFont : font;
      const lineHeight = 18; // Altezza aumentata per migliore leggibilità
      const totalHeight = lines.length * lineHeight;

      lines.forEach((line, index) => {
        page.drawText(line, {
          x,
          y: y - index * lineHeight,
          size: 12,
          font: fontToUse,
          color: rgb(color[0], color[1], color[2]),
        });
      });
      return totalHeight;
    };

    // Ordina le domande per lezione e numero
    const sortedQuestions = questions.sort((a, b) => {
      const lecA = parseInt(a.lecture.split(' ')[1]);
      const lecB = parseInt(b.lecture.split(' ')[1]);
      return lecA - lecB || parseInt(a.questionNumber) - parseInt(b.questionNumber);
    });

    let currentLecture = '';
    const printedLectures = new Set<string>();
    let lectureQuestionCount = 1; // Contatore per numerare le domande per ogni lezione

    for (const question of sortedQuestions) {
      // Se cambio lezione, resetto il contatore delle domande
      if (question.lecture !== currentLecture) {
        currentLecture = question.lecture;
        lectureQuestionCount = 1;
      }

      // Calculate space needed for complete question section (question, options, answer, explanation)
      let spaceNeededForQuestion = 18 + // Space for question text
        36; // Space between questions

      if (question.type === 'multiple-choice') {
        spaceNeededForQuestion += 
          question.options.length * 18 + // Space for options
          18 + // Space for correct answer
          (question.explanation ? 
            Math.ceil(question.explanation.length / 100) * 18 : 0); // Space for explanation (estimate 100 chars per line)
      } else if (question.type === 'open') {
        spaceNeededForQuestion += 54; // Space for open answer
      }

      // Add space for lecture title if new lecture
      if (question.lecture !== currentLecture) {
        spaceNeededForQuestion += 36 + 18 + 36;
      }

      // If not enough space for complete section, start new page
      if (y - spaceNeededForQuestion < margin + bottomMargin) {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        y = pageHeight - margin;
        currentPage++;
      }

      // Se è una nuova lezione, stampa il titolo della lezione
      if (!printedLectures.has(currentLecture)) {
        // Ad esempio, stampa "Lezione 001"
        const lessonText = `Lezione ${currentLecture.split(" ")[1]}`;
        y -= addText(lessonText, margin, y, 'bold', [0.2, 0.4, 0.8]) + 24;
        printedLectures.add(currentLecture);
      }

      // Unisce il prefisso e il testo della domanda in una sola stringa
      const fullQuestionText = `${question.type === "multiple-choice" ? `Domanda multipla ${lectureQuestionCount}:` : `Domanda aperta ${lectureQuestionCount}:`} ${question.question.replace(/^\d+\.?\s*/, '').trim()}`;
      y -= addText(fullQuestionText, margin, y, 'bold', [0, 0.2, 0.5]) + 16; // Colore blu per le domande

      // Aggiunta delle opzioni (per domande a scelta multipla)
      if (question.type === 'multiple-choice') {
        question.options.forEach((option, i) => {
          const optText = `${String.fromCharCode(65 + i)}) ${option}`;
          y -= addText(optText, margin + 20, y, 'normal', [0.3, 0.3, 0.3]);
        });
        y -= 18;

        // Visualizzazione della risposta corretta
        if (question.correctAnswer && question.correctAnswer !== 'Errore: Risposta non determinabile') {
          let answerDisplay;
          if (question.answerLetter) {
            answerDisplay = question.answerLetter;
          } else {
            answerDisplay = question.correctAnswer;
          }
          y -= addText(`Risposta corretta: ${answerDisplay}`, margin, y, 'bold', [0, 0.6, 0.2]) + 16; // Verde più vivace per le risposte
          if (!question.answerLetter) {
            y -= addText(`Risposta corretta: ${question.correctAnswer}`, margin, y, 'bold') + 18;
          }
          // Aggiunta della spiegazione, se presente
          if (question.explanation && !question.explanation.startsWith(question.correctAnswer)) {
            y -= addText(`Spiegazione: ${question.explanation}`, margin, y, 'italic', [0.4, 0.4, 0.4]) + 14;
          }
        } else {
          y -= addText('⚠️ Risposta non disponibile', margin, y, 'bold', [0.8, 0.2, 0.2]) + 14;
        }
      } else if (question.type === 'open') {
        // Per domande aperte
        if (question.openAnswer) {
          y -= addText(`Risposta: ${question.openAnswer}`, margin, y, 'normal', [0, 0, 0.6]) + 14 + 24;
        } else {
          y -= addText('⚠️ Risposta aperta non disponibile', margin, y, 'bold', [0.8, 0.2, 0.2]) + 14;
          y -= 24;
        }
      }

      // Spaziatura tra domande
      y -= 24;
      lectureQuestionCount++;
    }

    // Aggiungi un margine inferiore extra alla fine del documento
    y -= bottomMargin;

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `domande_${quizName}.pdf`; // Modified download filename
    link.click();
  } catch (error) {
    console.error('Errore generazione PDF:', error);
    throw error;
  }
}

export default generatePdf;
