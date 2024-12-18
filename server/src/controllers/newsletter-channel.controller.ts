import {Request, Response} from 'express';
import {Channel} from '../models/channel.model';
import {col, fn} from 'sequelize';
import {Op} from 'sequelize';
import {User} from '../models/user.model';
import logger from '../utils/logger';
import {Subscriber} from '../models/subscribe.model';

export class NewsletterChannelController {

  static async findAll(req: Request, res: Response): Promise<void> {
    const {includeUsers, countSubscribers} = req.query;
    logger.info(`Ottieni tutti il canali`);

    try {
      const queryOptions: any = {
        attributes: ['id', 'name'],
      };

      // Se includere gli utenti associati
      if (includeUsers === 'true') {
        queryOptions.include = [
          {
            model: User,
            as: 'users', // Relazione users
            attributes: ['id', 'name', 'lastname', 'email'],
          },
        ];
      }

      // Se contare i subscribers
      if (countSubscribers === 'true') {
        queryOptions.attributes.push([
          fn('COUNT', col('subscribers.id')),
          'subscriberCount',
        ]);
        queryOptions.include = queryOptions.include || [];
        queryOptions.include.push({
          model: Subscriber,
          as: 'subscribers',
          attributes: [], // Non serve estrarre i dettagli dei subscribers
          duplicating: false,
        });
        queryOptions.group = ['Channel.id'];
      }

      // Esegui la query
      const channels: Channel[] = await Channel.findAll(queryOptions);

      res.status(200).json(channels);
    } catch (error: any) {
      logger.error(`Errore durante il recupero dei canali`, {error: error.message});
      res.status(500).json({error: 'Errore durante il recupero dei documenti'});
    }
  }

  static async findById(req: Request, res: Response): Promise<void> {
    const id: number = parseInt(req.params['id'], 10);
    logger.info(`Ottieni il canale con ID: ${id}`);

    if (isNaN(id)) {
      logger.warn(`Canale con ID: ${id} non valido`);
      res.status(400).json({error: 'ID non valido'});
      return;
    }

    try {
      const {includeUsers, countSubscribers} = req.query;

      const queryOptions: any = {
        where: {id},
        attributes: ['id', 'name'],
      };

      // Includere utenti associati
      if (includeUsers === 'true') {
        queryOptions.include = [
          {
            model: User,
            as: 'users',
            attributes: ['id', 'name', 'lastname', 'email'],
          },
        ];
      }

      // Se bisogna contare i subscribers
      if (countSubscribers === 'true') {
        queryOptions.attributes.push([
          fn('COUNT', col('subscribers.id')),
          'subscriberCount',
        ]);
        queryOptions.include = queryOptions.include || [];
        queryOptions.include.push({
          model: Subscriber,
          as: 'subscribers',
          attributes: [],
          duplicating: false,
        });
        queryOptions.group = ['Channel.id'];
      }

      // Esegui la query
      const channel: Channel | null = await Channel.findOne(queryOptions);

      if (!channel) {
        logger.warn(`Canale con ID: ${id} non trovato`);
        res.status(404).json({error: 'Documento non trovato'});
        return;
      }

      res.status(200).json(channel);
    } catch (error: any) {
      logger.error(`Errore durante il recupero del canale`, {error: error.message});
      res.status(500).json({error: 'Errore durante il recupero del documento'});
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    logger.info('Creazione di un nuovo canale con i dati:', req.body);

    try {
      const {name, ...createFields} = req.body;

      if (name) {
        const existingDoc: Channel | null = await Channel.findOne({
          where: {name},
        });

        if (existingDoc) {
          logger.warn(`Il campo 'nome' è già utilizzato da un altro documento`);
          res.status(409).json({error: 'Il campo "nome" è già utilizzato da un altro documento'});
          return;
        }
      } else {
        logger.warn(`Il campo 'nome' è obbligatorio`);
        res.status(400).json({error: 'Il campo "nome" è obbligatorio'});
        return;
      }

      const newDoc: Channel = await Channel.create({name, ...createFields});
      logger.info(`Canale creato con successo`);
      res.status(201).json(newDoc);
    } catch (error: any) {
      logger.error(`Errore durante la creazione del canale`, {error: error.message});
      res.status(500).json({error: 'Errore durante la creazione del documento'});
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    const id: number = parseInt(req.params['id'], 10);
    logger.info(`Aggiornamento del canale con ID: ${id}, dati ricevuti:`, req.body);
    if (isNaN(id)) {
      logger.warn(`Canale con ID: ${id} non valido`);
      res.status(400).json({error: 'ID non valido'});
      return;
    }

    try {
      const {name, ...updateFields} = req.body; // Estrai il name dal corpo della richiesta

      // Trova il documento da aggiornare
      const doc: Channel | null = await Channel.findByPk(id);
      if (!doc) {
        res.status(404).json({error: 'Documento non trovato'});
        return;
      }

      // Controlla se il nuovo name è già utilizzato da un altro record
      if (name) {
        const existingDoc: Channel | null = await Channel.findOne({
          where: {
            name,
            id: {[Op.ne]: id}, // Esclude il record corrente
          },
        });

        if (existingDoc) {
          logger.warn(`Canale con ID: ${id} il campo 'nome' è già utilizzato da un altro documento`);
          res.status(409).json({error: 'Il campo "nome" è già utilizzato da un altro documento'});
          return;
        }
      }

      // Aggiorna il documento
      await doc.update({name, ...updateFields});
      logger.info(`Canale con ID: ${id} aggiornato con successo`);
      res.status(200).json(doc);
    } catch (error: any) {
      logger.error(`Errore durante l'aggiornamento del canale con ID: ${id}:`, {error: error.message});
      res.status(500).json({error: 'Errore durante l\'aggiornamento del documento'});
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    const id: number = parseInt(req.params['id'], 10);
    logger.info(`Eliminazione del canale con ID: ${id}`);
    if (isNaN(id)) {
      logger.warn(`Canale con ID: ${id} non valido`);
      res.status(400).json({error: 'ID non valido'});
      return;
    }

    try {
      const subscribersCount: number = await Subscriber.count({where: {channelId: id}});
      if (subscribersCount > 0) {
        logger.warn(`Canale con ID: ${id} non può essere eliminato perché ha ${subscribersCount} iscritti`);
        res.status(400).json({error: `Impossibile eliminare il canale perché ha ${subscribersCount} iscritti`});
        return;
      }

      const result: number = await Channel.destroy({where: {id}});
      if (result) {
        logger.info(`Canale con ID: ${id} eliminato con successo`);
        res.status(200).json({message: 'Documento eliminato con successo'});
      } else {
        logger.warn(`Canale con ID: ${id} non trovato`);
        res.status(404).json({error: 'Documento non trovato'});
      }
    } catch (error: any) {
      logger.error(`Errore durante l'eliminazione del canale con ID: ${id}:`, {error: error.message});
      res.status(500).json({error: 'Errore durante l\'eliminazione del documento'});
    }
  }

}
