import {Request, Response} from 'express';
import {Shift} from '../models/shift.model';
import {Calendar} from '../models/event.model';

export class ShiftController {

  static async findAll(_: Request, res: Response): Promise<void> {
    try {
      const docs: Shift[] = await Shift.findAll();
      res.status(200).json(docs);
    } catch (error) {
      console.error('Errore durante il recupero dei documenti:', error);
      res.status(500).json({ error: 'Errore durante il recupero dei documenti' });
    }
  }

  static async findById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const doc: Shift | null = await Shift.findByPk(id);
      if (doc) {
        res.status(200).json(doc);
      } else {
        res.status(404).json({ error: 'Documento non trovato' });
      }
    } catch (error) {
      console.error('Errore durante il recupero del documento:', error);
      res.status(500).json({ error: 'Errore durante il recupero del documento' });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const doc: Shift = await Shift.create(req.body);
      res.status(201).json(doc);
    } catch (error) {
      console.error('Errore durante la creazione del documento:', error);
      res.status(500).json({ error: 'Errore durante la creazione del documento' });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const doc: Shift | null  = await Shift.findByPk(id);
      if (doc) {
        await doc.update(req.body);
        res.status(200).json(doc);
      } else {
        res.status(404).json({ error: 'Documento non trovato' });
      }
    } catch (error) {
      console.error('Errore durante l\'aggiornamento del documento:', error);
      res.status(500).json({ error: 'Errore durante l\'aggiornamento del documento' });
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const relatedEventsCount: number = await Calendar.count({
        where: { shiftId: id },
      });

      if (relatedEventsCount > 0) {
        res.status(400).json({ error: 'Impossibile eliminare la causale perché è usato in almeno un evento' });
        return;
      }

      const result: number = await Shift.destroy({ where: { id } });
      if (result) {
        res.status(200).json({ message: 'Documento eliminato con successo' });
      } else {
        res.status(404).json({ error: 'Documento non trovato' });
      }
    } catch (error) {
      console.error('Errore durante l\'eliminazione del documento:', error);
      res.status(500).json({ error: 'Errore durante l\'eliminazione del documento' });
    }
  }

}
