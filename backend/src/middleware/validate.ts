import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';

export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        const issues = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
        return res.status(400).json({ error: `Données invalides : ${issues}` });
      }
      return res.status(400).json({ error: 'Payload de requête invalide.' });
    }
  };
};

export const commentSchema = z.object({
  authorName: z.string().min(1, 'Le nom est requis').max(100, 'Le nom ne peut excéder 100 caractères'),
  authorEmail: z.string().email('Adresse email invalide').optional().or(z.literal('')),
  message: z.string().min(1, 'Le message est requis').max(1000, 'Le message ne peut excéder 1000 caractères'),
});

export const reportSchema = z.object({
  type: z.enum(['album', 'user_page', 'photo'], { invalid_type_error: 'Type de signalement invalide' }),
  targetId: z.string().min(1, 'ID cible requis'),
  reason: z.string().min(3, 'La raison doit contenir au moins 3 caractères').max(500, 'La raison ne peut excéder 500 caractères'),
});
