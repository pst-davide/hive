

import {Request, Response} from 'express';
import {Subscriber} from '../models/subscribe.model';



export class NewsletterSubscriberController {


  static async findAll(req: Request, res: Response): Promise<void> {
    try {
      const {channelId} = req.query;

      let docs;
      if (channelId) {
        const channelIdNumber: number = parseInt(channelId as string, 10);
        if (isNaN(channelIdNumber)) {
          res.status(400).json({error: 'channelId deve essere un numero valido'});
          return;
        }

        docs = await NewsletterSubscriberController.docsRepository.find({
          where: {channelId: channelIdNumber},
          relations: ['channel'],
        });
      } else {
        docs = await NewsletterSubscriberController.docsRepository.find({
          relations: ['channel'],
        });
      }

      res.status(200).json(docs);
    } catch (error) {
      res.status(500).json({error: 'Errore durante il recupero dei documenti'});
    }
  }

  static async findById(req: Request, res: Response): Promise<void> {
    const id: number = parseInt(req.params['id'], 10);
    if (isNaN(id)) {
      res.status(400).json({ error: 'ID non valido' });
      return;
    }

    try {
      const doc: Subscriber | null = await Subscriber.findByPk(id);
      if (doc) {
        res.status(200).json(doc);
      } else {
        res.status(404).json({ error: 'Documento non trovato' });
      }
    } catch (error) {
      console.error('Errore durante il recupero del documento:', error);
      res.status(500).json({ error: 'Errore durante il recupero del documento' });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const doc: Subscriber = await Subscriber.create(req.body);
      res.status(201).json(doc);
    } catch (error) {
      console.error('Errore durante la creazione del documento:', error);
      res.status(500).json({ error: 'Errore durante la creazione del documento' });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    const id: number = parseInt(req.params['id'], 10);
    if (isNaN(id)) {
      res.status(400).json({ error: 'ID non valido' });
      return;
    }

    try {
      const doc: Subscriber | null  = await Subscriber.findByPk(id);
      if (doc) {
        await doc.update(req.body);
        res.status(200).json(doc);
      } else {
        res.status(404).json({ error: 'Documento non trovato' });
      }
    } catch (error) {
      console.error('Errore durante l\'aggiornamento del documento:', error);
      res.status(500).json({ error: 'Errore durante l\'aggiornamento del documento' });
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    const id: number = parseInt(req.params['id'], 10);
    if (isNaN(id)) {
      res.status(400).json({ error: 'ID non valido' });
      return;
    }

    try {
      const result: number = await Subscriber.destroy({ where: { id } });
      if (result) {
        res.status(200).json({ message: 'Documento eliminato con successo' });
      } else {
        res.status(404).json({ error: 'Documento non trovato' });
      }
    } catch (error) {
      console.error('Errore durante l\'eliminazione del documento:', error);
      res.status(500).json({ error: 'Errore durante l\'eliminazione del documento' });
    }
  }

}
