import {Request, Response} from 'express';
import {PressCategory} from '../models/press-category.model';
import {PressKeyword} from '../models/press-keyword.model';
import {Sequelize} from 'sequelize';
import logger from '../utils/logger';

export class PressCategoryController {

  static async findAll(req: Request, res: Response): Promise<void> {
    const {includeKeywords, countKeywords} = req.query;
    logger.info('Ottieni tutte le categorie');

    try {
      let docs;

      if (countKeywords === 'true') {
        // Conta il numero di keywords associate a ogni categoria
        docs = await PressCategory.findAll({
          attributes: {
            include: [
              // Aggiungi il conteggio delle keywords come alias `keywordsCount`
              [Sequelize.fn('COUNT', Sequelize.col('keywords.id')), 'keywordsCount']
            ],
          },
          include: [
            {
              model: PressKeyword,
              attributes: [],
            },
          ],
          group: ['PressCategory.id'], // Raggruppa per categoria per contare correttamente
        });
      } else if (includeKeywords === 'true') {
        // Includi le relazioni con keywords
        docs = await PressCategory.findAll({
          include: [
            {
              model: PressKeyword,
              attributes: ['id', 'name'],
            },
          ],
        });
      } else {
        docs = await PressCategory.findAll();
      }

      res.status(200).json(docs);
    } catch (error: any) {
      logger.error('Errore durante il recupero delle keywords:', { error: error.message });
      res.status(500).json({error: 'Errore durante il recupero dei documenti'});
    }
  }

  static async findById(req: Request, res: Response): Promise<void> {
    const {id} = req.params;
    logger.info(`Ottieni la categoria con ID: ${id}`);

    try {
      const doc: PressCategory | null = await PressCategory.findByPk(id);
      if (doc) {
        res.status(200).json(doc);
      } else {
        logger.warn(`Categoria con ID: ${id} non trovata`);
        res.status(404).json({error: 'Documento non trovato'});
      }
    } catch (error: any) {
      logger.error('Errore durante il recupero della categoria:', { error: error.message });
      res.status(500).json({error: 'Errore durante il recupero del documento'});
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    logger.info('Creazione di una nuova categoria con i dati:', req.body);

    try {
      const doc: PressCategory = await PressCategory.create(req.body);
      logger.info('Categoria creata con successo:', doc.id);
      res.status(201).json(doc);
    } catch (error: any) {
      logger.error('Errore durante la creazione della categoria:', { error: error.message });
      res.status(500).json({error: 'Errore durante la creazione del documento'});
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    const {id} = req.params;
    logger.info(`Aggiornamento della categoria con ID: ${id}, dati ricevuti:`, req.body);

    try {
      const doc: PressCategory | null = await PressCategory.findByPk(parseInt(id, 10));
      if (doc) {
        await doc.update(req.body);
        res.status(200).json(doc);
      } else {
        logger.warn(`Categoria con ID: ${id} non trovata`);
        res.status(404).json({error: 'Documento non trovato'});
      }
    } catch (error: any) {
      logger.error('Errore durante l\'aggiornamento della categoria:', { error: error.message });
      res.status(500).json({error: 'Errore durante l\'aggiornamento del documento'});
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    const {id} = req.params;
    logger.info(`Eliminazione della categoria con ID: ${id}`);

    const numericId: number = parseInt(id, 10);
    if (isNaN(numericId)) {
      res.status(400).json({error: 'ID non valido'});
      return;
    }

    try {
      const relatedCount: number = await PressKeyword.count({
        where: {categoryId: numericId},
      });

      if (relatedCount > 0) {
        logger.warn(`Impossibile eliminare la categoria con ID: ${id} perché è utilizzato in ${relatedCount} parole chiave`);
        res.status(400).json({error: 'Impossibile eliminare la categoria perché è usato in almeno una parola chiave'});
        return;
      }

      const result: number = await PressKeyword.destroy({where: {id: numericId}});
      if (result) {
        logger.info(`Categoria con ID: ${id} eliminato con successo`);
        res.status(200).json({message: 'Documento eliminato con successo'});
      } else {
        logger.warn(`Categoria con ID: ${id} non trovata`);
        res.status(404).json({error: 'Documento non trovato'});
      }
    } catch (error: any) {
      logger.error(`Errore durante l'eliminazione della categoria con ID: ${id}:`, { error: error.message });
      res.status(500).json({error: 'Errore durante l\'eliminazione del documento'});
    }
  }
}
