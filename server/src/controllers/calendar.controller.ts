import {DeleteResult, LessThan, MoreThan, Repository} from 'typeorm';
import {AppDataSource} from '../database/dataSource';
import {Request, Response} from 'express';
import {Calendar} from '../entity/event.entity';
import moment from 'moment';

export class CalendarController {

  static docRepository: Repository<Calendar> = AppDataSource.getRepository(Calendar);

  static async findAll(req: Request, res: Response): Promise<void> {
    try {
      const docs: Calendar[] = await CalendarController.docRepository.find();
      res.status(200).json(docs);
    } catch (error) {
      res.status(500).json({ error: 'Errore durante il recupero dei documenti' });
    }
  }

  static async getEventsInRange(req: Request, res: Response): Promise<void> {
    const { startDate, endDate } = req.body;

    try {
      const events: Calendar[] = await CalendarController.docRepository.find({
        where: {
          startDate: LessThan(endDate),
          endDate: MoreThan(startDate),
        },
      });

      res.status(200).json(events);
    } catch (error) {
      res.status(500).json({ error: `Errore durante il recupero degli eventi: ${error}` });
    }
  }

  static async getMaxSerialByShiftId(req: Request, res: Response): Promise<void> {
    const { shiftId } = req.params;
    const currentYear: number = moment().year();

    try {
      const maxSerial = await AppDataSource
        .getRepository(Calendar)
        .createQueryBuilder('calendar')
        .select('COALESCE(MAX(calendar.serial), 0)', 'maxSerial')
        .where('calendar.shiftId = :shiftId', { shiftId })
        .andWhere('calendar.year = :currentYear', { currentYear })
        .getRawOne();

      if (maxSerial && maxSerial.maxSerial !== null) {
        res.status(200).json({ maxSerial: maxSerial.maxSerial });
      } else {
        res.status(404).json({ error: 'Nessun evento trovato per questo shiftId' });
      }
    } catch (error) {
      res.status(500).json({ error: `Errore durante il recupero del massimo seriale: ${error}` });
    }
  }

  static async findById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const doc: Calendar | null = await CalendarController.docRepository.findOneBy({ id });
      if (doc) {
        res.status(200).json(doc);
      } else {
        res.status(404).json({ error: 'Documento non trovato' });
      }
    } catch (error) {
      res.status(500).json({ error: `Errore durante la creazione del documento: ${error}` });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const doc: Calendar[] = CalendarController.docRepository.create(req.body);
      const savedDoc: Calendar[] = await CalendarController.docRepository.save(doc);
      res.status(200).json(savedDoc);
    } catch (error) {
      res.status(500).json({ error: 'Errore durante la creazione del documento' });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    const { id  } = req.params;
    try {
      let doc: Calendar | null = await CalendarController.docRepository.findOneBy({ id });
      if (doc) {
        CalendarController.docRepository.merge(doc, req.body);
        const updatedDoc: Calendar = await CalendarController.docRepository.save(doc);
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
      const result: DeleteResult = await CalendarController.docRepository.delete(id);
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
