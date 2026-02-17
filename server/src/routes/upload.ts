import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { upload } from '../utils/upload.js';

const router = Router();

router.post('/', authMiddleware, upload.single('file'), (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }
  const url = `/uploads/${req.file.filename}`;
  res.json({ url, filename: req.file.filename });
});

export default router;
