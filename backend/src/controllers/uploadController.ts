import { Request, Response, NextFunction } from 'express';

export const uploadCover = (req: Request, res: Response, next: NextFunction) => {
  if (!req.file || !('path' in req.file)) {
    res.status(400).json({ error: 'No se subió ninguna imagen.' });
    return;
  }
  // @ts-ignore
  res.json({ coverImageUrl: req.file.path });
  return;
};

export const uploadGallery = (req: Request, res: Response, next: NextFunction) => {
  if (!req.files || !Array.isArray(req.files)) {
    res.status(400).json({ error: 'No se subieron imágenes.' });
    return;
  }
  // @ts-ignore
  const imageUrls = req.files.map((file) => file.path);
  res.json({ imageUrls });
  return;
};
