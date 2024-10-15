import {Request, Response} from 'express';
import {DeleteResult, Repository} from 'typeorm';
import {AppDataSource} from '../database/dataSource';
import {User} from '../entity/user.entity'; // Assicurati di importare l'entità User
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
export const {JWT_SECRET = ''} = process.env;

export class UserController {
  static userRepository: Repository<User> = AppDataSource.getRepository(User);

  // Registrazione
  static async register(req: Request, res: Response): Promise<Response> {
    const {name, lastname, email, password} = req.body;

    try {
      // Verifica se l'email è già registrata
      const existingUser: User | null = await UserController.userRepository.findOneBy({email});
      if (existingUser) {
        return res.status(400).json({error: 'Email già registrata'});
      }

      // Cripta la password
      const hashedPassword: string = await bcrypt.hash(password, 10);
      const user: User = UserController.userRepository.create({
        name,
        lastname,
        email,
        password: hashedPassword,
      });

      const savedUser: User = await UserController.userRepository.save(user);
      return res.status(201).json({message: 'Utente registrato con successo', user: savedUser});
    } catch (error) {
      return res.status(500).json({error: 'Errore durante la registrazione'});
    }
  }

  // Login
  static async login(req: Request, res: Response): Promise<Response> {
    const {email, password} = req.body;

    try {
      const user: User | null = await UserController.userRepository.findOneBy({email});
      console.log(user ? user.password : '');
      console.log(await bcrypt.hash(password, 10));
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({error: 'Credenziali non valide'});
      }

      // Genera il token JWT
      const accessToken: string = jwt.sign({id: user.id, email: user.email}, JWT_SECRET, {expiresIn: '4h'});
      const refreshToken: string = jwt.sign({id: user.id}, JWT_SECRET, {expiresIn: '7d'});

      // Salva il refresh token nell'utente
      user.refreshToken = refreshToken;
      user.currentToken = accessToken;
      await UserController.userRepository.save(user);

      return res.json({accessToken: accessToken, refreshToken});
    } catch (error) {
      return res.status(500).json({error: 'Errore durante il login'});
    }
  }

  // Refresh Token
  static async refresh(req: Request, res: Response): Promise<Response> {
    const {refreshToken} = req.body;

    if (!refreshToken) {
      return res.sendStatus(401);
    }

    const user: User | null = await UserController.userRepository.findOneBy({refreshToken});

    if (!user) {
      return res.sendStatus(403);
    }

    try {
      jwt.verify(refreshToken, JWT_SECRET);

      const newAccessToken: string = jwt.sign({id: user.id, email: user.email}, JWT_SECRET, {expiresIn: '1h'});
      const newRefreshToken: string = jwt.sign({id: user.id}, JWT_SECRET, {expiresIn: '7d'});

      // Aggiorna il refresh token nel database
      user.refreshToken = newRefreshToken;
      await UserController.userRepository.save(user);

      return res.json({accessToken: newAccessToken, refreshToken: newRefreshToken});
    } catch (err) {
      return res.sendStatus(403);
    }
  }

  // Logout
  static async logout(req: Request, res: Response): Promise<Response> {
    const {refreshToken} = req.body;

    if (!refreshToken) {
      return res.sendStatus(401);
    }

    const user: User | null = await UserController.userRepository.findOneBy({refreshToken});

    if (!user) {
      return res.sendStatus(403); // Forbidden
    }

    // Revoca il refresh token
    user.refreshToken = null;
    user.currentToken = null;
    await UserController.userRepository.save(user);
    return res.sendStatus(204); // No Content
  }

  static async findAll(req: Request, res: Response): Promise<void> {
    try {
      const docs: User[] = await UserController.userRepository.find();
      res.status(200).json(docs);
    } catch (error) {
      res.status(500).json({error: 'Errore durante il recupero dei documenti'});
    }
  }

  static async findById(req: Request, res: Response): Promise<void> {
    const {id} = req.params;
    try {
      const doc: User | null = await UserController.userRepository.findOneBy({id});
      if (doc) {
        res.status(200).json(doc);
      } else {
        res.status(404).json({error: 'Documento non trovata'});
      }
    } catch (error) {
      res.status(500).json({error: `Errore durante la creazione del documento: ${error}`});
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    const {email, password} = req.body;

    try {

      const existingUser: User | null = await UserController.userRepository.findOneBy({email});
      if (existingUser) {
        res.status(400).json({error: 'Email già registrata'});
        return;
      }

      // Cripta la password
      const hashedPassword: string = await bcrypt.hash(password, 10);
      if (!hashedPassword) {
        res.status(500).json({error: 'Errore durante la criptazione della password'});
        return;
      }

      req.body.password = hashedPassword;

      const doc: User[] = UserController.userRepository.create(req.body);
      const savedDoc: User[] = await UserController.userRepository.save(doc);
      res.status(200).json(savedDoc);
    } catch (error) {
      res.status(500).json({error: 'Errore durante la creazione del documento'});
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    const {id} = req.params;
    try {
      let doc: User | null = await UserController.userRepository.findOneBy({id});
      if (doc) {
        UserController.userRepository.merge(doc, req.body);
        const updatedDoc: User = await UserController.userRepository.save(doc);
        res.status(200).json(updatedDoc);
      } else {
        res.status(404).json({error: 'Documento non trovato'});
      }
    } catch (error) {
      res.status(500).json({error: 'Errore durante l\'aggiornamento del documento'});
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    const {id} = req.params;
    console.log(`ID da cancellare: ${id}`)
    try {
      const result: DeleteResult = await UserController.userRepository.delete(id);
      if (result.affected) {
        res.status(200).json({message: 'Documento eliminato con successo'});
      } else {
        res.status(404).json({error: 'Documento non trovato'});
      }
    } catch (error) {
      res.status(500).json({error: 'Errore durante l\'eliminazione della documento'});
    }
  }
}
