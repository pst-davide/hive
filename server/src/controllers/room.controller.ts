import { Request, Response } from 'express';
import { Room } from '../models/room.model';
import {Branch} from '../models/branch.model';

export class RoomController {

  static async findAll(req: Request, res: Response): Promise<void> {
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
    } catch (error) {
      console.error('Errore durante il recupero delle stanze:', error);
      res.status(500).json({ error: 'Errore durante il recupero delle stanze' });
    }
  }

  static async findById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
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
        res.status(404).json({ error: 'Stanza non trovata' });
      }
    } catch (error) {
      res.status(500).json({ error: `Errore durante il recupero della stanza: ${error}` });
    }
  }

  static async findByLocation(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

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

      if (!room) {
        console.log('Nessuna stanza trovata.');
        res.status(200).json({ message: 'Nessuna stanza trovata per questa sede.' });
      }

      if (room) {
        const roomWithLocation = {
          ...room.toJSON(),
          locationName: room.branch?.name,
          locationColor: room.branch?.color,
        };

        console.log('Stanza trovata:', roomWithLocation);
        res.status(200).json(roomWithLocation);
      } else {
        res.status(500).json({ message: 'Errore nel recuperare le stanze per la location.' });
      }

    } catch (error) {
      console.error('Errore nel recuperare le stanze per la location:', error);
      res.status(500).json({ message: 'Errore nel recuperare le stanze per la location.' });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const room: Room = await Room.create(req.body);
      res.status(200).json(room);
    } catch (error) {
      console.error('Errore durante la creazione della stanza:', error);
      res.status(500).json({ error: 'Errore durante la creazione della stanza' });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const room: Room | null = await Room.findOne({
        where: { id },
      });

      if (room) {
        await room.update(req.body);
        res.status(200).json(room);
      } else {
        res.status(404).json({ error: 'Stanza non trovata' });
      }
    } catch (error) {
      console.error('Errore durante l\'aggiornamento della stanza:', error);
      res.status(500).json({ error: 'Errore durante l\'aggiornamento della stanza' });
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const result: number = await Room.destroy({
        where: { id },
      });

      if (result) {
        res.status(200).json({ message: 'Stanza eliminata con successo' });
      } else {
        res.status(404).json({ error: 'Stanza non trovata' });
      }
    } catch (error) {
      console.error('Errore durante l\'eliminazione della stanza:', error);
      res.status(500).json({ error: 'Errore durante l\'eliminazione della stanza' });
    }
  }
}
