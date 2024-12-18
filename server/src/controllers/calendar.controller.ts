import { Request, Response } from 'express';
import { Op } from 'sequelize';
import logger from '../utils/logger';
import {Calendar} from '../models/event.model';

export class CalendarController {

  static async findAll(req: Request, res: Response): Promise<void> {
    logger.info('Recupero di tutti gli eventi');

    try {
      const docs: Calendar[] = await Calendar.findAll();
      res.status(200).json(docs);
    } catch (error: any) {
      logger.error('Errore durante il recupero degli eventi', { error: error.message });
      res.status(500).json({ error: 'Errore durante il recupero dei documenti' });
    }
  }

  static async getEventsInRange(req: Request, res: Response): Promise<void> {
    const { startDate, endDate } = req.body;
    logger.info('Recupero eventi nel range', { startDate, endDate });

    try {
      const events: Calendar[] = await Calendar.findAll({
        where: {
          startDate: { [Op.lt]: endDate },
          endDate: { [Op.gt]: startDate },
        },
      });
      res.status(200).json(events);
    } catch (error: any) {
      logger.error('Errore durante il recupero degli eventi', { error: error.message });
      res.status(500).json({ error: `Errore durante il recupero degli eventi: ${error.message}` });
    }
  }

  static async getMaxSerialByShiftId(req: Request, res: Response): Promise<void> {
    const { shiftId } = req.params;
    const currentYear = new Date().getFullYear();

    logger.info('Recupero del massimo seriale per shiftId', { shiftId, currentYear });

    try {
      const maxSerial: Calendar = await Calendar.max('serial', {
        where: {
          shiftId,
          year: currentYear,
        },
      });

      const serialToReturn: number = maxSerial !== null ? maxSerial.serial : 0;
      res.status(200).json({ maxSerial: serialToReturn });
    } catch (error: any) {
      logger.error('Errore durante il recupero del massimo seriale', { error: error.message });
      res.status(500).json({ error: `Errore durante il recupero del massimo seriale: ${error.message}` });
    }
  }

  static async findById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    logger.info('Recupero evento per ID', { id });

    try {
      const doc: Calendar | null = await Calendar.findByPk(id);
      if (doc) {
        res.status(200).json(doc);
      } else {
        logger.warn('Evento non trovato per ID', { id });
        res.status(404).json({ error: 'Documento non trovato' });
      }
    } catch (error: any) {
      logger.error('Errore durante il recupero del documento', { error: error.message });
      res.status(500).json({ error: `Errore durante il recupero del documento: ${error.message}` });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    logger.info('Creazione di un nuovo evento', { data: req.body });

    try {
      const doc: Calendar = await Calendar.create(req.body);
      res.status(201).json(doc);
    } catch (error: any) {
      logger.error('Errore durante la creazione dell\'evento', { error: error.message });
      res.status(500).json({ error: 'Errore durante la creazione del documento' });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    logger.info('Aggiornamento dell\'evento', { id, data: req.body });

    try {
      const doc: Calendar | null = await Calendar.findByPk(id);
      if (doc) {
        await doc.update(req.body);
        res.status(200).json(doc);
      } else {
        logger.warn('Evento non trovato per ID', { id });
        res.status(404).json({ error: 'Documento non trovato' });
      }
    } catch (error: any) {
      logger.error('Errore durante l\'aggiornamento dell\'evento', { error: error.message });
      res.status(500).json({ error: 'Errore durante l\'aggiornamento del documento' });
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    logger.info('Eliminazione del documento', { id });

    try {
      const result: number = await Calendar.destroy({
        where: { id },
      });

      if (result) {
        res.status(200).json({ message: 'Documento eliminato con successo' });
      } else {
        logger.warn('Tentativo di eliminare un evento non trovato', { id });
        res.status(404).json({ error: 'Documento non trovato' });
      }
    } catch (error: any) {
      logger.error('Errore durante l\'eliminazione dell\'evento', { error: error.message });
      res.status(500).json({ error: 'Errore durante l\'eliminazione del documento' });
    }
  }

}
