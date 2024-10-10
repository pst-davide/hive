import {AppDataSource} from '../database/dataSource';
import {Request, Response} from 'express';
import {DeleteResult, Repository} from 'typeorm';
import {PressKeyword} from '../entity/press-keyword.entity';

export class PressKeywordController {

  static docsRepository: Repository<PressKeyword> = AppDataSource.getRepository(PressKeyword);

  static async findAll(req: Request, res: Response): Promise<void> {
    try {
      const {categoryId} = req.query;
      const categoryIdNumber: number = parseInt(categoryId as string, 10);
      const whereCondition = categoryId ? {category: {id: categoryIdNumber}} : {};

      const keywords: PressKeyword[] = await PressKeywordController.docsRepository.find({
          where: whereCondition,
          relations: ['category'],
        });

      res.status(200).json(keywords);
    } catch (error) {
      res.status(500).json({error: 'Errore durante il recupero delle keywords'});
    }
  }

  static async findById(req: Request, res: Response): Promise<void> {
    const id: number = parseInt(req.params['id'], 10);

    if (isNaN(id)) { // Controllo se la conversione è fallita
      res.status(400).json({error: 'ID non valido'});
      return;
    }

    try {
      const doc: PressKeyword | null = await PressKeywordController.docsRepository.findOneBy({id});
      if (doc) {
        res.status(200).json(doc);
      } else {
        res.status(404).json({error: 'Documento non trovato'});
      }
    } catch (error) {
      res.status(500).json({error: `Errore durante la creazione del documento: ${error}`});
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const doc: PressKeyword[] = PressKeywordController.docsRepository.create(req.body);
      const savedDoc: PressKeyword[] = await PressKeywordController.docsRepository.save(doc);
      res.status(200).json(savedDoc);
    } catch (error) {
      res.status(500).json({error: 'Errore durante la creazione del documento'});
    }
  }

  static async createBatch(req: Request, res: Response): Promise<void> {
    try {

      const docsData = req.body.map((doc: PressKeyword) => ({
        ...doc,
        id: undefined,
      }));

      const docs: PressKeyword[] = PressKeywordController.docsRepository.create(docsData); // Creazione batch
      const savedDocs: PressKeyword[] = await PressKeywordController.docsRepository.save(docs); // Salvataggio batch
      res.status(200).json(savedDocs); // Risposta con i documenti salvati
    } catch (error) {
      res.status(500).json({ error: 'Errore durante la creazione dei documenti' });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    const id: number = parseInt(req.params['id'], 10);

    if (isNaN(id)) { // Controllo se la conversione è fallita
      res.status(400).json({error: 'ID non valido'});
      return;
    }

    try {
      let doc: PressKeyword | null = await PressKeywordController.docsRepository.findOneBy({id});
      if (doc) {
        PressKeywordController.docsRepository.merge(doc, req.body);
        const Doc: PressKeyword = await PressKeywordController.docsRepository.save(doc);
        res.status(200).json(Doc);
      } else {
        res.status(404).json({error: 'Documento non trovato'});
      }
    } catch (error) {
      res.status(500).json({error: 'Errore durante l\'aggiornamento del documento'});
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    const {id} = req.params;
    try {
      const result: DeleteResult = await PressKeywordController.docsRepository.delete(id);
      if (result.affected) {
        res.status(200).json({message: 'Documento eliminato con successo'});
      } else {
        res.status(404).json({error: 'Documento non trovato'});
      }
    } catch (error) {
      res.status(500).json({error: 'Errore durante l\'eliminazione del documento'});
    }
  }

}
