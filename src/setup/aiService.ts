import { HfInference } from '@huggingface/inference';

// Gestione API Key con validazione
const apiKey = process.env.REACT_APP_HUGGINGFACE_TOKEN;
if (!apiKey) {
  throw new Error("Hugging Face API Key mancante");
}
const hf = new HfInference(apiKey);

export const getAiAnswer = async (
  question: string,
  options: string[],
  //model: string = 'google/flan-t5-small', // Miglior modello per accuratezza
  model: string = 'dit2stilgp', // <--- MODELLO GRATUITO
  maxTokens: number = 20
): Promise<string> => {
  const prompt = `Domanda: ${question}\nOpzioni:\n${options.map((opt, i) => `${String.fromCharCode(65 + i)}) ${opt}`).join('\n')}\nRispondi SOLO con la lettera (es: A):`;

  try {
    const response = await hf.textGeneration({
      model,
      inputs: prompt,
      parameters: {
        max_new_tokens: maxTokens,
        temperature: 0.7, // Per variabilità nelle risposte
        top_p: 0.9 // Per migliorare la coerenza
      }
    });

    const answerText = response.generated_text.trim();
// In aiService.ts
    const letterMatch = answerText.match(/^[A-Z)]/); // Accetta solo la lettera (es: "D")
    if (!letterMatch) {
      throw new Error(`Risposta non formattata correttamente: ${answerText}`);
    }

    const answerLetter = letterMatch[0][0];
    const index = answerLetter.charCodeAt(0) - 'A'.charCodeAt(0);
    
    if (index >= 0 && index < options.length) {      
      return options[index];
    } 
    throw new Error(`Opzione non valida: ${answerLetter}`);
    
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Rate limit')) {
        await new Promise(r => setTimeout(r, 2000)); // Attesa prima di riprovare
        return getAiAnswer(question, options, model, maxTokens);
      }
      throw new Error(`Errore AI: ${error.message}`);
    } else {
        const errorMessage = 'Errore sconosciuto';
        throw new Error(`Errore AI: ${errorMessage}`);
    }
  }
};


