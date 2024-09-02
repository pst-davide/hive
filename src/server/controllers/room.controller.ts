import { AppDataSource } from '../database/dataSource';
import { Room } from '../entity/room.entity';
import { Request, Response } from 'express';
import {DeleteResult, Repository} from 'typeorm';

export class RoomController {

  static roomRepository: Repository<Room> = AppDataSource.getRepository(Room);

  static async findAllRooms(req: Request, res: Response): Promise<void> {
    try {
      const rooms: Room[] = await RoomController.roomRepository.find();
      res.status(200).json(rooms);
    } catch (error) {
      res.status(500).json({ error: 'Errore durante il recupero delle stanze' });
    }
  }

  static async findRoomById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const room: Room | null = await RoomController.roomRepository.findOneBy({ id });
      if (room) {
        res.status(200).json(room);
      } else {
        res.status(404).json({ error: 'Stanza non trovata' });
      }
    } catch (error) {
      res.status(500).json({ error: `Errore durante la creazione della stanza: ${error}` });
    }
  }

  static async createRoom(req: Request, res: Response): Promise<void> {
    console.log(req.body)
    try {
      const room: Room[] = RoomController.roomRepository.create(req.body);
      const savedRoom: Room[] = await RoomController.roomRepository.save(room);
      res.status(200).json(savedRoom);
    } catch (error) {
      res.status(500).json({ error: 'Errore durante la creazione della stanza' });
    }
  }

  static async updateRoom(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      let room: Room | null = await RoomController.roomRepository.findOneBy({ id });
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
      const result: DeleteResult = await RoomController.roomRepository.delete(id);
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
