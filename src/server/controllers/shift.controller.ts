import {DeleteResult, Repository} from 'typeorm';
import {AppDataSource} from '../database/dataSource';
import {Request, Response} from 'express';
import {Shift} from '../entity/shift.entity';

export class ShiftController {

  static docRepository: Repository<Shift> = AppDataSource.getRepository(Shift);

  static async findAll(req: Request, res: Response): Promise<void> {
    try {
      const docs: Shift[] = await ShiftController.docRepository.find();
      res.status(200).json(docs);
    } catch (error) {
      res.status(500).json({ error: 'Errore durante il recupero dei documenti' });
    }
  }

  static async findById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const doc: Shift | null = await ShiftController.docRepository.findOneBy({ id });
      if (doc) {
        res.status(200).json(doc);
      } else {
        res.status(404).json({ error: 'Documento non trovata' });
      }
    } catch (error) {
      res.status(500).json({ error: `Errore durante la creazione del documento: ${error}` });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const doc: Shift[] = ShiftController.docRepository.create(req.body);
      const savedDoc: Shift[] = await ShiftController.docRepository.save(doc);
      res.status(200).json(savedDoc);
    } catch (error) {
      res.status(500).json({ error: 'Errore durante la creazione del documento' });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      let doc: Shift | null = await ShiftController.docRepository.findOneBy({ id });
      if (doc) {
        ShiftController.docRepository.merge(doc, req.body);
        const updatedDoc: Shift = await ShiftController.docRepository.save(doc);
        res.status(200).json(updatedDoc);
      } else {
        res.status(404).json({ error: 'Documento non trovato' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Errore durante l\'aggiornamento del documento' });
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    console.log(`ID da cancellare: ${id}`)
    try {
      const result: DeleteResult = await ShiftController.docRepository.delete(id);
      if (result.affected) {
        res.status(200).json({ message: 'Documento eliminato con successo' });
      } else {
        res.status(404).json({ error: 'Documento non trovato' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Errore durante l\'eliminazione della documento' });
    }
  }

}
