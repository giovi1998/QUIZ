// generatePdf.ts
import { PDFDocument, rgb, StandardFonts, PDFFont } from 'pdf-lib';
import { QuestionFromPdf } from './pdfExtractor';

export async function generatePdf(questions: QuestionFromPdf[]) {
    try {
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage();
        const font: PDFFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
        const boldFont: PDFFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

        const fontSize = 12;
        const lineHeight = 20;
        const margin = 50;
        const maxLineWidth = page.getWidth() - 2 * margin; // Calcola la larghezza massima disponibile per il testo

        let y = page.getHeight() - margin;
        const x = margin;
        let currentLecture: string | null = null;

        const drawWrappedText = (text: string, x: number, y: number, options: any) => {
            const { font, size, color, maxWidth, bold } = options;
            const currentFont = bold ? boldFont : font;
            const words = text.split(' ');
            let line = '';
            let currentY = y;

            for (const word of words) {
                const testLine = line + word + ' ';
                const testWidth = currentFont.widthOfTextAtSize(testLine, size);

                if (testWidth > maxWidth) {
                    page.drawText(line, { x, y: currentY, font: currentFont, size, color });
                    line = word + ' ';
                    currentY -= lineHeight;
                } else {
                    line = testLine;
                }
            }

            page.drawText(line, { x, y: currentY, font: currentFont, size, color });
            return currentY;
        };

        for (let i = 0; i < questions.length; i++) {
            const question = questions[i];

            // Gestione della lezione
            if (currentLecture !== question.lecture) {
                currentLecture = question.lecture ? question.lecture : "";
                y -= lineHeight;
                y = drawWrappedText(currentLecture, x, y, { font, size: fontSize + 2, color: rgb(0, 0, 0), maxWidth: maxLineWidth, bold: true });
                y -= lineHeight;
            }

            // Tipo di domanda
            y = drawWrappedText(`${question.question}`, x, y, { font, size: fontSize, color: rgb(0, 0, 0), maxWidth: maxLineWidth, bold: true });
            y -= lineHeight;

            const options = question.options;
            for (let j = 0; j < options.length; j++) {
                const option = options[j];
                const letter = String.fromCharCode(65 + j); // A, B, C, D...
                y = drawWrappedText(`${letter}) ${option}`, x + 20, y, { font, size: fontSize, color: rgb(0, 0, 0), maxWidth: maxLineWidth - 20, bold: false });
                y -= lineHeight;
            }

            y -= lineHeight;

            // Controllo per aggiungere una nuova pagina se necessario
            if (y < margin) {
                const newPage = pdfDoc.addPage();
                y = newPage.getHeight() - margin;
            }
        }

        // Correct the creation of the pdf
        const pdfBytes = await pdfDoc.save();

        // Check if there are any pages in the document
        if (pdfDoc.getPages().length > 0) {
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'domande_estratte.pdf';
            link.click();
        } else {
            console.warn("Nessuna domanda da salvare nel PDF.");
        }
    } catch (error) {
        console.error("Errore durante la generazione del PDF:", error);
    }
}