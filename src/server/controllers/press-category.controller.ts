import { AppDataSource } from '../database/dataSource';
import { Request, Response } from 'express';
import {DeleteResult, Repository} from 'typeorm';
import {PressCategory} from "../entity/press-category.entity";

export class PressCategoryController {

  static roomRepository: Repository<PressCategory> = AppDataSource.getRepository(PressCategory);

  static async findAll(req: Request, res: Response): Promise<void> {
    try {
      const rooms: PressCategory[] = await PressCategoryController.roomRepository.find();
      res.status(200).json(rooms);
    } catch (error) {
      res.status(500).json({ error: 'Errore durante il recupero delle categorie' });
    }
  }

  static async findById(req: Request, res: Response): Promise<void> {
    const id: number = parseInt(req.params['id'], 10);

    if (isNaN(id)) { // Controllo se la conversione è fallita
      res.status(400).json({ error: 'ID non valido' });
      return;
    }

    try {
      const room: PressCategory | null = await PressCategoryController.roomRepository.findOneBy({ id });
      if (room) {
        res.status(200).json(room);
      } else {
        res.status(404).json({ error: 'Categoria non trovata' });
      }
    } catch (error) {
      res.status(500).json({ error: `Errore durante la creazione della categoria: ${error}` });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    console.log(req.body)
    try {
      const room: PressCategory[] = PressCategoryController.roomRepository.create(req.body);
      const savedRoom: PressCategory[] = await PressCategoryController.roomRepository.save(room);
      res.status(200).json(savedRoom);
    } catch (error) {
      res.status(500).json({ error: 'Errore durante la creazione della stanza' });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    const id: number = parseInt(req.params['id'], 10);

    if (isNaN(id)) { // Controllo se la conversione è fallita
      res.status(400).json({ error: 'ID non valido' });
      return;
    }

    try {
      let room: PressCategory | null = await PressCategoryController.roomRepository.findOneBy({ id });
      if (room) {
        PressCategoryController.roomRepository.merge(room, req.body);
        const updatedRoom = await PressCategoryController.roomRepository.save(room);
        res.status(200).json(updatedRoom);
      } else {
        res.status(404).json({ error: 'Categoria non trovata' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Errore durante l\'aggiornamento della categoria' });
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const result: DeleteResult = await PressCategoryController.roomRepository.delete(id);
      if (result.affected) {
        res.status(200).json({ message: 'Categoria eliminata con successo' });
      } else {
        res.status(404).json({ error: 'Categoria non trovata' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Errore durante l\'eliminazione della categoria' });
    }
  }

}
