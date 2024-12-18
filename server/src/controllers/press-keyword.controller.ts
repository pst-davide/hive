import { Request, Response } from 'express';
import { PressKeyword } from '../models/press-keyword.model';
import { PressCategory } from '../models/press-category.model';
import logger from '../utils/logger';

export class PressKeywordController {

  static async findAll(req: Request, res: Response): Promise<void> {
    logger.info('Ottieni tutte le keywords');
    try {
      const { categoryId } = req.query;

      const whereCondition: any = categoryId
        ? { categoryId: parseInt(categoryId as string, 10) }
        : {};

      const keywords: PressKeyword[] = await PressKeyword.findAll({
        where: whereCondition,
        include: [
          {
            model: PressCategory,
            as: 'category',
          },
        ],
      });

      res.status(200).json(keywords);
    } catch (error: any) {
      logger.error('Errore durante il recupero delle keywords:', { error: error.message });
      res.status(500).json({ error: 'Errore durante il recupero delle keywords', details: error.message });
    }
  }

  static async findById(req: Request, res: Response): Promise<void> {
    const id: number = parseInt(req.params['id'], 10);
    logger.info(`Ottieni la keyword con ID: ${id}`);

    if (isNaN(id)) {
      logger.warn(`Keyword con ID: ${id} non valida`);
      res.status(400).json({ error: 'ID non valido' });
      return;
    }

    try {
      const keyword: PressKeyword | null = await PressKeyword.findByPk(id, {
        include: [
          {
            model: PressCategory,
            as: 'category',
          },
        ],
      });

      if (keyword) {
        res.status(200).json(keyword);
      } else {
        logger.warn(`Keyword con ID: ${id} non trovata`);
        res.status(404).json({ error: 'Keyword non trovata' });
      }
    } catch (error: any) {
      logger.error('Errore durante il recupero della keyword:', { error: error.message });
      res.status(500).json({ error: 'Errore durante il recupero della keyword', details: error.message });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    logger.info('Creazione di una nuova keyword con i dati:', req.body);

    try {
      const keyword: PressKeyword = await PressKeyword.create(req.body);
      logger.info('Keyword creata con successo:', keyword.id);
      res.status(201).json(keyword);
    } catch (error: any) {
      logger.error('Errore durante la creazione della keyword:', { error: error.message });
      res.status(500).json({ error: 'Errore durante la creazione della keyword', details: error.message });
    }
  }

  static async createBatch(req: Request, res: Response): Promise<void> {
    logger.info('Creazione batch di keywords con i dati:', req.body);

    try {
      const keywords: PressKeyword[] = await PressKeyword.bulkCreate(req.body, { validate: true });
      logger.info('Keywords create con successo:', keywords);
      res.status(201).json(keywords);
    } catch (error: any) {
      logger.error('Errore durante la creazione delle keywords in batch:', { error: error.message });
      res.status(500).json({ error: 'Errore durante la creazione delle keywords in batch', details: error.message });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    const id: number = parseInt(req.params['id'], 10);
    logger.info(`Aggiornamento della keyword con ID: ${id}, dati ricevuti:`, req.body);

    if (isNaN(id)) {
      logger.warn(`Keyword con ID: ${id} non valida`);
      res.status(400).json({ error: 'ID non valido' });
      return;
    }

    try {
      const keyword: PressKeyword | null = await PressKeyword.findByPk(id);

      if (keyword) {
        await keyword.update(req.body);
        logger.info('Keyword aggiornata con successo:', keyword.id);
        res.status(200).json(keyword);
      } else {
        logger.warn(`Keyword con ID: ${id} non trovata`);
        res.status(404).json({ error: 'Keyword non trovata' });
      }
    } catch (error: any) {
      logger.error('Errore durante l\'aggiornamento della keyword:', { error: error.message });
      res.status(500).json({ error: 'Errore durante l\'aggiornamento della keyword', details: error.message });
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    const id: number = parseInt(req.params['id'], 10);

    if (isNaN(id)) {
      res.status(400).json({ error: 'ID non valido' });
      return;
    }

    try {
      const rowsDeleted: number = await PressKeyword.destroy({ where: { id } });

      if (rowsDeleted) {
        res.status(200).json({ message: 'Keyword eliminata con successo' });
      } else {
        res.status(404).json({ error: 'Keyword non trovata' });
      }
    } catch (error: any) {
      res.status(500).json({ error: 'Errore durante l\'eliminazione della keyword', details: error.message });
    }
  }
}
