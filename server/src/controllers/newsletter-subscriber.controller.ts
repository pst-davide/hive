import {Request, Response} from 'express';
import {Subscriber} from '../models/subscribe.model';
import {Channel} from '../models/channel.model';
import logger from '../utils/logger';

export class NewsletterSubscriberController {

  static async findAll(req: Request, res: Response): Promise<void> {
    logger.info('Recupero di tutti gli iscritti');

    try {
      const { channelId } = req.query;
      const whereClause: any = {};

      if (channelId) {
        const channelIdNumber: number = parseInt(channelId as string, 10);

        if (isNaN(channelIdNumber)) {
          res.status(400).json({ error: 'channelId deve essere un numero valido' });
          return;
        }

        whereClause.channelId = channelIdNumber;
      }

      const docs: Subscriber[] = await Subscriber.findAll({
        where: whereClause,
        include: [{ model: Channel, as: 'channel' }],
      });

      res.status(200).json(docs);
    } catch (error: any) {
      logger.error('Errore durante il recupero degli iscritti:', { error: error.message });
      res.status(500).json({ error: 'Errore durante il recupero dei documenti' });
    }
  }

  static async findById(req: Request, res: Response): Promise<void> {
    const id: number = parseInt(req.params['id'], 10);
    logger.info(`Recupero dell'iscritto con ID: ${id}`);

    if (isNaN(id)) {
      logger.warn(`Iscritto con ID: ${id} non valido`);
      res.status(400).json({ error: 'ID non valido' });
      return;
    }

    try {
      const doc: Subscriber | null = await Subscriber.findByPk(id);
      if (doc) {
        res.status(200).json(doc);
      } else {
        logger.warn(`Iscritto con ID: ${id} non trovato`);
        res.status(404).json({ error: 'Documento non trovato' });
      }
    } catch (error: any) {
      logger.error(`Errore durante il recupero dell'iscritto con ID: ${id}`, { error: error.message });
      res.status(500).json({ error: 'Errore durante il recupero del documento' });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    logger.info('Creazione di un nuovo iscritto con i dati:', req.body);

    try {
      const doc: Subscriber = await Subscriber.create(req.body);
      logger.info('Iscritto creato con successo:', doc.id);
      res.status(201).json(doc);
    } catch (error: any) {
      logger.error('Errore durante la creazione dell\'iscritto:', { error: error.message });
      res.status(500).json({ error: 'Errore durante la creazione del documento' });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    const id: number = parseInt(req.params['id'], 10);
    logger.info(`Aggiornamento dell'iscritto con ID: ${id}, dati ricevuti:`, req.body);

    if (isNaN(id)) {
      logger.warn(`Iscritto con ID: ${id} non valido`);
      res.status(400).json({ error: 'ID non valido' });
      return;
    }

    try {
      const doc: Subscriber | null  = await Subscriber.findByPk(id);
      if (doc) {
        await doc.update(req.body);
        logger.info(`Iscritto con ID: ${id} aggiornato con successo`);
        res.status(200).json(doc);
      } else {
        logger.warn(`Iscritto con ID: ${id} non trovato per l'aggiornamento`);
        res.status(404).json({ error: 'Documento non trovato' });
      }
    } catch (error: any) {
      logger.error(`Errore durante l'aggiornamento dell'iscritto con ID: ${id}:`, { error: error.message });
      res.status(500).json({ error: 'Errore durante l\'aggiornamento del documento' });
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    const id: number = parseInt(req.params['id'], 10);
    logger.info(`Eliminazione dell'iscritto con ID: ${id}`);

    if (isNaN(id)) {
      logger.warn(`Iscritto con ID: ${id} non valido`);
      res.status(400).json({ error: 'ID non valido' });
      return;
    }

    try {
      const result: number = await Subscriber.destroy({ where: { id } });
      if (result) {
        logger.info(`Iscritto con ID: ${id} eliminato con successo`);
        res.status(200).json({ message: 'Documento eliminato con successo' });
      } else {
        logger.warn(`Iscritto con ID: ${id} non trovato per l'eliminazione`);
        res.status(404).json({ error: 'Documento non trovato' });
      }
    } catch (error: any) {
      logger.error(`Errore durante l'eliminazione dell'iscritto con ID: ${id}:`, { error: error.message });
      res.status(500).json({ error: 'Errore durante l\'eliminazione del documento' });
    }
  }

}
