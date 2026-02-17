import { Router } from 'express';
import { db, schema } from '../db/index.js';
import { eq, asc } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// ============ ABOUT ============
router.get('/about', (_req, res) => {
  const data = db.select().from(schema.aboutContent).get();
  res.json(data || null);
});

router.put('/about', authMiddleware, (req, res) => {
  const existing = db.select().from(schema.aboutContent).get();
  if (existing) {
    db.update(schema.aboutContent).set(req.body).where(eq(schema.aboutContent.id, existing.id)).run();
  } else {
    db.insert(schema.aboutContent).values(req.body).run();
  }
  const data = db.select().from(schema.aboutContent).get();
  res.json(data);
});

// ============ RELEASES ============
router.get('/releases', (_req, res) => {
  const data = db.select().from(schema.releases).orderBy(asc(schema.releases.sortOrder)).all();
  res.json(data);
});

router.post('/releases', authMiddleware, (req, res) => {
  const result = db.insert(schema.releases).values(req.body).returning().get();
  res.status(201).json(result);
});

router.put('/releases/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  db.update(schema.releases).set(req.body).where(eq(schema.releases.id, id)).run();
  const data = db.select().from(schema.releases).where(eq(schema.releases.id, id)).get();
  res.json(data);
});

router.delete('/releases/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  db.delete(schema.releases).where(eq(schema.releases.id, id)).run();
  res.json({ success: true });
});

// ============ MUSIC SETTINGS ============
router.get('/music-settings', (_req, res) => {
  const data = db.select().from(schema.musicSettings).get();
  res.json(data || null);
});

router.put('/music-settings', authMiddleware, (req, res) => {
  const existing = db.select().from(schema.musicSettings).get();
  if (existing) {
    db.update(schema.musicSettings).set(req.body).where(eq(schema.musicSettings.id, existing.id)).run();
  } else {
    db.insert(schema.musicSettings).values(req.body).run();
  }
  const data = db.select().from(schema.musicSettings).get();
  res.json(data);
});

// ============ GALLERY ============
router.get('/gallery', (_req, res) => {
  const data = db.select().from(schema.galleryImages).orderBy(asc(schema.galleryImages.sortOrder)).all();
  res.json(data);
});

router.post('/gallery', authMiddleware, (req, res) => {
  const result = db.insert(schema.galleryImages).values(req.body).returning().get();
  res.status(201).json(result);
});

router.put('/gallery/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  db.update(schema.galleryImages).set(req.body).where(eq(schema.galleryImages.id, id)).run();
  const data = db.select().from(schema.galleryImages).where(eq(schema.galleryImages.id, id)).get();
  res.json(data);
});

router.delete('/gallery/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  db.delete(schema.galleryImages).where(eq(schema.galleryImages.id, id)).run();
  res.json({ success: true });
});

// ============ MERCH ============
router.get('/merch', (_req, res) => {
  const data = db.select().from(schema.merchItems).orderBy(asc(schema.merchItems.sortOrder)).all();
  res.json(data);
});

router.post('/merch', authMiddleware, (req, res) => {
  const result = db.insert(schema.merchItems).values(req.body).returning().get();
  res.status(201).json(result);
});

router.put('/merch/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  db.update(schema.merchItems).set(req.body).where(eq(schema.merchItems.id, id)).run();
  const data = db.select().from(schema.merchItems).where(eq(schema.merchItems.id, id)).get();
  res.json(data);
});

router.delete('/merch/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  db.delete(schema.merchItems).where(eq(schema.merchItems.id, id)).run();
  res.json({ success: true });
});

// ============ TOUR DATES ============
router.get('/tours', (_req, res) => {
  const data = db.select().from(schema.tourDates).orderBy(asc(schema.tourDates.date)).all();
  res.json(data);
});

router.post('/tours', authMiddleware, (req, res) => {
  const result = db.insert(schema.tourDates).values(req.body).returning().get();
  res.status(201).json(result);
});

router.put('/tours/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  db.update(schema.tourDates).set(req.body).where(eq(schema.tourDates.id, id)).run();
  const data = db.select().from(schema.tourDates).where(eq(schema.tourDates.id, id)).get();
  res.json(data);
});

router.delete('/tours/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  db.delete(schema.tourDates).where(eq(schema.tourDates.id, id)).run();
  res.json({ success: true });
});

// ============ PRESS ============
router.get('/press', (_req, res) => {
  const data = db.select().from(schema.pressItems).all();
  res.json(data);
});

