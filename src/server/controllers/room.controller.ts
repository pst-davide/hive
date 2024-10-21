import {AppDataSource} from '../database/dataSource';
import {Room} from '../entity/room.entity';
import {Request, Response} from 'express';
import {DeleteResult, Repository} from 'typeorm';

export class RoomController {

  static roomRepository: Repository<Room> = AppDataSource.getRepository(Room);

  static async findAll(req: Request, res: Response): Promise<void> {
    try {
      const {branchId} = req.query;
      const whereCondition = branchId ? {branch: {id: branchId as string}} : {};

      const rooms: Room[] = await RoomController.roomRepository.find({
        relations: ['branch'],
        where: whereCondition,
      });

      const roomsWithLocationName: any[] = rooms.map((room: Room) => ({
        ...room,
        locationName: room.branch?.name,
        locationColor: room.branch?.color,
      }));

      res.status(200).json(roomsWithLocationName);

    } catch (error) {
      res.status(500).json({error: 'Errore durante il recupero delle stanze'});
    }
  }

  static async findById(req: Request, res: Response): Promise<void> {
    const {id} = req.params;
    try {
      const room: Room | null = await RoomController.roomRepository.findOneBy({id});
      if (room) {
        res.status(200).json(room);
      } else {
        res.status(404).json({error: 'Stanza non trovata'});
      }
    } catch (error) {
      res.status(500).json({error: `Errore durante la creazione della stanza: ${error}`});
    }
  }

  static async findByLocation(req: Request, res: Response): Promise<Response> {
    const {id} = req.params;

    try {
      const room: Room | null = await RoomController.roomRepository.createQueryBuilder('room')
        .leftJoinAndSelect('room.location', 'location')
        .where('room.locationId = :locationId', {locationId: id})
        .limit(1)
        .getOne();

      if (!room) {
        console.log('Nessuna stanza trovata.');
        return res.status(200).json({message: 'Nessuna stanza trovata per questa sede.'});
      }

      const roomWithLocation: any = {
        ...room,
        locationName: room.branch.name,
        locationColor: room.branch.color,
      };

      console.log('Stanza trovata:', roomWithLocation);
      return res.status(200).json(roomWithLocation);
    } catch (error) {
      console.error('Errore nel recuperare le stanze per la location:', error);
      return res.status(500).json({message: 'Errore nel recuperare le stanze per la location.'});
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    console.log(req.body)
    try {
      const room: Room[] = RoomController.roomRepository.create(req.body);
      const savedRoom: Room[] = await RoomController.roomRepository.save(room);
      res.status(200).json(savedRoom);
    } catch (error) {
      res.status(500).json({error: 'Errore durante la creazione della stanza'});
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    const {id} = req.params;
    try {
      let room: Room | null = await RoomController.roomRepository.findOneBy({id});
      if (room) {
        RoomController.roomRepository.merge(room, req.body);
        const updatedRoom = await RoomController.roomRepository.save(room);
        res.status(200).json(updatedRoom);
      } else {
        res.status(404).json({error: 'Stanza non trovata'});
      }
    } catch (error) {
      res.status(500).json({error: 'Errore durante l\'aggiornamento della stanza'});
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    const {id} = req.params;
    try {
      const result: DeleteResult = await RoomController.roomRepository.delete(id);
      if (result.affected) {
        res.status(200).json({message: 'Stanza eliminata con successo'});
      } else {
        res.status(404).json({error: 'Stanza non trovata'});
      }
    } catch (error) {
      res.status(500).json({error: 'Errore durante l\'eliminazione della stanza'});
    }
  }

}
