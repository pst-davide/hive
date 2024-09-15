import { Request, Response } from 'express';
import {analyzeText, getChatResponse} from '../utils/openai';

export const analyzeTextController = async (req: Request, res: Response) => {
  try {
    const { text, keywords } = req.body;

    if (!text || !keywords) {
      return res.status(400).json({ error: 'Testo e parole chiave sono obbligatori.' });
    }

    // Chiama la funzione per analizzare il testo
    const result = await analyzeText(text, keywords);

    // Ritorna il risultato al client
    return res.status(200).json({ analysis: result });
  } catch (error) {
    console.error('Errore durante l\'analisi del testo:', error);
    return res.status(500).json({ error: 'Errore durante l\'analisi del testo' });
  }
};

export const chatController = async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt non fornito.' });
    }

    const response = await getChatResponse(prompt);
    return res.status(200).json({ message: response });
  } catch (error) {
    return res.status(500).json({ error: 'Errore durante la chiamata API' });
  }
}