router.post('/press', authMiddleware, (req, res) => {
  const result = db.insert(schema.pressItems).values(req.body).returning().get();
  res.status(201).json(result);
});

router.put('/press/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  db.update(schema.pressItems).set(req.body).where(eq(schema.pressItems.id, id)).run();
  const data = db.select().from(schema.pressItems).where(eq(schema.pressItems.id, id)).get();
  res.json(data);
});

router.delete('/press/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  db.delete(schema.pressItems).where(eq(schema.pressItems.id, id)).run();
  res.json({ success: true });
});

// ============ CONTACT CATEGORIES ============
router.get('/contact-categories', (_req, res) => {
  const data = db.select().from(schema.contactCategories).orderBy(asc(schema.contactCategories.sortOrder)).all();
  res.json(data);
});

router.post('/contact-categories', authMiddleware, (req, res) => {
  const result = db.insert(schema.contactCategories).values(req.body).returning().get();
  res.status(201).json(result);
});

router.put('/contact-categories/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  db.update(schema.contactCategories).set(req.body).where(eq(schema.contactCategories.id, id)).run();
  const data = db.select().from(schema.contactCategories).where(eq(schema.contactCategories.id, id)).get();
  res.json(data);
});

router.delete('/contact-categories/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  db.delete(schema.contactCategories).where(eq(schema.contactCategories.id, id)).run();
  res.json({ success: true });
});

// ============ CONTACT SETTINGS ============
router.get('/contact-settings', (_req, res) => {
  const data = db.select().from(schema.contactSettings).get();
  res.json(data || null);
});

router.put('/contact-settings', authMiddleware, (req, res) => {
  const existing = db.select().from(schema.contactSettings).get();
  if (existing) {
    db.update(schema.contactSettings).set(req.body).where(eq(schema.contactSettings.id, existing.id)).run();
  } else {
    db.insert(schema.contactSettings).values(req.body).run();
  }
  const data = db.select().from(schema.contactSettings).get();
  res.json(data);
});

// ============ SOCIAL LINKS ============
router.get('/socials', (_req, res) => {
  const data = db.select().from(schema.socialLinks).orderBy(asc(schema.socialLinks.sortOrder)).all();
  res.json(data);
});

router.post('/socials', authMiddleware, (req, res) => {
  const result = db.insert(schema.socialLinks).values(req.body).returning().get();
  res.status(201).json(result);
});

router.put('/socials/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  db.update(schema.socialLinks).set(req.body).where(eq(schema.socialLinks.id, id)).run();
  const data = db.select().from(schema.socialLinks).where(eq(schema.socialLinks.id, id)).get();
  res.json(data);
});

router.delete('/socials/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  db.delete(schema.socialLinks).where(eq(schema.socialLinks.id, id)).run();
  res.json({ success: true });
});

// ============ NAVIGATION ============
router.get('/navigation', (_req, res) => {
  const data = db.select().from(schema.navigationItems).orderBy(asc(schema.navigationItems.sortOrder)).all();
  res.json(data);
});

router.post('/navigation', authMiddleware, (req, res) => {
  const result = db.insert(schema.navigationItems).values(req.body).returning().get();
  res.status(201).json(result);
});

router.put('/navigation/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  db.update(schema.navigationItems).set(req.body).where(eq(schema.navigationItems.id, id)).run();
  const data = db.select().from(schema.navigationItems).where(eq(schema.navigationItems.id, id)).get();
  res.json(data);
});

router.delete('/navigation/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  db.delete(schema.navigationItems).where(eq(schema.navigationItems.id, id)).run();
  res.json({ success: true });
});

// ============ SITE SETTINGS ============
router.get('/settings', (_req, res) => {
  const data = db.select().from(schema.siteSettings).all();
  const result: Record<string, string> = {};
  for (const s of data) {
    result[s.key] = s.value;
  }
  res.json(result);
});

router.put('/settings', authMiddleware, (req, res) => {
  const settings = req.body as Record<string, string>;
  for (const [key, value] of Object.entries(settings)) {
    const existing = db.select().from(schema.siteSettings).where(eq(schema.siteSettings.key, key)).get();
    if (existing) {
      db.update(schema.siteSettings).set({ value }).where(eq(schema.siteSettings.id, existing.id)).run();
    } else {
      db.insert(schema.siteSettings).values({ key, value }).run();
    }
  }
  const data = db.select().from(schema.siteSettings).all();
  const result: Record<string, string> = {};
  for (const s of data) {
    result[s.key] = s.value;
  }
  res.json(result);
});

export default router;
