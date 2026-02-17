import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import contentRoutes from './routes/content.js';
import uploadRoutes from './routes/upload.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(cors());
app.use(express.json());

// Rate limiting for auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts, try again later' },
});
app.use('/api/auth/login', authLimiter);

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api', contentRoutes);
app.use('/api/upload', uploadRoutes);

// Production: serve client build
const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
app.use(express.static(clientDist));
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
