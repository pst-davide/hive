import { AppDataSource } from '../database/dataSource';
import { Request, Response } from 'express';
import {DeleteResult, Repository} from 'typeorm';
import {Branch} from '../entity/location.entity';

export class LocationController {

  static docRepository: Repository<Branch> = AppDataSource.getRepository(Branch);

  static async findAll(req: Request, res: Response): Promise<void> {
    try {
      const docs: Branch[] = await LocationController.docRepository.find();
      res.status(200).json(docs);
    } catch (error) {
      res.status(500).json({ error: 'Errore durante il recupero dei documenti' });
    }
  }

  static async findById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const doc: Branch | null = await LocationController.docRepository.findOneBy({ id });
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
    console.log(req.body);
    try {
      const doc: Branch[] = LocationController.docRepository.create(req.body);
      const savedDoc: Branch[] = await LocationController.docRepository.save(doc);
      res.status(200).json(savedDoc);
    } catch (error) {
      res.status(500).json({ error: 'Errore durante la creazione del documento' });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      let doc: Branch | null = await LocationController.docRepository.findOneBy({ id });
      if (doc) {
        LocationController.docRepository.merge(doc, req.body);
        const updatedRoom = await LocationController.docRepository.save(doc);
        res.status(200).json(updatedRoom);
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
      const result: DeleteResult = await LocationController.docRepository.delete(id);
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
