import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import sharp from 'sharp';

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
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
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
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

export const videoUpload = multer({
  storage,
  fileFilter: videoFilter,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
});

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
