import { Router } from 'express';
import { db, schema } from '../db/index.js';
import { eq, asc, desc } from 'drizzle-orm';
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
  const items = db.select().from(schema.releases).orderBy(asc(schema.releases.sortOrder)).all();
  const allLinks = db.select().from(schema.releaseLinks).orderBy(asc(schema.releaseLinks.sortOrder)).all();
  const data = items.map(item => ({
    ...item,
    links: allLinks.filter(l => l.releaseId === item.id),
  }));
  res.json(data);
});

router.get('/releases/:id', (req, res) => {
  const id = parseInt(req.params.id as string);
  const item = db.select().from(schema.releases).where(eq(schema.releases.id, id)).get();
  if (!item) {
    res.status(404).json({ error: 'Release not found' });
    return;
  }
  const links = db.select().from(schema.releaseLinks)
    .where(eq(schema.releaseLinks.releaseId, id))
    .orderBy(asc(schema.releaseLinks.sortOrder))
    .all();
  res.json({ ...item, links });
});

router.post('/releases', authMiddleware, (req, res) => {
  const result = db.insert(schema.releases).values(req.body).returning().get();
  res.status(201).json(result);
});

router.put('/releases/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id as string);
  db.update(schema.releases).set(req.body).where(eq(schema.releases.id, id)).run();
  const data = db.select().from(schema.releases).where(eq(schema.releases.id, id)).get();
  res.json(data);
});

router.delete('/releases/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id as string);
  db.delete(schema.releaseLinks).where(eq(schema.releaseLinks.releaseId, id)).run();
  db.delete(schema.releases).where(eq(schema.releases.id, id)).run();
  res.json({ success: true });
});

// ============ RELEASE LINKS ============
router.post('/releases/:id/links', authMiddleware, (req, res) => {
  const releaseId = parseInt(req.params.id as string);
  const result = db.insert(schema.releaseLinks)
    .values({ ...req.body, releaseId })
    .returning()
    .get();
  res.status(201).json(result);
});

router.put('/release-links/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id as string);
  db.update(schema.releaseLinks).set(req.body).where(eq(schema.releaseLinks.id, id)).run();
  const data = db.select().from(schema.releaseLinks).where(eq(schema.releaseLinks.id, id)).get();
  res.json(data);
});

router.delete('/release-links/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id as string);
  db.delete(schema.releaseLinks).where(eq(schema.releaseLinks.id, id)).run();
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
  const id = parseInt(req.params.id as string);
  db.update(schema.galleryImages).set(req.body).where(eq(schema.galleryImages.id, id)).run();
  const data = db.select().from(schema.galleryImages).where(eq(schema.galleryImages.id, id)).get();
  res.json(data);
});

router.delete('/gallery/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id as string);
  db.delete(schema.galleryImages).where(eq(schema.galleryImages.id, id)).run();
  res.json({ success: true });
});

// ============ MERCH ============
router.get('/merch', (_req, res) => {
  const items = db.select().from(schema.merchItems).orderBy(asc(schema.merchItems.sortOrder)).all();
  const allImages = db.select().from(schema.merchItemImages).orderBy(asc(schema.merchItemImages.sortOrder)).all();
  const allVariants = db.select().from(schema.merchItemVariants).orderBy(asc(schema.merchItemVariants.sortOrder)).all();
  const data = items.map(item => ({
    ...item,
    images: allImages.filter(img => img.merchItemId === item.id),
    variants: allVariants.filter(v => v.merchItemId === item.id),
  }));
  res.json(data);
});

router.get('/merch/:id', (req, res) => {
  const id = parseInt(req.params.id as string);
  const item = db.select().from(schema.merchItems).where(eq(schema.merchItems.id, id)).get();
  if (!item) {
    res.status(404).json({ error: 'Merch item not found' });
    return;
  }
  const images = db.select().from(schema.merchItemImages)
    .where(eq(schema.merchItemImages.merchItemId, id))
    .orderBy(asc(schema.merchItemImages.sortOrder))
    .all();
  const variants = db.select().from(schema.merchItemVariants)
    .where(eq(schema.merchItemVariants.merchItemId, id))
    .orderBy(asc(schema.merchItemVariants.sortOrder))
    .all();
  res.json({ ...item, images, variants });
});

router.post('/merch', authMiddleware, (req, res) => {
  const result = db.insert(schema.merchItems).values(req.body).returning().get();
  res.status(201).json(result);
});

router.put('/merch/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id as string);
  db.update(schema.merchItems).set(req.body).where(eq(schema.merchItems.id, id)).run();
  const data = db.select().from(schema.merchItems).where(eq(schema.merchItems.id, id)).get();
  res.json(data);
});

router.delete('/merch/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id as string);
  db.delete(schema.merchItemVariants).where(eq(schema.merchItemVariants.merchItemId, id)).run();
  db.delete(schema.merchItemImages).where(eq(schema.merchItemImages.merchItemId, id)).run();
  db.delete(schema.merchItems).where(eq(schema.merchItems.id, id)).run();
  res.json({ success: true });
});

