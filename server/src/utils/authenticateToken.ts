import jwt, {JsonWebTokenError, TokenExpiredError} from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import {User} from '../models/user.model';

dotenv.config();
const { JWT_SECRET = '' } = process.env;

const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader: string | null = req.headers['authorization'] ?? null;
  const token: string | null = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // Se non c'è il token, restituisce uno status 401 e termina
    res.sendStatus(401);
    return;
  }

  try {
    const decoded: { id: string; email: string } = jwt.verify(token, JWT_SECRET) as { id: string; email: string };

    // Trova l'utente per ID e controlla se il token coincide con quello memorizzato
    const user: User | null = await User.findOne({ where: { id: decoded.id } });

    if (!user || user.currentToken !== token) {
      // Token non valido o già usato su un altro dispositivo
      res.sendStatus(403);  // Forbidden
      return;
    }

    // Salva le informazioni dell'utente nella richiesta per usarle più avanti
    (req as any).user = decoded;
    next();  // Passa al prossimo middleware o route handler
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      res.status(401).json({ message: 'Token expired' });
    } else if (err instanceof JsonWebTokenError) {
      res.status(403).json({ message: 'Token invalid' });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};

export default authenticateToken;
