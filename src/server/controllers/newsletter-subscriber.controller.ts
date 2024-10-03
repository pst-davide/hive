import {DeleteResult, Repository} from 'typeorm';
import {AppDataSource} from '../database/dataSource';
import {Request, Response} from 'express';
import {Subscriber} from '../entity/newsletter-subscribe.entity';


export class NewsletterSubscriberController {

  static docsRepository: Repository<Subscriber> = AppDataSource.getRepository(Subscriber);

  static async findAll(req: Request, res: Response): Promise<void> {
    try {
      const {channelId} = req.query;

      let docs;
      if (channelId) {
        const channelIdNumber: number = parseInt(channelId as string, 10);
        if (isNaN(channelIdNumber)) {
          res.status(400).json({error: 'channelId deve essere un numero valido'});
          return;
        }

        docs = await NewsletterSubscriberController.docsRepository.find({
          where: {channelId: channelIdNumber},
          relations: ['channel'],
        });
      } else {
        docs = await NewsletterSubscriberController.docsRepository.find({
          relations: ['channel'],
        });
      }

      res.status(200).json(docs);
    } catch (error) {
      res.status(500).json({error: 'Errore durante il recupero dei documenti'});
    }
  }

  static async findById(req: Request, res: Response): Promise<void> {
    const id: number = parseInt(req.params['id'], 10);

    if (isNaN(id)) { // Controllo se la conversione è fallita
      res.status(400).json({error: 'ID non valido'});
      return;
    }

    try {
      const doc: Subscriber | null = await NewsletterSubscriberController.docsRepository.findOneBy({id});
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
      const doc: Subscriber[] = NewsletterSubscriberController.docsRepository.create(req.body);
      const savedDoc: Subscriber[] = await NewsletterSubscriberController.docsRepository.save(doc);
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
      // Trova il documento esistente per l'ID fornito
      let doc: Subscriber | null = await NewsletterSubscriberController.docsRepository.findOneBy({ id });

      if (!doc) {
        res.status(404).json({ error: 'Documento non trovato' });
        return;
      }

      // Merge dei dati
      NewsletterSubscriberController.docsRepository.merge(doc, req.body);

      // Salva il documento aggiornato
      const updatedDoc: Subscriber = await NewsletterSubscriberController.docsRepository.save(doc);
      res.status(200).json(updatedDoc);

    } catch (error) {
      console.error('Errore durante l\'aggiornamento del documento:', error);
      res.status(500).json({ error: 'Errore durante l\'aggiornamento del documento' });
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    const id: number = parseInt(req.params['id'], 10);

    try {
      const result: DeleteResult = await NewsletterSubscriberController.docsRepository.delete(id);
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
