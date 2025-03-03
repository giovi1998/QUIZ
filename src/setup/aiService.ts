// File: aiService.ts
import OpenAI from "openai";

// Gestione API Key
const apiKey = process.env.REACT_APP_OPENAI_TOKEN;
if (!apiKey) {
  throw new Error("OpenAI API Key mancante");
}

const openai = new OpenAI({
  apiKey,
  dangerouslyAllowBrowser: true,
  timeout: 30000,
});

export const getAiAnswer = async (
  question: string,
  options: string[],
  model: string = "gpt-3.5-turbo",
  maxTokens: number = 1000
): Promise<{ text: string; letter?: string }> => { // Modificato il return type
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    // Modifica il system message
    { 
      role: "system", 
      content: "Sei un esperto di Computer Vision. Rispondi in italiano tecnico. Per le domande a scelta multipla rispondi con: 1) La lettera corretta preceduta da 'Risposta: ' 2) Una spiegazione dettagliata iniziante con 'Spiegazione: '" 
    },
    {
      role: "user",
      content: `${question}\nOpzioni:\n${options.map((opt, i) => `${String.fromCharCode(65 + i)}) ${opt}`).join('\n')}`
    }
  ];

  try {
    const response = await openai.chat.completions.create({
      model,
      messages,
      max_tokens: maxTokens,
      temperature: 0.2, // Temperatura più bassa per risposte più focalizzate
    });

    const answerText = response.choices[0].message?.content?.trim() || "";
    console.log("Risposta grezza del modello:", answerText);

    // Estrazione lettera con regex migliorata
    const letterMatch = answerText.match(/^Risposta:\s*([A-D])/i) || answerText.match(/([A-D])\)/i);
    const answerLetter = letterMatch?.[1]?.toUpperCase();

    // Estrazione testo completo
    const fullAnswer = options.find(opt => 
      opt.startsWith(answerLetter ? `studiare il mondo 3D, di localizzare e riconoscere` : "")
    );

    return {
      text: fullAnswer || answerText,
      letter: answerLetter
    };
    
  } catch (error: any) {
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


