 // File: aiService.ts
 import axios from 'axios';

 // Variabile d'ambiente per l'URL del backend
 const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001'; // URL di default per lo sviluppo

 export const getAiAnswer = async (
   question: string,
   options: string[],
   model: string = "gpt-4",
   maxTokens: number = 1000
 ): Promise<{ text: string; letter?: string }> => {
   try {
     const response = await axios.post(`${backendUrl}/api/generate`, { //utilizzo l'url dinamico
       prompt: question,
       options: options,
       model: model,
       maxTokens: maxTokens,
     });
     const answer = response.data;
     if (!answer || !answer.message) { // Controllo aggiuntivo
       throw new Error('Formato della risposta non valido');
     }
     const answerText = answer.message.content?.trim() || ""; //estraggo la stringa corretta
     console.log("Risposta grezza del modello:", answerText);
 
     // Estrazione lettera con regex migliorata
     const letterMatch = answerText.match(/^Risposta:\s*([A-D])/i) || answerText.match(/([A-D])\)/i);
     const answerLetter = letterMatch?.[1]?.toUpperCase();
 
     // Estrazione testo completo
     const fullAnswer = options.find(opt => 
       opt.startsWith(answerLetter ? answerText : "")
     );
 
     return {
       text: fullAnswer || answerText,
       letter: answerLetter
     };
   } catch (error:any) {
     // Gestione errori migliorata
     if (error.message.includes("rate limit")) {
       await new Promise(r => setTimeout(r, 2000));
       return getAiAnswer(question, options, model, maxTokens);
     }
     throw new Error(`Errore AI: ${error.message}`);
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


