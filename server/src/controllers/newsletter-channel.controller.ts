import {Request, Response} from 'express';
import {Subscriber} from '../entity/newsletter-subscribe.entity';
import {Channel} from '../models/channel.model';
import {col, fn} from 'sequelize';
import {Op} from 'sequelize';
import {User} from '../models/user.model';


export class NewsletterChannelController {

  static async findAll(req: Request, res: Response): Promise<void> {
    const { includeUsers, countSubscribers } = req.query;

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
    } catch (error) {
      console.error('Errore durante il recupero dei documenti:', error);
      res.status(500).json({ error: 'Errore durante il recupero dei documenti' });
    }
  }

  static async findById(req: Request, res: Response): Promise<void> {
  const id: number = parseInt(req.params['id'], 10);

  if (isNaN(id)) {
    res.status(400).json({ error: 'ID non valido' });
    return;
  }

  try {
    const { includeUsers, countSubscribers } = req.query;

    const queryOptions: any = {
      where: { id },
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
      res.status(404).json({ error: 'Documento non trovato' });
      return;
    }

    res.status(200).json(channel);
  } catch (error) {
    console.error('Errore durante il recupero del documento:', error);
    res.status(500).json({ error: 'Errore durante il recupero del documento' });
  }
}

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const {name, ...createFields} = req.body;

      if (name) {
        const existingDoc: Channel | null = await Channel.findOne({
          where: {name},
        });

        if (existingDoc) {
          res.status(409).json({error: 'Il campo "nome" è già utilizzato da un altro documento'});
          return;
        }
      } else {
        res.status(400).json({error: 'Il campo "nome" è obbligatorio'});
        return;
      }

      const newDoc: Channel = await Channel.create({name, ...createFields});

      res.status(201).json(newDoc);
    } catch (error) {
      console.error('Errore durante la creazione del documento:', error);
      res.status(500).json({error: 'Errore durante la creazione del documento'});
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    const id: number = parseInt(req.params['id'], 10);
    if (isNaN(id)) {
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
        const existingDoc = await Channel.findOne({
          where: {
            name,
            id: {[Op.ne]: id}, // Esclude il record corrente
          },
        });

        if (existingDoc) {
          res.status(409).json({error: 'Il campo "nome" è già utilizzato da un altro documento'});
          return;
        }
      }

      // Aggiorna il documento
      await doc.update({name, ...updateFields});
      res.status(200).json(doc);
    } catch (error) {
      console.error('Errore durante l\'aggiornamento del documento:', error);
      res.status(500).json({error: 'Errore durante l\'aggiornamento del documento'});
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    const id: number = parseInt(req.params['id'], 10);
    if (isNaN(id)) {
      res.status(400).json({error: 'ID non valido'});
      return;
    }

    try {
      const result: number = await Channel.destroy({where: {id}});
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
