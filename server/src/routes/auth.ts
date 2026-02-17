import { Router } from 'express';
import { db, schema } from '../db/index.js';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
const { compareSync } = bcrypt;
import { signToken, authMiddleware } from '../middleware/auth.js';

const router = Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: 'Username and password required' });
    return;
  }

  const user = db.select().from(schema.adminUsers).where(eq(schema.adminUsers.username, username)).get();
  if (!user || !compareSync(password, user.passwordHash)) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const token = signToken({ id: user.id, username: user.username });
  res.json({ token });
});

router.get('/verify', authMiddleware, (_req, res) => {
  res.json({ valid: true });
});

export default router;