// ============ MERCH IMAGES ============
router.get('/merch/:id/images', (req, res) => {
  const merchItemId = parseInt(req.params.id as string);
  const data = db.select().from(schema.merchItemImages)
    .where(eq(schema.merchItemImages.merchItemId, merchItemId))
    .orderBy(asc(schema.merchItemImages.sortOrder))
    .all();
  res.json(data);
});

router.post('/merch/:id/images', authMiddleware, (req, res) => {
  const merchItemId = parseInt(req.params.id as string);
  const result = db.insert(schema.merchItemImages)
    .values({ ...req.body, merchItemId })
    .returning()
    .get();
  res.status(201).json(result);
});

router.delete('/merch-images/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id as string);
  db.delete(schema.merchItemImages).where(eq(schema.merchItemImages.id, id)).run();
  res.json({ success: true });
});

// ============ MERCH VARIANTS ============
router.post('/merch/:id/variants', authMiddleware, (req, res) => {
  const merchItemId = parseInt(req.params.id as string);
  const result = db.insert(schema.merchItemVariants)
    .values({ ...req.body, merchItemId })
    .returning()
    .get();
  res.status(201).json(result);
});

router.put('/merch-variants/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id as string);
  db.update(schema.merchItemVariants).set(req.body).where(eq(schema.merchItemVariants.id, id)).run();
  const data = db.select().from(schema.merchItemVariants).where(eq(schema.merchItemVariants.id, id)).get();
  res.json(data);
});

router.delete('/merch-variants/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id as string);
  db.delete(schema.merchItemVariants).where(eq(schema.merchItemVariants.id, id)).run();
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
  const id = parseInt(req.params.id as string);
  db.update(schema.tourDates).set(req.body).where(eq(schema.tourDates.id, id)).run();
  const data = db.select().from(schema.tourDates).where(eq(schema.tourDates.id, id)).get();
  res.json(data);
});

router.delete('/tours/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id as string);
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
  const id = parseInt(req.params.id as string);
  db.update(schema.pressItems).set(req.body).where(eq(schema.pressItems.id, id)).run();
  const data = db.select().from(schema.pressItems).where(eq(schema.pressItems.id, id)).get();
  res.json(data);
});

router.delete('/press/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id as string);
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
  const id = parseInt(req.params.id as string);
  db.update(schema.contactCategories).set(req.body).where(eq(schema.contactCategories.id, id)).run();
  const data = db.select().from(schema.contactCategories).where(eq(schema.contactCategories.id, id)).get();
  res.json(data);
});

router.delete('/contact-categories/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id as string);
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
  const id = parseInt(req.params.id as string);
  db.update(schema.socialLinks).set(req.body).where(eq(schema.socialLinks.id, id)).run();
  const data = db.select().from(schema.socialLinks).where(eq(schema.socialLinks.id, id)).get();
  res.json(data);
});

router.delete('/socials/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id as string);
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
  const id = parseInt(req.params.id as string);
  db.update(schema.navigationItems).set(req.body).where(eq(schema.navigationItems.id, id)).run();
  const data = db.select().from(schema.navigationItems).where(eq(schema.navigationItems.id, id)).get();
  res.json(data);
});

router.delete('/navigation/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id as string);
  db.delete(schema.navigationItems).where(eq(schema.navigationItems.id, id)).run();
  res.json({ success: true });
});

// ============ HERO SETTINGS ============
router.get('/hero-settings', (_req, res) => {
  const data = db.select().from(schema.heroSettings).get();
  if (!data) {
    res.json(null);
    return;
  }
  let activeMedia = null;
  if (data.activeMediaId) {
    activeMedia = db.select().from(schema.heroMedia).where(eq(schema.heroMedia.id, data.activeMediaId)).get() || null;
  }
  res.json({ ...data, activeMedia });
});

router.put('/hero-settings', authMiddleware, (req, res) => {
  const existing = db.select().from(schema.heroSettings).get();
  if (existing) {
    db.update(schema.heroSettings).set(req.body).where(eq(schema.heroSettings.id, existing.id)).run();
  } else {
    db.insert(schema.heroSettings).values(req.body).run();
  }
  const data = db.select().from(schema.heroSettings).get();
  res.json(data);
});

// ============ HERO MEDIA ============
router.get('/hero-media', authMiddleware, (_req, res) => {
  const data = db.select().from(schema.heroMedia).orderBy(desc(schema.heroMedia.id)).all();
  res.json(data);
});

router.post('/hero-media', authMiddleware, (req, res) => {
  const result = db.insert(schema.heroMedia).values(req.body).returning().get();
  res.status(201).json(result);
});

router.put('/hero-media/:id/activate', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id as string);
  const media = db.select().from(schema.heroMedia).where(eq(schema.heroMedia.id, id)).get();
  if (!media) {
    res.status(404).json({ error: 'Media not found' });
    return;
  }
  const settings = db.select().from(schema.heroSettings).get();
  if (settings) {
    db.update(schema.heroSettings).set({ activeMediaId: id }).where(eq(schema.heroSettings.id, settings.id)).run();
  } else {
    db.insert(schema.heroSettings).values({ activeMediaId: id }).run();
  }
  res.json({ success: true });
});

