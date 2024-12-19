import {Request, Response} from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import logger from '../utils/logger';
import {User} from '../models/user.model';

dotenv.config();
export const {JWT_SECRET = ''} = process.env;
const validRefreshTokens: Set<string> = new Set();

export class UserController {

  // Login
  static async login(req: Request, res: Response): Promise<void> {
    const {email, password} = req.body;
    logger.info(`Login dell\'utente con email: ${email}, dati ricevuti:`, req.body);

    try {
      const user: User | null = await User.findByPk(email);
      if (!user || !(await bcrypt.compare(password, user.password))) {
        logger.warn(`Login dell\'utente con email: ${email}, credenziali non valide`);
        res.status(401).json({error: 'Credenziali non valide'});
        return;
      }

      if (user && !user.enabled) {
        logger.warn(`Login dell\'utente con email: ${email}, utente non abilitato`);
        res.status(401).json({error: 'Utente non abilitato'});
        return;
      }

      // Genera il token JWT
      const accessToken: string = jwt.sign({id: user.id, email: user.email}, JWT_SECRET, {expiresIn: '4h'});
      const refreshToken: string = jwt.sign({id: user.id}, JWT_SECRET, {expiresIn: '7d'});

      // Salva il refresh token nell'utente
      user.refreshToken = refreshToken;
      user.currentToken = accessToken;
      await user.update(user);

      const responsePayload = {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          name: user.name,
          lastname: user.lastname,
          email: user.email,
          role: user.role,
        },
      };

      res.status(200).json(responsePayload);
    } catch (error: any) {
      logger.error('Errore durante il login', { error: error.message });
      res.status(500).json({error: 'Errore durante il login'});
      return;
    }
  }

  // Refresh Token
  static async refresh (req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        logger.warn(`Refresh token obbligatorio`);
        res.status(400).json({ error: 'Refresh token obbligatorio' });
        return;
      }

      // Controlla se il refresh token è valido
      if (!validRefreshTokens.has(refreshToken)) {
        logger.warn(`Refresh token non valido o scaduto`);
        res.status(401).json({ error: 'Refresh token non valido o scaduto' });
        return;
      }

      // Verifica il refresh token
      const decoded: {id: number} = jwt.verify(refreshToken, JWT_SECRET) as { id: number };

      const newAccessToken: string = jwt.sign(
        { id: decoded.id },
        JWT_SECRET,
        { expiresIn: '4h' }
      );

      const newRefreshToken: string = jwt.sign(
        { id: decoded.id },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      validRefreshTokens.delete(refreshToken);
      validRefreshTokens.add(newRefreshToken);

      res.status(200).json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
    } catch (error: any) {
      logger.error('Errore durante il refresh token:', { error: error.message });
      res.status(500).json({ error: 'Errore interno del server' });
    }
  };

  // Logout
  static async logout(req: Request, res: Response): Promise<void> {
    const {refreshToken} = req.body;

    if (!refreshToken) {
      logger.warn(`Refresh token obbligatorio`);
      res.status(400).json({ error: 'Refresh token obbligatorio' });
      return;
    }

    try {
      if (validRefreshTokens.has(refreshToken)) {
        validRefreshTokens.delete(refreshToken);
      }

      res.status(200).json({ message: 'Logout effettuato con successo' });
    } catch (error: any) {
      logger.error(`Errore durante il logout:`, { error: error.message });
      res.status(500).json({ error: 'Errore interno del server' });
    }
  }

  static async findAll(req: Request, res: Response): Promise<void> {
    logger.info('Recupero di tutti gli utenti');

    try {
      const docs: User[] = await User.findAll();
      res.status(200).json(docs);
    } catch (error: any) {
      logger.error('Errore durante il recupero degli utenti', { error: error.message });
      res.status(500).json({error: 'Errore durante il recupero dei documenti'});
    }
  }

  static async findById(req: Request, res: Response): Promise<void> {
    const {id} = req.params;
    logger.info(`Ottieni l\'utente con ID: ${id}`);

    try {
      const doc: User | null = await User.findByPk(id);
      if (doc) {
        res.status(200).json(doc);
      } else {
        logger.warn(`Utente con ID: ${id} non trovato`);
        res.status(404).json({error: 'Documento non trovata'});
      }
    } catch (error: any) {
      logger.error('Errore durante il recupero dell\'utente', { error: error.message });
      res.status(500).json({error: `Errore durante la creazione del documento: ${error}`});
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    const {email, password} = req.body;
    logger.info('Creazione di un nuovo utente con i dati:', req.body);

    try {

      const existingUser: User | null = await User.findByPk(email);
      if (existingUser) {
        logger.warn(`Utente con Email: ${email} già registrato`);
        res.status(400).json({error: 'Email già registrata'});
        return;
      }

      // Cripta la password
      const hashedPassword: string = await bcrypt.hash(password, 10);
      if (!hashedPassword) {
        logger.warn(`Utente con Email: ${email} errore durante la criptazione della password`);
        res.status(500).json({error: 'Errore durante la criptazione della password'});
        return;
      }

      req.body.password = hashedPassword;

      const doc: User = await User.create(req.body);
      res.status(200).json(doc);
    } catch (error: any) {
      logger.error('Errore durante la creazione dell\'utente', { error: error.message });
      res.status(500).json({error: 'Errore durante la creazione del documento'});
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    const {id} = req.params;
    logger.info(`Aggiornamento dell\'utente con ID: ${id}, dati ricevuti:`, req.body);

    try {
      let doc: User | null = await User.findByPk(id);
      if (doc) {
        // Filtrare i campi da aggiornare
        const { password, ...updateData } = req.body;

        await doc.update(updateData);
        logger.info(`Utente con ID: ${id} aggiornato con successo`);
        res.status(200).json(doc);
      } else {
        logger.warn(`Utente con ID: ${id} non trovato`);
        res.status(404).json({error: 'Documento non trovato'});
      }
    } catch (error: any) {
      logger.error('Errore durante la creazione dell\'utente', { error: error.message });
      res.status(500).json({error: 'Errore durante l\'aggiornamento del documento'});
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    const {id} = req.params;
    logger.info(`Eliminazione dell\'utente con ID: ${id}`);

    try {
      const result: number = await User.destroy({ where: { id } });
      if (result) {
        logger.info(`Utente con ID: ${id} eliminato con successo`);
        res.status(200).json({message: 'Documento eliminato con successo'});
      } else {
        logger.warn(`Utente con ID: ${id} non trovato per l\'eliminazione`);
        res.status(404).json({error: 'Documento non trovato'});
      }
    } catch (error: any) {
      logger.error(`Errore durante l'eliminazione dell\'utente con ID: ${id}:`, { error: error.message });
      res.status(500).json({error: 'Errore durante l\'eliminazione della documento'});
    }
  }

}
