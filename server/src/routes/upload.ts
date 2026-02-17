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

// Public receipt upload with optional external validation
router.post('/receipt', upload.single('file'), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }
  const url = `/uploads/${req.file.filename}`;

  const apiUrl = process.env.RECEIPT_API_URL;
  const apiToken = process.env.RECEIPT_API_TOKEN;

  // If external validation API is configured, send the file for validation
  if (apiUrl) {
    try {
      const formData = new FormData();
      const fileBuffer = await import('fs').then(fs => fs.readFileSync(req.file!.path));
      const blob = new Blob([fileBuffer], { type: req.file!.mimetype });
      formData.append('file', blob, req.file!.originalname);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: apiToken ? { Authorization: `Bearer ${apiToken}` } : {},
        body: formData,
      });

      if (response.ok) {
        const result = await response.json() as { valid?: boolean };
        res.json({ url, valid: result.valid ?? null });
        return;
      }
    } catch {
      // API unavailable — fallback to pending
    }
  }

  // Fallback: no validation API — return pending
  res.json({ url, valid: null });
});

export default router;
