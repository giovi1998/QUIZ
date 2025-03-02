import * as pdfjsLib from 'pdfjs-dist';
import { TextItem } from 'pdfjs-dist/types/src/display/api';
import { getAiAnswer } from './aiService'; // Assicurati che il path sia corretto

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

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
};

// Funzione per estrarre la lettera dell'opzione dalla risposta dell'IA
function extractOptionLetter(answer: string): string | undefined {
  // Estrazione migliorata della lettera dell'opzione
  const match = answer.match(/^[A-D]\)/i); // Cerca una lettera da A a D all'inizio con parentesi
  if (match) {
    return match[0].toUpperCase().replace(')', ''); // Restituisce la lettera
  }
  const matchNoParenthesis = answer.match(/^[A-D]/i); // Cerca una lettera da A a D all'inizio senza parentesi
  if (matchNoParenthesis) {
    return matchNoParenthesis[0].toUpperCase();
  }
  return undefined;
}

export interface QuestionFromPdf {
  question: string;
  options: string[];
  lecture: string;
  type: 'multiple-choice' | 'open';
  correctAnswer?: string;
  explanation?: string;
  openAnswer?: string; // Aggiunta proprietà per risposta aperta
  questionNumber: string;
}

export async function extractFromPdf(file: File): Promise<QuestionFromPdf[]> {
  if (file.type !== 'application/pdf') {
    console.error('🚨 File non supportato: solo PDF ammessi');
    throw new Error('Il file non è un PDF valido');
  }

  try {
    console.log('🚀 Inizio estrazione del PDF...');
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      verbosity: 0
    }).promise;

    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map(item => (item as TextItem).str)
        .join('\n');
      fullText += pageText + '\n\n';
      console.log(`✅ Pagina ${i} processata con successo`);
    }

    console.log('🚀 Testo completo del PDF raccolto');
    return await processPdfText(fullText); // Ora la funzione è asincrona
  } catch (error) {
    console.error('🚨 Errore critico durante l estrazione:', error);
    throw new Error(`Estrazione fallita: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
  }
}

async function processPdfText(text: string): Promise<QuestionFromPdf[]> {
  const cleanedText = text
    .replace(/[≥≤−×÷≠≈±Δ\u0394\u2212\u2264\u2265–—]/g, (match) => SPECIAL_CHARS_MAP[match] || match)
    .replace(/(\r\n|\n|\r)/gm, '\n')
    .replace(/(\n\s*){2,}/g, '\n');

  console.log('📄 Testo estratto pulito:', cleanedText);

  const questions: QuestionFromPdf[] = [];
  const lectureMatches = [...cleanedText.matchAll(/Lezione\s+(\d{2,3})/gi)];

  for (const match of lectureMatches) {
    const index = lectureMatches.indexOf(match);
    const lectureStart = match.index!;
    const lectureEnd = index < lectureMatches.length - 1
      ? lectureMatches[index + 1].index!
      : cleanedText.length;

    const lectureContent = cleanedText.slice(lectureStart, lectureEnd);
    const lectureNumber = match[1].padStart(3, '0');
    const lecture = `Lezione ${lectureNumber}`;

    if (!match[1]) {
      console.error('⚠️ Errore: Numero lezione non riconosciuto');
      continue;
    }

    console.log(`🚀 Elaborazione ${lecture}`);
    const questionMatches = [...lectureContent.matchAll(/(\d{2}\.)\s+([\s\S]*?)(?=\n\d{2}\.|\nLezione\s+\d+|$)/g)];
    console.log(`⚠️ ${lecture} contiene ${questionMatches.length} domande`);

    for (const qMatch of questionMatches) {
      const [_, qNumber, qBody] = qMatch;
      const lines = qBody.split('\n').filter(l => l.trim() !== '');

      if (lines.length === 0) continue;

      const questionNumber = qNumber.padStart(2, '0');
      const questionText = lines[0]
        .replace(/^\d{2}\.\s*/, '')
        .trim()
        .replace(/\s+/g, ' ');

      console.log(`▸ Domanda ${questionNumber}: ${questionText}`);
      const isOpenQuestion = /descrivere|spiegare|fornire/i.test(questionText);

      // Filtraggio migliorato per rimuovere header
      const cleanedLines = lines.filter(line =>
        !/Set Domande:|©|Data Stampa|Lezione \d{3}|COMPUTER VISION|INGEGNERIA|Docente:|Randieri Cristian/i.test(line)
      );

      // Estrazione delle opzioni
      const options = !isOpenQuestion
        ? cleanedLines.slice(1)
          .map(line => line
            .replace(/^[•○▪▸]|\s+/g, ' ')
            .trim()
          )
          .filter(line => line.length > 0)
        : [];

      // Limita a 4 opzioni e unisci eventuali opzioni extra
      if (options.length > 4) {
        const firstFourOptions = options.slice(0, 4);
        const mergedExtras = options.slice(4)
          .map(opt => opt.replace(/^[A-D)]+\s*/i, '').trim())
          .join(', ');
        firstFourOptions[3] += ` (${mergedExtras})`;
        options.splice(0);
        options.push(...firstFourOptions);
      }
      console.log("Type of question:", isOpenQuestion ? "Open" : "multiple-choice");

      // Modifica la sezione di elaborazione della domanda
      let correctAnswer, explanation, openAnswer;
      if (!isOpenQuestion) {
        try {
          console.log("Question text for AI:", questionText);
          console.log("Options for AI:", options);
          const aiResponse = await getAiAnswer(questionText, options);
          console.log("AI Response:", aiResponse);

          // Trova la lettera della risposta
          const answerLetter = extractOptionLetter(aiResponse);
          console.log("Answer letter:", answerLetter);
          // Trova l'opzione corrispondente
          if (answerLetter) {
            correctAnswer = options.find(opt => opt.trim().startsWith(answerLetter));
          } else {
            // Se la lettera non è trovata, cerca una corrispondenza testuale
            const bestMatch = options.reduce((best, opt) => {
              const similarity = compareTwoStrings(aiResponse.toLowerCase(), opt.toLowerCase());
              return similarity > best.similarity ? { option: opt, similarity } : best;
            }, { option: '', similarity: 0 });

            if (bestMatch.similarity > 0.5) {
              correctAnswer = bestMatch.option;
            } else if (aiResponse.toLowerCase().includes('nessuna delle precedenti')||aiResponse.toLowerCase().includes('nessuno dei casi precedenti')) {
                correctAnswer = options.find(opt => opt.toLowerCase().includes('nessuna delle precedenti') || opt.toLowerCase().includes('nessuno dei casi precedenti'));
            }
             
          }

          // Estrai la spiegazione se presente nella risposta
          const explanationMatch = aiResponse.match(/Spiegazione:\s*([\s\S]*)/i);
          explanation = explanationMatch ? explanationMatch[1].trim() : aiResponse; //fallback to all answer

          // Gestisci casi non risolti
          if (!correctAnswer) {
            console.error("⚠️ Risposta non trovata per domanda:", questionText);
            correctAnswer = "Errore: Risposta non determinabile";
          }

        } catch (error) {
          console.error(`🚨 Errore getAiAnswer: ${error}`);
          correctAnswer = "Errore: Risposta non determinabile";
          explanation = "Spiegazione non disponibile";
        }
      } else {
        console.log("Question text for AI:", questionText); // Log per domande aperte
        const aiResponse = await getAiAnswer(questionText, options);
        console.log("AI Response:", aiResponse);
        openAnswer = aiResponse; // Salva la risposta aperta
      }

      questions.push({
        question: `${questionNumber}. ${questionText}`,
        options,
        lecture,
        type: isOpenQuestion ? 'open' : 'multiple-choice',
        correctAnswer,
        explanation,
        openAnswer, // Aggiunta della proprietà per risposta aperta
        questionNumber: questionNumber
      });
    }
  }

  console.log(`✅ ${questions.length} domande estratte totali`);
  return questions.sort((a, b) => {
    const lecA = parseInt(a.lecture.split(' ')[1]);
    const lecB = parseInt(b.lecture.split(' ')[1]);
    return lecA - lecB || parseInt(a.questionNumber) - parseInt(b.questionNumber);
  });
}
function compareTwoStrings(string1: string, string2: string) {
  string1 = string1.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  string2 = string2.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

  const length1 = string1.length;
  const length2 = string2.length;

  if (length1 === 0 || length2 === 0) {
    return 0;
  }
  const maxLength = Math.max(length1, length2);

  let distance = 0;
  for (let i = 0; i < Math.min(length1, length2); i++) {
    if (string1[i] === string2[i]) {
      distance++;
    }
  }

  return distance / maxLength;
}
