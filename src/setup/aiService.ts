import OpenAI from "openai";

// Gestione API Key
const apiKey = process.env.REACT_APP_OPENAI_TOKEN;
console.log("API KEY:", JSON.stringify(apiKey));
if (!apiKey) {
  throw new Error("OpenAI API Key mancante");
}

// Configurazione OpenAI
const openai = new OpenAI({
  apiKey,
  dangerouslyAllowBrowser: true,
});

// Funzione per gestire le risposte
export const getAiAnswer = async (
  question: string,
  options: string[],
  model: string = "gpt-3.5-turbo",
  maxTokens: number = 100
): Promise<string> => {
  let messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: "You are a helpful assistant." },
  ];

  // Ottimizzazione prompt
  if (options.length > 0) {
    messages.push({
      role: "user",
      content: `Seleziona solo la lettera dell'opzione corretta.
Domanda: ${question}
Opzioni:
${options.map((opt, i) => `${String.fromCharCode(65 + i)}) ${opt}`).join('\n')}
Risposta: `,
    });
  } else {
    messages.push({
      role: "user",
      content: `Rispondi brevemente alla domanda in 5 righe massimo:
Domanda: ${question}
Risposta: `,
    });
  }

  try {
    const response = await openai.chat.completions.create({
      model,
      messages,
      max_tokens: maxTokens,
      temperature: 0.7,
      top_p: 0.9,
      n: 1,
      stop: options.length > 0 ? ["\n"] : ["\n\n\n\n\n"],
    });

    // Controllo esplicito su choices
    if (!response.choices || response.choices.length === 0) {
      throw new Error("Nessuna risposta generata dall'API");
    }

    const answerText = response.choices[0].message?.content?.trim() || "";

    // Gestione risposte
    if (options.length > 0 && answerText) {
      const answerLetter = answerText[0].toUpperCase();
      const index = answerLetter.charCodeAt(0) - 'A'.charCodeAt(0);
      return index >= 0 && index < options.length 
        ? options[index] 
        : answerText;
    } else {
      return answerText.split('\n').slice(0, 5).join('\n');
    }

  } catch (error: any) {
    // Gestione errori con tipaggi corretti
    if (
      error?.response?.status === 429 ||
      error?.code === 'rate_limit_reached' ||
      error?.code === 'TooManyRequests'
    ) {
      console.log("Limite raggiunto, attesa 2 secondi...");
      await new Promise(r => setTimeout(r, 2000));
      return getAiAnswer(question, options, model, maxTokens);
    } else if (error?.response?.status === 401) {
      throw new Error("API Key OpenAI non valida");
    }
    throw new Error(`Errore AI: ${error?.message}`);
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


