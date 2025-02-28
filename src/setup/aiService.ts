// File: aiService.ts
import { HfInference } from '@huggingface/inference';
const apiKey = process.env.REACT_APP_HUGGINGFACE_TOKEN //env variable
const hf = new HfInference(apiKey);

export const getAiAnswer = async (question: string, options: string[]): Promise<string> => {
  const prompt = `Rispondi alla domanda selezionando solo la lettera corretta tra le opzioni fornite.
Domanda: ${question}
Opzioni:
${options.map((opt, i) => `${String.fromCharCode(65 + i)}) ${opt}`).join('\n')}
Risposta:`;

  try {
    const response = await hf.textGeneration({
      model: 'google/flan-t5-small',
      inputs: prompt,
      parameters: {
        max_new_tokens: 1
      }
    });

    const answerLetter = response.generated_text.trim().toUpperCase();
    const index = answerLetter.charCodeAt(0) - 'A'.charCodeAt(0);
    
    if (index >= 0 && index < options.length) {
      return options[index];
    }
    throw new Error(`Risposta non valida: ${answerLetter}`);
    
  } catch (error) {
    // Gestione corretta degli errori
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Errore sconosciuto nel servizio AI';

    throw new Error(`Errore nel servizio AI: ${errorMessage}`);
  }
};
