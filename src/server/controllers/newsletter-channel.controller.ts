import {DeleteResult, Repository} from 'typeorm';
import {AppDataSource} from '../database/dataSource';
import {Request, Response} from 'express';
import {Channel} from '../entity/newsletter-channel.entity';
import {Subscriber} from '../entity/newsletter-subscribe.entity';


export class NewsletterChannelController {

  static docsRepository: Repository<Channel> = AppDataSource.getRepository(Channel);

  static async findAll(req: Request, res: Response): Promise<void> {
    const {includeUsers, countSubscribers} = req.query;

    let docs: Channel[] = [];
    try {
      if (countSubscribers === 'true') {
        docs = await NewsletterChannelController.docsRepository.find();

        const subscribersRepository: Repository<Subscriber> = AppDataSource.getRepository(Subscriber);

        const docsWithCounts: number[] = await Promise.all(
          docs.map(async (doc) => {
            try {
              const subscriberCount: number = await subscribersRepository.count({ where: { channelId: doc.id } });
              console.log([doc.id, subscriberCount])
              return subscriberCount;
            } catch (err) {
              console.error(`Errore nel contare i subscribers per il canale ${doc.id}:`, err);
              return 0;
            }
          })
        );

        console.log(docsWithCounts)

      } else if (includeUsers === 'true') {
        docs = await NewsletterChannelController.docsRepository.find({
          relations: ['users'],
        });
      } else {
        docs = await NewsletterChannelController.docsRepository.find();
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
      const doc: Channel | null = await NewsletterChannelController.docsRepository.findOneBy({id});
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
      const doc: Channel[] = NewsletterChannelController.docsRepository.create(req.body);
      const savedDoc: Channel[] = await NewsletterChannelController.docsRepository.save(doc);
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
      let doc: Channel | null = await NewsletterChannelController.docsRepository.findOneBy({ id });

      if (!doc) {
        res.status(404).json({ error: 'Documento non trovato' });
        return;
      }

      // Controlla se il nuovo `name` è già in uso da un altro documento diversa da quella corrente
      if (req.body.name && req.body.name !== doc.name) {
        const existingDoc: Channel | null = await NewsletterChannelController.docsRepository.findOne({
          where: { name: req.body.name }
        });

        // Se esiste un documento con lo stesso nome ma con un ID diverso, blocca l'operazione
        if (existingDoc && existingDoc.id !== id) {
          res.status(409).json({ error: 'Il nome del documento è già in uso' });
          return;
        }
      }

      // Merge dei dati
      NewsletterChannelController.docsRepository.merge(doc, req.body);

      // Salva il documento aggiornato
      const updatedDoc: Channel = await NewsletterChannelController.docsRepository.save(doc);
      res.status(200).json(updatedDoc);

    } catch (error) {
      console.error('Errore durante l\'aggiornamento del documento:', error);
      res.status(500).json({ error: 'Errore durante l\'aggiornamento del documento' });
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    const id: number = parseInt(req.params['id'], 10);

    try {
      const result: DeleteResult = await NewsletterChannelController.docsRepository.delete(id);
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
