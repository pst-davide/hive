import { Request, Response } from 'express';
import { Room } from '../models/room.model';
import {Branch} from '../models/branch.model';
import logger from '../utils/logger';

export class RoomController {

  static async findAll(req: Request, res: Response): Promise<void> {
    logger.info('Recupero di tutte le stanze');

    try {
      const { branchId } = req.query;
      const whereCondition: any = branchId ? { branchId } : {};

      const rooms: Room[] = await Room.findAll({
        where: whereCondition,
        include: [
          {
            model: Branch,
            required: true,
          },
        ],
      });

      const roomsWithLocationName: any[] = rooms.map((room: any) => ({
        ...room.toJSON(),
        locationName: room.branch?.name,
        locationColor: room.branch?.color,
      }));

      res.status(200).json(roomsWithLocationName);
    } catch (error: any) {
      logger.error('Errore durante il recupero delle stanze:', { error: error.message });
      res.status(500).json({ error: 'Errore durante il recupero delle stanze' });
    }
  }

  static async findById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    logger.info(`Recupero della stanza con ID: ${id}`);

    try {
      const room: Room | null = await Room.findOne({
        where: { id },
        include: [
          {
            model: Branch,
            required: true,
          },
        ],
      });

      if (room) {
        res.status(200).json(room);
      } else {
        logger.warn(`Stanza con ID: ${id} non trovata`);
        res.status(404).json({ error: 'Stanza non trovata' });
      }
    } catch (error: any) {
      logger.error(`Errore durante il recupero della stanza con ID: ${id}`, { error: error.message });
      res.status(500).json({ error: 'Errore durante il recupero della stanza' });
    }
  }

  static async findByLocation(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    logger.info(`Recupero delle stanze per la sede con ID: ${id}`);

    try {
      const room: Room | null = await Room.findOne({
        where: {
          branchId: id,
        },
        include: [
          {
            model: Branch,
            required: true,
          },
        ],
      });

      if (room) {
        const roomWithLocation = {
          ...room.toJSON(),
          locationName: room.branch?.name,
          locationColor: room.branch?.color,
        };

        logger.info('Stanza trovata:', roomWithLocation);
        res.status(200).json(roomWithLocation);
      } else {
        logger.warn(`Nessuna stanza trovata per la sede con ID: ${id}`);
        res.status(200).json({ message: 'Nessuna stanza trovata per questa sede.' });
      }
    } catch (error: any) {
      logger.error(`Errore durante il recupero delle stanze per la sede con ID: ${id}`, { error: error.message });
      res.status(500).json({ message: 'Errore durante il recupero delle stanze per la sede.' });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    logger.info('Creazione di una nuova stanza');

    try {
      const room: Room = await Room.create(req.body);
      logger.info('Stanza creata con successo:', room.toJSON());
      res.status(200).json(room);
    } catch (error: any) {
      logger.error('Errore durante la creazione della stanza:', { error: error.message });
      res.status(500).json({ error: 'Errore durante la creazione della stanza' });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    logger.info(`Aggiornamento della stanza con ID: ${id}`);

    try {
      const room: Room | null = await Room.findOne({
        where: { id },
      });

      if (room) {
        await room.update(req.body);
        logger.info(`Stanza con ID: ${id} aggiornata con successo`);
        res.status(200).json(room);
      } else {
        logger.warn(`Stanza con ID: ${id} non trovata`);
        res.status(404).json({ error: 'Stanza non trovata' });
      }
    } catch (error: any) {
      logger.error(`Errore durante l'aggiornamento della stanza con ID: ${id}`, { error: error.message });
      res.status(500).json({ error: 'Errore durante l\'aggiornamento della stanza' });
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    logger.info(`Eliminazione della stanza con ID: ${id}`);

    try {
      const result: number = await Room.destroy({
        where: { id },
      });

      if (result) {
        logger.info(`Stanza con ID: ${id} eliminata con successo`);
        res.status(200).json({ message: 'Stanza eliminata con successo' });
      } else {
        logger.warn(`Stanza con ID: ${id} non trovata`);
        res.status(404).json({ error: 'Stanza non trovata' });
      }
    } catch (error: any) {
      logger.error(`Errore durante l'eliminazione della stanza con ID: ${id}`, { error: error.message });
      res.status(500).json({ error: 'Errore durante l\'eliminazione della stanza' });
    }
  }
}
