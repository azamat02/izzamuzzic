import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import sharp from 'sharp';
import type { Request, Response, NextFunction } from 'express';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const uploadsDir = path.join(__dirname, '..', '..', 'uploads');

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = crypto.randomUUID();
    cb(null, `${name}${ext}`);
  },
});

const imageFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/x-icon', 'image/vnd.microsoft.icon', 'image/svg+xml'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

const videoFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = ['video/mp4', 'video/webm', 'video/quicktime'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only video files are allowed (mp4, webm, mov)'));
  }
};

export const upload = multer({
  storage,
  fileFilter: imageFilter,
  limits: {}
});

export const videoUpload = multer({
  storage,
  fileFilter: videoFilter,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
});

export function wrapMulterMiddleware(
  middleware: (req: Request, res: Response, cb: (err: any) => void) => void
) {
  return (req: Request, res: Response, next: NextFunction) => {
    middleware(req, res, (err: any) => {
      if (!err) return next();

      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          res.status(413).json({ error: 'File too large' });
          return;
        }
        res.status(400).json({ error: err.message });
        return;
      }

      if (err instanceof Error) {
        res.status(400).json({ error: err.message });
        return;
      }

      res.status(500).json({ error: 'Upload failed' });
    });
  };
}

export const handleImageUpload = wrapMulterMiddleware(upload.single('file'));
export const handleVideoUpload = wrapMulterMiddleware(videoUpload.single('file'));

export async function generateThumbnail(filename: string): Promise<string> {
  const ext = path.extname(filename);
  const base = path.basename(filename, ext);
  const thumbFilename = `thumb_${base}.jpg`;
  const inputPath = path.join(uploadsDir, filename);
  const outputPath = path.join(uploadsDir, thumbFilename);

  await sharp(inputPath)
    .resize(800, undefined, { withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toFile(outputPath);

  return thumbFilename;
}
