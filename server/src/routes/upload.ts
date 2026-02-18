import { Router } from 'express';
import crypto from 'crypto';
import { authMiddleware } from '../middleware/auth.js';
import { handleImageUpload, handleVideoUpload, generateThumbnail } from '../utils/upload.js';
import { compressImage, compressVideo } from '../utils/compress.js';
import type { VideoPreset, CompressResult } from '../utils/compress.js';

const router = Router();

// In-memory job tracking for async video compression
interface CompressionJob {
  status: 'compressing' | 'done' | 'error';
  progress: number;
  result?: CompressResult & { url: string };
  error?: string;
}

const compressionJobs = new Map<string, CompressionJob>();

router.post('/video', authMiddleware, handleVideoUpload, (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'No video uploaded' });
    return;
  }

  const compressPreset = req.body?.compressPreset as VideoPreset | undefined;

  if (compressPreset && ['light', 'medium', 'heavy'].includes(compressPreset)) {
    const jobId = crypto.randomUUID();
    const filename = req.file.filename;

    compressionJobs.set(jobId, { status: 'compressing', progress: 0 });

    compressVideo(filename, compressPreset, (percent) => {
      const job = compressionJobs.get(jobId);
      if (job) job.progress = percent;
    })
      .then((result) => {
        compressionJobs.set(jobId, {
          status: 'done',
          progress: 100,
          result: { ...result, url: `/uploads/${result.filename}` },
        });
      })
      .catch((err) => {
        compressionJobs.set(jobId, {
          status: 'error',
          progress: 0,
          error: err instanceof Error ? err.message : 'Compression failed',
        });
      });

    res.json({ jobId, compressing: true });
    return;
  }

  const url = `/uploads/${req.file.filename}`;
  res.json({ url, filename: req.file.filename });
});

router.get('/video/status/:jobId', authMiddleware, (req, res) => {
  const jobId = req.params.jobId as string;
  const job = compressionJobs.get(jobId);
  if (!job) {
    res.status(404).json({ error: 'Job not found' });
    return;
  }

  res.json({
    status: job.status,
    progress: job.progress,
    result: job.result,
    error: job.error,
  });

  // Clean up completed/failed jobs after retrieval
  if (job.status === 'done' || job.status === 'error') {
    compressionJobs.delete(jobId);
  }
});

router.post('/', authMiddleware, handleImageUpload, async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }

  let filename = req.file.filename;
  let compressionResult: CompressResult | undefined;

  const compressQuality = req.body?.compressQuality
    ? parseInt(req.body.compressQuality, 10)
    : undefined;
  const compressMaxWidth = req.body?.compressMaxWidth
    ? parseInt(req.body.compressMaxWidth, 10)
    : undefined;

  if (compressQuality || compressMaxWidth) {
    try {
      compressionResult = await compressImage(filename, {
        quality: compressQuality,
        maxWidth: compressMaxWidth,
      });
      filename = compressionResult.filename;
    } catch {
      // Non-fatal: compression failed, use original
    }
  }

  const url = `/uploads/${filename}`;

  try {
    await generateThumbnail(filename);
  } catch {
    // Non-fatal: thumbnail generation failed, original still works
  }

  res.json({
    url,
    filename,
    ...(compressionResult && {
      originalSize: compressionResult.originalSize,
      compressedSize: compressionResult.compressedSize,
    }),
  });
});

// Public receipt upload with optional external validation
router.post('/receipt', handleImageUpload, async (req, res) => {
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
