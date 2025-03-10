// aiService.ts
/**
 * Servizi per l'interazione con l'intelligenza artificiale.
 * Questo file contiene le funzioni per valutare le risposte degli utenti e per ottenere risposte generate dall'IA.
 *
 * Usage:
 * Questo file è utilizzato in QuizManager per valutare le risposte aperte degli utenti e per ottenere risposte generate dall'IA.
 */
import axios from 'axios';
// Environment variable for the backend URL
const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

export const evaluateAnswer = async (
  question: string,
  userAnswer: string,
  correctAnswer: string
): Promise<number> => {
  if (!userAnswer || userAnswer.trim() === '') {
    console.log("Empty answer, returning score 0");
    return 0;
  }
  
  try {
    console.log("Sending evaluation request for:", { 
      question,
      userAnswer: userAnswer.trim(),
      correctAnswer: correctAnswer.trim()
    });
    
    const response = await axios.post(`${backendUrl}/api/evaluate`, {
      userAnswer: userAnswer.trim(),
      correctAnswer: correctAnswer.trim(),
      question: question.trim(),
    });

    console.log("Received evaluation response:", response.data);
    
    const data = response.data;
    const score = parseFloat(data.score);

    if (isNaN(score) || score < 0 || score > 3) {
      console.error("Invalid score returned from AI:", score);
      // Default to 1 if there's an answer but score is invalid
      return userAnswer.trim() ? 1 : 0;
    }
    
    return Math.round(score); // Round to nearest integer
  } catch (error: any) {
    console.error("Error in evaluateAnswer:", error);
    
    if (error.response) {
      console.error("Server Response:", error.response.data);
      console.error("Server Status:", error.response.status);
      console.error("Server Headers:", error.response.headers);
    } else if (error.request) {
      console.error("Request made but no response received:", error.request);
    } else {
      console.error("Error setting up request:", error.message);
    }
    
    // Default to 1 if there's an answer but evaluation failed
    return userAnswer.trim() ? 1 : 0;
  }
};

export const getAiAnswer = async (
  question: string,
  options: string[],
  model: string = "gpt-4",
  maxTokens: number = 1000
): Promise<{ text: string; letter?: string }> => {
  try {
    const response = await axios.post(`${backendUrl}/api/generate`, {
      prompt: question,
      options: options,
      model: model,
      maxTokens: maxTokens,
    });
    
    const answer = response.data;
    if (!answer || !answer.message) {
      throw new Error('Invalid response format');
    }
    
    const answerText = answer.message.content?.trim() || "";
    console.log("Raw response from the model:", answerText);

    // Extract letter with improved regex
    const letterMatch = answerText.match(/^Risposta:\s*([A-D])/i) || answerText.match(/([A-D])\)/i);
    const answerLetter = letterMatch?.[1]?.toUpperCase();

    // Extract full text
    const fullAnswer = options.find(opt =>
      opt.startsWith(answerLetter ? answerText : "")
    );

    return {
      text: fullAnswer || answerText,
      letter: answerLetter
    };
  } catch (error: any) {
    // Improved error handling
    if (error.message.includes("rate limit")) {
      await new Promise(r => setTimeout(r, 2000));
      return getAiAnswer(question, options, model, maxTokens);
    }
    throw new Error(`AI Error: ${error.message}`);
  }
};



// import { HfInference } from '@huggingface/inference';

// // Gestione API Key con validazione
// const apiKey = process.env.REACT_APP_HUGGINGFACE_TOKEN;
// if (!apiKey) {
//   throw new Error("Hugging Face API Key mancante");
// }
// const hf = new HfInference(apiKey);

// export const getAiAnswer = async (
//   question: string,
//   options: string[],
//   model: string = 'distilgpt2',   //model: string = 'google/flan-t5-small', // Miglior modello per accuratezza
//   maxTokens: number = 100 // Token maggiori per risposte aperte
// ): Promise<string> => {
//   let prompt;
  
//   // Detect tipo di domanda
//   if (options.length > 0) { // Domanda a scelta multipla
//     prompt = `Rispondi alla domanda selezionando solo la lettera corretta tra le opzioni fornite.
//     Domanda: ${question}
//     Opzioni:
//     ${options.map((opt, i) => `${String.fromCharCode(65 + i)}) ${opt}`).join('\n')}
//     Risposta: `;
//   } else { // Domanda aperta
//     prompt = `Rispondi brevemente alla domanda in 5 righe massimo:
//     Domanda: ${question}
//     Risposta: `;
//   }
//   try {
//     const response = await hf.textGeneration({
//       model,
//       inputs: prompt,
//       parameters: {
//         max_new_tokens: maxTokens,
//         temperature: 0.7, // Per variabilità nelle risposte
//         top_p: 0.9 // Per migliorare la coerenza
//       }
//     });

//     const answerText = response.generated_text.trim();
// // In aiService.ts
//     // Estrai la risposta a seconda del tipo
//     if (options.length > 0) { // Scelta multipla
//       const answerLetter = answerText[0].toUpperCase(); // Prendi solo la prima lettera
//       const index = answerLetter.charCodeAt(0) - 'A'.charCodeAt(0);
//       return index >= 0 && index < options.length ? options[index] : answerText;
//     } else { // Aperta
//       return answerText.split('\n').slice(0, 5).join('\n'); // Limita a 5 righe
//     }} catch (error) {
//     if (error instanceof Error) {
//       if (error.message.includes('Rate limit')) {
//         await new Promise(r => setTimeout(r, 2000)); // Attesa prima di riprovare
//         return getAiAnswer(question, options, model, maxTokens);
//       }
//       throw new Error(`Errore AI: ${error.message}`);
//     } else {
//         const errorMessage = 'Errore sconosciuto';
//         throw new Error(`Errore AI: ${errorMessage}`);
//     }
//   }
// };


