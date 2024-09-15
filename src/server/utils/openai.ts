import * as dotenv from 'dotenv';
dotenv.config();
import OpenAI from 'openai';
import axios, {Axios, AxiosResponse} from 'axios';

const {OPENAI_API_KEY = ''} = process.env;

// Inizializzazione con configurazione
const openai: OpenAI = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

const OPENAI_API_URL: string = 'https://api.openai.com/v1/chat/completions';

export async function analyzeText(text: string, keywords: string[]): Promise<string> {
  const prompt = `
    Analizza il seguente testo:
    "${text}"

    Cerca i seguenti argomenti chiave: ${keywords.join(", ")}.
    Riconosci anche i sinonimi di questi argomenti e indica se il testo è positivo, negativo o neutro rispetto a ciascuno di essi.

    Dopo l'analisi, fornisci un breve riassunto (massimo 3 frasi) del testo.
  `;

  try {
    const response: AxiosResponse<any, any> = await axios.post(OPENAI_API_URL, {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Sei un assistente NLP esperto nell\'analisi del testo e sentiment.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 600,
    }, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Errore durante l\'analisi del testo:', error);
    throw error;
  }
}

export async function getChatResponse(userPrompt: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: 'Sei un assistente virtuale per aiutare gli utenti con le applicazioni interne all\'intranet aziendale.' }],
      max_tokens: 500,
    }, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return response.choices[0].message.content?.trim() || '';
  } catch (error) {
    console.error('Errore nell\'ottenere la risposta dall\'API OpenAI:', error);
    throw new Error("Errore durante la chiamata API OpenAI");
  }
}
