import {Request, Response} from 'express';
import {PressCategory} from '../models/press-category.model';
import {PressKeyword} from '../models/press-keyword.model';
import {Sequelize} from 'sequelize';

export class PressCategoryController {

  static async findAll(req: Request, res: Response): Promise<void> {
    const {includeKeywords, countKeywords} = req.query;

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
    } catch (error) {
      console.error('Errore durante il recupero dei documenti:', error);
      res.status(500).json({error: 'Errore durante il recupero dei documenti'});
    }
  }

  static async findById(req: Request, res: Response): Promise<void> {
    const {id} = req.params;
    try {
      const doc: PressCategory | null = await PressCategory.findByPk(id);
      if (doc) {
        res.status(200).json(doc);
      } else {
        res.status(404).json({error: 'Documento non trovato'});
      }
    } catch (error) {
      console.error('Errore durante il recupero del documento:', error);
      res.status(500).json({error: 'Errore durante il recupero del documento'});
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const doc: PressCategory = await PressCategory.create(req.body);
      res.status(201).json(doc);
    } catch (error) {
      console.error('Errore durante la creazione del documento:', error);
      res.status(500).json({error: 'Errore durante la creazione del documento'});
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    const {id} = req.params;
    try {
      const doc: PressCategory | null = await PressCategory.findByPk(parseInt(id, 10));
      if (doc) {
        await doc.update(req.body);
        res.status(200).json(doc);
      } else {
        res.status(404).json({error: 'Documento non trovato'});
      }
    } catch (error) {
      console.error('Errore durante l\'aggiornamento del documento:', error);
      res.status(500).json({error: 'Errore durante l\'aggiornamento del documento'});
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    const {id} = req.params;

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
        res.status(400).json({error: 'Impossibile eliminare la categoria perché è usato in almeno una parola chiave'});
        return;
      }

      const result: number = await PressKeyword.destroy({where: {id: numericId}});
      if (result) {
        res.status(200).json({message: 'Documento eliminato con successo'});
      } else {
        res.status(404).json({error: 'Documento non trovato'});
      }
    } catch (error) {
      console.error('Errore durante l\'eliminazione del documento:', error);
      res.status(500).json({error: 'Errore durante l\'eliminazione del documento'});
    }
  }
}
