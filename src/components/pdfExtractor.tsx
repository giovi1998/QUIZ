// Aggiungi questo nuovo file in src/utils/pdfExtractor.ts
import * as pdfjsLib from 'pdfjs-dist';

// Inizializzazione della libreria PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// Interfaccia per i pattern di estrazione
interface ExtractionPattern {
  questionPattern: RegExp;
  optionPattern: RegExp;
  correctAnswerPattern: RegExp;
}

// Pattern per riconoscere le domande, opzioni e risposte nel testo
const defaultPattern: ExtractionPattern = {
  questionPattern: /Domanda\s+\d+:?\s+(.*?)(?=\n|$)/gi,
  optionPattern: /[◦•○]\s+(.*?)(?=\n|$)/gi,
  correctAnswerPattern: /Risposta\s+corretta:?\s+(.*?)(?=\n|$)/gi,
};

export async function extractFromPdf(file: File): Promise<any[]> {
  try {
    // Carica il file PDF
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    // Estrai il testo da tutte le pagine
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }
    
    return processExtractedText(fullText, defaultPattern);
  } catch (error) {
    console.error('Errore durante l\'estrazione dal PDF:', error);
    throw new Error(`Errore nell'elaborazione del PDF: ${error}`);
  }
}

function processExtractedText(text: string, pattern: ExtractionPattern): any[] {
  const questions: any[] = [];
  
  // Dividi il testo in blocchi di domande
  const blocks = text.split(/Domanda\s+\d+:/i);
  
  // Salta il primo elemento se è vuoto
  blocks.shift();
  
  blocks.forEach((block, index) => {
    try {
      const questionMatch = block.match(/^(.*?)(?=\n|$)/);
      if (!questionMatch) return;
      
      const question = questionMatch[1].trim();
      
      // Estrai le opzioni
      const optionsMatches = [...block.matchAll(/[◦•○]\s+(.*?)(?=\n|$|\[◦•○])/gi)];
      const options = optionsMatches.map(match => match[1].trim());
      
      // Estrai la risposta corretta
      const correctAnswerMatch = block.match(/Risposta\s+corretta:?\s+(.*?)(?=\n|$)/i);
      if (!correctAnswerMatch) return;
      
      const correctAnswer = correctAnswerMatch[1].trim();
      
      // Crea la spiegazione (usando la risposta come spiegazione base se non c'è altro)
      let explanation = `La risposta corretta è: ${correctAnswer}`;
      const explanationMatch = block.match(/Spiegazione:?\s+(.*?)(?=\n\n|$)/i);
      if (explanationMatch) {
        explanation = explanationMatch[1].trim();
      }
      
      if (question && options.length > 0 && correctAnswer) {
        // Verifica che la risposta corretta sia presente nelle opzioni
        if (!options.includes(correctAnswer)) {
          // Se non è presente, aggiungila alle opzioni
          options.push(correctAnswer);
        }
        
        questions.push({
          question,
          options,
          correctAnswer,
          explanation
        });
      }
    } catch (error) {
      console.error(`Errore nell'elaborazione del blocco ${index}:`, error);
    }
  });
  
  return questions;
}