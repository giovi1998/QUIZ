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
    const pageWidth = 595;
    const pageHeight = 842;
    const margin = 50; // Margine per lato e in alto
    const bottomMargin = 50; // Margine extra in fondo al documento
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
      bold = false,
      maxWidth: number = pageWidth - 2 * margin
    ) => {
      const lines = splitLines(text, maxWidth);
      const fontToUse = bold ? boldFont : font;
      const lineHeight = 18; // Altezza di ogni linea
      const totalHeight = lines.length * lineHeight;

      lines.forEach((line, index) => {
        page.drawText(line, {
          x,
          y: y - index * lineHeight,
          size: 12,
          font: fontToUse,
          color: rgb(0, 0, 0),
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

      const spaceNeededForQuestion =
        18 + // Spazio per il testo della domanda (prefisso + domanda)
        (question.type === 'multiple-choice'
          ? question.options.length * 18 + 18 + (question.explanation ? 18 : 0)
          : 0) + // Spazio per opzioni, risposta ed eventuale spiegazione
        (question.type === 'open' ? 18 + 54 : 0) + // Spazio per domande aperte
        36 + // Spazio tra le domande
        (question.lecture !== currentLecture ? 36 + 18 + 36 : 0); // Spazio per il titolo della lezione, se necessario

      // Modifica: verifica se c'è spazio sufficiente sulla pagina considerando anche il bottomMargin
      if (y - spaceNeededForQuestion < margin + bottomMargin) {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        y = pageHeight - margin; // Nuova pagina: inizia dall'alto
        currentPage++;
      }

      // Se è una nuova lezione, stampa il titolo della lezione
      if (!printedLectures.has(currentLecture)) {
        // Ad esempio, stampa "Lezione 001"
        const lessonText = `Lezione ${currentLecture.split(" ")[1]}`;
        y -= addText(lessonText, margin, y, true) + 36;
        printedLectures.add(currentLecture);
      }

      // Unisce il prefisso e il testo della domanda in una sola stringa
      const fullQuestionText = `${question.type === "multiple-choice" ? `Domanda multipla ${lectureQuestionCount}:` : `Domanda aperta ${lectureQuestionCount}:`} ${question.question.replace(/^\d+\.?\s*/, '').trim()}`;
      y -= addText(fullQuestionText, margin, y, true) + 18;

      // Aggiunta delle opzioni (per domande a scelta multipla)
      if (question.type === 'multiple-choice') {
        question.options.forEach((option, i) => {
          const optText = `${String.fromCharCode(65 + i)}) ${option}`;
          y -= addText(optText, margin + 20, y);
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
          y -= addText(`Risposta corretta: ${answerDisplay}`, margin, y, true) + 18;
          if (!question.answerLetter) {
            y -= addText(`Risposta corretta: ${question.correctAnswer}`, margin, y, true) + 18;
          }
          // Aggiunta della spiegazione, se presente
          if (question.explanation && !question.explanation.startsWith(question.correctAnswer)) {
            y -= addText(`Spiegazione: ${question.explanation}`, margin, y) + 18;
          }
        } else {
          y -= addText('⚠️ Risposta non disponibile', margin, y, true) + 18;
        }
      } else if (question.type === 'open') {
        // Per domande aperte
        if (question.openAnswer) {
          y -= addText(`Risposta: ${question.openAnswer}`, margin, y) + 18 + 36;
        } else {
          y -= addText('⚠️ Risposta aperta non disponibile', margin, y, true) + 18;
          y -= 36;
        }
      }

      // Spaziatura tra domande
      y -= 36;
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