router.delete('/hero-media/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id as string);
  const settings = db.select().from(schema.heroSettings).get();
  if (settings && settings.activeMediaId === id) {
    db.update(schema.heroSettings).set({ activeMediaId: null }).where(eq(schema.heroSettings.id, settings.id)).run();
  }
  db.delete(schema.heroMedia).where(eq(schema.heroMedia.id, id)).run();
  res.json({ success: true });
});

// ============ LOGO MEDIA ============
router.get('/logo-media', (_req, res) => {
  const data = db.select().from(schema.logoMedia).orderBy(desc(schema.logoMedia.id)).all();
  res.json(data);
});

router.get('/active-logo', (_req, res) => {
  const setting = db.select().from(schema.siteSettings).where(eq(schema.siteSettings.key, 'activeLogoId')).get();
  if (setting && setting.value) {
    const logoId = parseInt(setting.value);
    const logo = db.select().from(schema.logoMedia).where(eq(schema.logoMedia.id, logoId)).get();
    if (logo) {
      res.json({ url: logo.mediaUrl });
      return;
    }
  }
  res.json({ url: null });
});

router.post('/logo-media', authMiddleware, (req, res) => {
  const result = db.insert(schema.logoMedia).values(req.body).returning().get();
  res.status(201).json(result);
});

router.put('/logo-media/:id/activate', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id as string);
  const media = db.select().from(schema.logoMedia).where(eq(schema.logoMedia.id, id)).get();
  if (!media) {
    res.status(404).json({ error: 'Logo not found' });
    return;
  }
  const existing = db.select().from(schema.siteSettings).where(eq(schema.siteSettings.key, 'activeLogoId')).get();
  if (existing) {
    db.update(schema.siteSettings).set({ value: String(id) }).where(eq(schema.siteSettings.id, existing.id)).run();
  } else {
    db.insert(schema.siteSettings).values({ key: 'activeLogoId', value: String(id) }).run();
  }
  res.json({ success: true });
});

router.delete('/logo-media/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id as string);
  const setting = db.select().from(schema.siteSettings).where(eq(schema.siteSettings.key, 'activeLogoId')).get();
  if (setting && setting.value === String(id)) {
    db.update(schema.siteSettings).set({ value: '' }).where(eq(schema.siteSettings.id, setting.id)).run();
  }
  db.delete(schema.logoMedia).where(eq(schema.logoMedia.id, id)).run();
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

// ============ ORDERS ============

// Public: create order
router.post('/orders', (req, res) => {
  const { customerName, customerPhone, customerEmail, customerAddress, items, receiptUrl, receiptValid } = req.body;
  if (!customerName || !customerPhone || !customerEmail || !customerAddress || !items?.length) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  const totalAmount = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
  const status = receiptValid === true ? 'paid' : 'pending';

  const order = db.insert(schema.orders).values({
    customerName,
    customerPhone,
    customerEmail,
    customerAddress,
    totalAmount,
    currency: 'KZT',
    status,
    receiptUrl: receiptUrl || '',
    note: '',
    createdAt: new Date().toISOString(),
  }).returning().get();

  for (const item of items) {
    db.insert(schema.orderItems).values({
      orderId: order.id,
      merchItemId: item.merchItemId,
      variantId: item.variantId || null,
      name: item.name,
      variantLabel: item.variantLabel || '',
      price: item.price,
      quantity: item.quantity,
    }).run();
  }

  res.status(201).json({ id: order.id, status: order.status });
});

// Public: check order status
router.get('/orders/:id/status', (req, res) => {
  const id = parseInt(req.params.id as string);
  const order = db.select({ status: schema.orders.status }).from(schema.orders).where(eq(schema.orders.id, id)).get();
  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }
  res.json({ status: order.status });
});

// Admin: list all orders
router.get('/orders', authMiddleware, (_req, res) => {
  const allOrders = db.select().from(schema.orders).orderBy(desc(schema.orders.id)).all();
  const allItems = db.select().from(schema.orderItems).all();
  const data = allOrders.map(order => ({
    ...order,
    items: allItems.filter(item => item.orderId === order.id),
  }));
  res.json(data);
});

// Admin: get single order
router.get('/orders/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id as string);
  const order = db.select().from(schema.orders).where(eq(schema.orders.id, id)).get();
  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }
  const items = db.select().from(schema.orderItems).where(eq(schema.orderItems.orderId, id)).all();
  res.json({ ...order, items });
});

// Admin: update order (status, note)
router.put('/orders/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id as string);
  const { status, note } = req.body;
  const updates: Record<string, any> = {};
  if (status !== undefined) updates.status = status;
  if (note !== undefined) updates.note = note;
  db.update(schema.orders).set(updates).where(eq(schema.orders.id, id)).run();
  const order = db.select().from(schema.orders).where(eq(schema.orders.id, id)).get();
  res.json(order);
});

export default router;
