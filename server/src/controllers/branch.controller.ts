import { Request, Response } from 'express';
import {Branch} from '../models/branch.model';
import logger from '../utils/logger';
import {Room} from '../models/room.model';

export class BranchController {

  static async findAll(_: Request, res: Response): Promise<void> {
    logger.info('Ottieni tutti i branches');

    try {
      const docs: Branch[] = await Branch.findAll();
      res.status(200).json(docs);
    } catch (error: any) {
      logger.error('Errore durante il recupero dei branch', { error: error.message });
      res.status(500).json({ error: 'Errore durante il recupero dei documenti' });
    }
  }

  static async findById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    logger.info('Ottieni il branch: ', req.params?.['id']);

    try {
      const doc: Branch | null = await Branch.findByPk(id);
      if (doc) {
        res.status(200).json(doc);
      } else {
        logger.warn(`Branch con ID: ${id} non trovato`);
        res.status(404).json({ error: 'Documento non trovato' });
      }
    } catch (error: any) {
      logger.error('Errore durante il recupero del documento', { error: error.message });
      res.status(500).json({ error: 'Errore durante il recupero del documento' });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    logger.info('Creazione di un nuovo branch con i dati: ', req.body);

    try {
      const doc: Branch = await Branch.create(req.body);
      logger.info('Branch creato con successo:', doc.id);
      res.status(201).json(doc);
    } catch (error: any) {
      logger.error('Errore durante la creazione del branch', { error: error.message });
      res.status(500).json({ error: 'Errore durante la creazione del documento' });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    logger.info(`Aggiornamento del branch con ID: ${id}, dati ricevuti: `, req.body);

    try {
      const doc: Branch | null = await Branch.findByPk(id);

      if (doc) {
        await doc.update(req.body);
        logger.info(`Branch con ID: ${id} aggiornato con successo`);
        res.status(200).json(doc);
      } else {
        logger.warn(`Branch con ID: ${id} non trovato.`);
        res.status(404).json({ error: 'Documento non trovato' });
      }
    } catch (error: any) {
      logger.error(`Errore durante l'aggiornamento del branch con ID: ${id}`, { error: error.message });
      res.status(500).json({ error: 'Errore durante l\'aggiornamento del documento' });
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    logger.info(`Eliminazione del branch con ID: ${id}, dati ricevuti: `, req.body);

    try {
      // Verifica se il branch è associato a delle stanze
      const roomCount: number = await Room.count({ where: { branchId: id } });

      if (roomCount > 0) {
        logger.warn(`Branch con ID: ${id} non può essere eliminato perché è utilizzato in ${roomCount} stanze.`);
        res.status(400).json({ error: 'Impossibile eliminare il branch, è utilizzato in una o più stanze.' });
        return;
      }

      const result: number = await Branch.destroy({ where: { id } });
      if (result) {
        logger.info(`Branch con ID: ${id} eliminato con successo`);
        res.status(200).json({ message: 'Documento eliminato con successo' });
      } else {
        logger.warn(`Branch con ID: ${id} non trovato per l\'eliminazione`);
        res.status(404).json({ error: 'Documento non trovato' });
      }
    } catch (error: any) {
      logger.error(`Errore durante l\'eliminazione del branch con ID: ${id}`, { error: error.message });
      res.status(500).json({ error: 'Errore durante l\'eliminazione della documento' });
    }
  }

}
