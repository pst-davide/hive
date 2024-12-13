import * as dotenv from 'dotenv';
dotenv.config();
import OpenAI from 'openai';
import axios, {AxiosResponse} from 'axios';

interface Keyword {
  word: string;
  category: string;
  importance: 'high' | 'medium' | 'low';
}

interface ParsedAnalysis {
  keywords: Array<{
    keyword: string;
    category: string;
    importance: string;
    sentiment: string;
    emotions: string;
  }>;
  summary: string;
  tagsBasedOnKeywords: string[];
  suggestedTags: string[];
  rating: number;
}

const {OPENAI_API_KEY = ''} = process.env;

// Inizializzazione con configurazione
const openai: OpenAI = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

const OPENAI_API_URL: string = 'https://api.openai.com/v1/chat/completions';

export function parseAnalysisResponse(response: string): ParsedAnalysis {
  const keywordRegex: RegExp = /\*\*(.*?)\*\*\n\s+- Categorizzazione: (.*?)\n\s+- Importanza: (.*?)\n\s+- Sentiment: (.*?)\n\s+- Emozioni: (.*?)\n/g;
  const summaryRegex: RegExp = /\*\*Riassunto del Testo:\*\*\n(.*)/;
  const tagsKeywordsRegex: RegExp = /\*\*Tag basati sulle keywords:\*\*\s(.*)/;
  const suggestedTagsRegex: RegExp = /\*\*Tag suggeriti:\*\*\s(.*)/;
  const ratingRegex: RegExp = /\*\*Valutazione dell'Articolo:\*\*\s(\d+)/;

  // Estrarre le keywords
  const keywords: Array<{
    keyword: string;
    category: string;
    importance: string;
    sentiment: string;
    emotions: string;
  }> = [];
  let match;
  while ((match = keywordRegex.exec(response)) !== null) {
    keywords.push({
      keyword: match[1],
      category: match[2],
      importance: match[3],
      sentiment: match[4],
      emotions: match[5],
    });
  }

  // Estrarre il riassunto
  const summaryMatch: RegExpMatchArray | null = response.match(summaryRegex);
  const summary: string = summaryMatch ? summaryMatch[1] : '';

  // Estrarre i tag basati sulle keywords
  const tagsKeywordsMatch: RegExpMatchArray | null  = response.match(tagsKeywordsRegex);
  const tagsBasedOnKeywords: string[] = tagsKeywordsMatch ? tagsKeywordsMatch[1].split(',').map(tag => tag.trim()) : [];

  // Estrarre i tag suggeriti
  const suggestedTagsMatch: RegExpMatchArray | null = response.match(suggestedTagsRegex);
  const suggestedTags: string[] = suggestedTagsMatch ? suggestedTagsMatch[1].split(',').map(tag => tag.trim()) : [];

  // Estrarre la valutazione
  const ratingMatch: RegExpMatchArray | null = response.match(ratingRegex);
  const rating: number = ratingMatch ? parseInt(ratingMatch[1], 10) : 0;

  return {
    keywords,
    summary,
    tagsBasedOnKeywords,
    suggestedTags,
    rating,
  };
}

export async function analyzeText(text: string, keywords: Keyword[]): Promise<string> {
  const keywordList: string = keywords.map((k: Keyword) => `${k.word} (Categoria: ${k.category}, Importanza: ${k.importance})`).join(', ');
  const prompt: string = `
    Analizza il seguente testo:
    "${text}"

    Cerca i seguenti argomenti chiave, inclusi sinonimi, la loro categoria tematica e la loro importanza: ${keywordList}.
    Rispondi solo per le keywords (o loro sinonimi) che trovi nel testo, anche se presenti come riferimenti impliciti.
    Non commentare e non inserire nella risposta quelle che non sono presenti.

    Indica i risultati nel seguente formato:

    **Keywords e Analisi:**

    1. **<keyword trovata>**
       - Categorizzazione: <categoria>
       - Importanza: <importanza>
       - Sentiment: <sentiment>
       - Emozioni: <emozioni o "nessuna emozione specifica">

    **Riassunto del Testo:**
    <riassunto breve>

    **Tag:**
    - **Tag basati sulle keywords:** <elenco tag>
    - **Tag suggeriti:** <elenco tag>

    **Valutazione dell'Articolo:** <punteggio da 1 a 10>

    Segui questa struttura **esatta**, evitando qualsiasi commento o menzione di keywords non trovate.
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

    const parsed = parseAnalysisResponse(response.data.choices[0].message.content.trim());
    console.log(parsed);

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
