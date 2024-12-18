import {Request, Response} from 'express';
import {Shift} from '../models/shift.model';
import {Calendar} from '../models/event.model';
import logger from '../utils/logger';

export class ShiftController {

  static async findAll(_: Request, res: Response): Promise<void> {
    logger.info('Ottieni tutti i shift');
    try {
      const docs: Shift[] = await Shift.findAll();
      res.status(200).json(docs);
    } catch (error: any) {
      logger.error('Errore durante il recupero dei shift:', { error: error.message });
      res.status(500).json({ error: 'Errore durante il recupero dei documenti' });
    }
  }

  static async findById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    logger.info(`Ottieni lo shift con ID: ${id}`);
    try {
      const doc: Shift | null = await Shift.findByPk(id);
      if (doc) {
        res.status(200).json(doc);
      } else {
        logger.warn(`Shift con ID: ${id} non trovato`);
        res.status(404).json({ error: 'Documento non trovato' });
      }
    } catch (error: any) {
      logger.error('Errore durante il recupero del documento:', { error: error.message });
      res.status(500).json({ error: 'Errore durante il recupero del documento' });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    logger.info('Creazione di un nuovo shift con i dati:', req.body);
    try {
      const doc: Shift = await Shift.create(req.body);
      logger.info('Shift creato con successo:', doc.id);
      res.status(201).json(doc);
    } catch (error: any) {
      logger.error('Errore durante la creazione dello shift:', { error: error.message });
      res.status(500).json({ error: 'Errore durante la creazione del documento' });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    logger.info(`Aggiornamento dello shift con ID: ${id}, dati ricevuti:`, req.body);
    try {
      const doc: Shift | null = await Shift.findByPk(id);
      if (doc) {
        await doc.update(req.body);
        logger.info(`Shift con ID: ${id} aggiornato con successo`);
        res.status(200).json(doc);
      } else {
        logger.warn(`Shift con ID: ${id} non trovato per l'aggiornamento`);
        res.status(404).json({ error: 'Documento non trovato' });
      }
    } catch (error: any) {
      logger.error(`Errore durante l'aggiornamento dello shift con ID: ${id}:`, { error: error.message });
      res.status(500).json({ error: 'Errore durante l\'aggiornamento del documento' });
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    logger.info(`Eliminazione dello shift con ID: ${id}`);

    try {
      const relatedEventsCount: number = await Calendar.count({
        where: { shiftId: id },
      });

      if (relatedEventsCount > 0) {
        logger.warn(`Impossibile eliminare lo shift con ID: ${id} perché è utilizzato in ${relatedEventsCount} eventi`);
        res.status(400).json({ error: 'Impossibile eliminare la causale perché è usato in almeno un evento' });
        return;
      }

      const result: number = await Shift.destroy({ where: { id } });
      if (result) {
        logger.info(`Shift con ID: ${id} eliminato con successo`);
        res.status(200).json({ message: 'Documento eliminato con successo' });
      } else {
        logger.warn(`Shift con ID: ${id} non trovato per l\'eliminazione`);
        res.status(404).json({ error: 'Documento non trovato' });
      }
    } catch (error: any) {
      logger.error(`Errore durante l'eliminazione dello shift con ID: ${id}:`, { error: error.message });
      res.status(500).json({ error: 'Errore durante l\'eliminazione del documento' });
    }
  }

}
