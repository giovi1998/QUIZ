// testAI.ts
import { getAiAnswer } from './src/setup/aiService.ts';
import fs from 'fs';

const runTest = async () => {
  const rawData = fs.readFileSync('C:\\Users\\Giovanni\\Desktop\\QUIZ\\src\\setup\\provaFile.json', 'utf-8');
  const testData = JSON.parse(rawData);

  for (const testCase of testData.test) {
    try {
      const answer = await getAiAnswer(testCase.domanda, testCase.opzioni);
      console.log(`Domanda: ${testCase.domanda}`);
      console.log(`Opzioni: ${testCase.opzioni.join(', ')}`);
      console.log(`Risposta AI: ${answer}\n`);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
        console.error(`Errore: ${(error as Error).message}`);
      
    }
  }
};

runTest();
