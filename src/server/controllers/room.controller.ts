import { AppDataSource } from '../database/dataSource';
import { Room } from '../entity/room.entity';
import { Request, Response } from 'express';

export class RoomController {

  static roomRepository = AppDataSource.getRepository(Room);
  
  static async findAllRooms(req: Request, res: Response): Promise<void> {
    try {
      const rooms = await RoomController.roomRepository.find();
      res.status(200).json(rooms);
    } catch (error) {
      res.status(500).json({ error: 'Errore durante il recupero delle stanze' });
    }
  }

  static async findRoomById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const room = await RoomController.roomRepository.findOneBy({ id });
      if (room) {
        res.status(200).json(room);
      } else {
        res.status(404).json({ error: 'Stanza non trovata' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Errore durante il recupero della stanza' });
    }
  }

  static async createRoom(req: Request, res: Response): Promise<void> {
    try {
      const room = RoomController.roomRepository.create(req.body);
      const savedRoom = await RoomController.roomRepository.save(room);
      res.status(201).json(savedRoom);
    } catch (error) {
      res.status(500).json({ error: 'Errore durante la creazione della stanza' });
    }
  }

  static async updateRoom(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      let room = await RoomController.roomRepository.findOneBy({ id });
      if (room) {
        RoomController.roomRepository.merge(room, req.body);
        const updatedRoom = await RoomController.roomRepository.save(room);
        res.status(200).json(updatedRoom);
      } else {
        res.status(404).json({ error: 'Stanza non trovata' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Errore durante l\'aggiornamento della stanza' });
    }
  }

  static async deleteRoom(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const result = await RoomController.roomRepository.delete(id);
      if (result.affected) {
        res.status(200).json({ message: 'Stanza eliminata con successo' });
      } else {
        res.status(404).json({ error: 'Stanza non trovata' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Errore durante l\'eliminazione della stanza' });
    }
  }

}
