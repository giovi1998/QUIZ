import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { QuestionFromPdf } from './pdfExtractor';

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

  const addText = (text: string, x: number, y: number, bold = false) => {
    const currentFont = bold ? boldFont : font;
    const lines = text.split('\n');
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

  let currentLecture = '';
  for (const question of questions) {
    if (y < margin + 100) {
      page = pdfDoc.addPage([595, 842]);
      y = 800;
    }
    if (question.lecture !== currentLecture) {
      currentLecture = question.lecture;
      y -= addText(currentLecture, margin, y, true) + lineHeight;
      y -= lineHeight;
    }
    y -= addText(question.question, margin, y, true) + lineHeight;
    if (question.type === 'multiple-choice') {
      question.options.forEach((option, i) => {
        y -= addText(`${String.fromCharCode(65 + i)}) ${option}`, margin + 20, y) + lineHeight;
      });
    } else {
      y -= addText("[Spazio per risposta aperta]", margin + 20, y) + lineHeight;
    }
    y -= lineHeight * 2;
  }

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'domande_estratte.pdf';
  link.click();
}
