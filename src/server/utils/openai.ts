import * as dotenv from 'dotenv';
dotenv.config();
import OpenAI from 'openai';
import axios, {Axios, AxiosResponse} from 'axios';

interface Keyword {
  word: string;
  category: string;
  importance: 'high' | 'medium' | 'low';
}

const {OPENAI_API_KEY = ''} = process.env;

// Inizializzazione con configurazione
const openai: OpenAI = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

const OPENAI_API_URL: string = 'https://api.openai.com/v1/chat/completions';

export async function analyzeText(text: string, keywords: Keyword[]): Promise<string> {
  const keywordList: string = keywords.map((k: Keyword) => `${k.word} (Categoria: ${k.category}, Importanza: ${k.importance})`).join(', ');
  const prompt: string = `
    Analizza il seguente testo:
    "${text}"

    Cerca i seguenti argomenti chiave, la loro categoria tematica e la loro importanza: ${keywordList}.
    Riconosci anche i sinonimi di questi argomenti, indica se il testo è "molto positivo", "positivo", "neutro",
    "negativo" o "molto negativo" rispetto a ciascuno di essi e indica se il testo esprime emozioni specifiche
    (come felicità, tristezza, rabbia)

    Dopo l'analisi, fornisci un breve riassunto (massimo 3 frasi) del testo.

    Fornisci anche una serie di tag per catalogare l'articolo, differenziando i tag che hai trovato attinenti alle keywords
    da quelli che suggerisci tu per catalogare l'articolo in base al contenuto generale. Indica chiaramente quali sono
    i tag basati sulle keywords e quali sono quelli suggeriti.
  `;

  try {
    const response: AxiosResponse<any, any> = await axios.post(OPENAI_API_URL, {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Sei un assistente NLP esperto nell\'analisi del testo e sentiment.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 800,
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
