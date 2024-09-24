import {AppDataSource} from '../database/dataSource';
import {Request, Response} from 'express';
import {DeleteResult, Repository} from 'typeorm';
import {PressCategory} from '../entity/press-category.entity';

export class PressCategoryController {

  static docsRepository: Repository<PressCategory> = AppDataSource.getRepository(PressCategory);

  static async findAll(req: Request, res: Response): Promise<void> {
    const {includeKeywords, countKeywords} = req.query;

    let docs: PressCategory[] = [];
    try {
      if (countKeywords === 'true') {
        docs = await PressCategoryController.docsRepository
          .createQueryBuilder('category')
          .loadRelationCountAndMap('category.keywordsCount', 'category.keywords')
          .getMany();
      } else if (includeKeywords === 'true') {
        docs = await PressCategoryController.docsRepository.find({
          relations: ['keywords'],
        });
      } else {
        docs = await PressCategoryController.docsRepository.find();
      }

      res.status(200).json(docs);
    } catch (error) {
      res.status(500).json({error: 'Errore durante il recupero del documento'});
    }
  }

  static async findById(req: Request, res: Response): Promise<void> {
    const id: number = parseInt(req.params['id'], 10);

    if (isNaN(id)) { // Controllo se la conversione è fallita
      res.status(400).json({error: 'ID non valido'});
      return;
    }

    try {
      const doc: PressCategory | null = await PressCategoryController.docsRepository.findOneBy({id});
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
      const doc: PressCategory[] = PressCategoryController.docsRepository.create(req.body);
      const savedDoc: PressCategory[] = await PressCategoryController.docsRepository.save(doc);
      res.status(200).json(savedDoc);
    } catch (error) {
      res.status(500).json({error: 'Errore durante la creazione del documento'});
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
  const id: number = parseInt(req.params['id'], 10);

  if (isNaN(id)) {
    res.status(400).json({ error: 'ID non valido' });
    return;
  }

  try {
    // Trova la categoria esistente per l'ID fornito
    let doc: PressCategory | null = await PressCategoryController.docsRepository.findOneBy({ id });

    if (!doc) {
      res.status(404).json({ error: 'Documento non trovato' });
      return;
    }

    // Controlla se il nuovo `name` è già in uso da un'altra categoria diversa da quella corrente
    if (req.body.name && req.body.name !== doc.name) {
      const existingCategory: PressCategory | null = await PressCategoryController.docsRepository.findOne({
        where: { name: req.body.name }
      });

      // Se esiste una categoria con lo stesso nome ma con un ID diverso, blocca l'operazione
      if (existingCategory && existingCategory.id !== id) {
        res.status(409).json({ error: 'Il nome della categoria è già in uso' });
        return;
      }
    }

    // Merge dei dati
    PressCategoryController.docsRepository.merge(doc, req.body);

    // Salva il documento aggiornato
    const updatedDoc: PressCategory = await PressCategoryController.docsRepository.save(doc);
    res.status(200).json(updatedDoc);

  } catch (error) {
    console.error('Errore durante l\'aggiornamento del documento:', error);
    res.status(500).json({ error: 'Errore durante l\'aggiornamento del documento' });
  }
}

  static async delete(req: Request, res: Response): Promise<void> {
    console.log('Richiesta DELETE ricevuta:', req.url);
    console.log('Parametri della richiesta:', req.params);
    console.log('Headers della richiesta:', req.headers);

    const id: number = parseInt(req.params['id'], 10);
    console.log('ID da cancellare: ' + id)
    try {
      const result: DeleteResult = await PressCategoryController.docsRepository.delete(id);
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
