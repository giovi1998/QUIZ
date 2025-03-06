// server.js (api_proxy)
const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors'); // Importa la libreria cors

// Carica le variabili d'ambiente dal file .env
dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
// Abilita CORS per tutte le origini (per sviluppo)
app.use(cors()); // Abilita cors

const port = process.env.PORT || 3001; // Puoi cambiare la porta se necessario

// Middleware per fare il parsing del body delle richieste in JSON
app.use(express.json());

// API key ottenuta dalle variabili d'ambiente
const apiKey = process.env.OPENAI_API_KEY;

// Base URL dell'API esterna (da modificare con quella corretta)
const externalApiBaseUrl = 'https://api.openai.com/v1'; // URL di OpenAI

// Route di esempio: questa è la rotta che il frontend chiamerà
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, options } = req.body;
    // Costruisci l'URL per l'API esterna
    const externalApiUrl = `${externalApiBaseUrl}/chat/completions`; // Endpoint per le completions di chat

    // Aggiungi l'API key all'header della richiesta
    const headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    };
    const messages = [
      { role: "system", content: `Sei un esperto di Computer Vision. Rispondi in italiano tecnico. Per le domande a scelta multipla rispondi con: 1) La lettera corretta preceduta da 'Risposta: ' 2) Una spiegazione dettagliata non superiore alle cinque righe e iniziante con 'Spiegazione: ' ` },
      { role: "user", content: `${prompt}\nOpzioni:\n${options.map((opt, i) => `${String.fromCharCode(65 + i)}) ${opt}`).join('\n')}` }
    ]
    // Dati per la chiamata a OpenAI
    const data = {
      model: "gpt-4",
      messages: messages,
      max_tokens: 1000,
      temperature: 0.3,
    };

    // Esegui la richiesta all'API esterna usando axios
    const response = await axios.post(externalApiUrl, data, { headers });
    // Invia la risposta dell'API esterna al client
    // Modifica nella restituzione della risposta
    res.json(response.data.choices[0]);
  } catch (error) {
    // Gestisci gli errori
    console.error('Errore nella chiamata all\'API esterna:', error);
    res.status(500).json({ error: 'Errore nella richiesta all\'API esterna' });
  }
});

// Avvia il server
app.listen(port, () => {
  console.log(`Server proxy in ascolto sulla porta ${port}`);
});
