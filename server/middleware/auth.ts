import { Request, Response, NextFunction } from 'express';
import { supabase } from '../index.js';

export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    (req as any).userId = user.id;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Authentication failed' });
  }
};
