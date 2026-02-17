import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const adminUsers = sqliteTable('admin_users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
});

export const aboutContent = sqliteTable('about_content', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  photo: text('photo').notNull().default(''),
  paragraph1: text('paragraph1').notNull().default(''),
  paragraph2: text('paragraph2').notNull().default(''),
  paragraph3: text('paragraph3').notNull().default(''),
  stat1Value: text('stat1_value').notNull().default(''),
  stat1Label: text('stat1_label').notNull().default(''),
  stat2Value: text('stat2_value').notNull().default(''),
  stat2Label: text('stat2_label').notNull().default(''),
  stat3Value: text('stat3_value').notNull().default(''),
  stat3Label: text('stat3_label').notNull().default(''),
  subtitle: text('subtitle').notNull().default('The story behind the sound'),
});

export const releases = sqliteTable('releases', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  type: text('type').notNull().default('single'),
  year: integer('year').notNull(),
  cover: text('cover').notNull().default(''),
  spotifyUrl: text('spotify_url'),
  youtubeUrl: text('youtube_url'),
  sortOrder: integer('sort_order').notNull().default(0),
});

export const musicSettings = sqliteTable('music_settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  subtitle: text('subtitle').notNull().default('Latest releases and tracks'),
  spotifyEmbedUrl: text('spotify_embed_url').notNull().default(''),
});

export const galleryImages = sqliteTable('gallery_images', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  src: text('src').notNull(),
  alt: text('alt').notNull().default(''),
  sortOrder: integer('sort_order').notNull().default(0),
});

export const merchItems = sqliteTable('merch_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  price: real('price').notNull(),
  currency: text('currency').notNull().default('USD'),
  image: text('image').notNull().default(''),
  url: text('url'),
  sortOrder: integer('sort_order').notNull().default(0),
});

export const tourDates = sqliteTable('tour_dates', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  date: text('date').notNull(),
  city: text('city').notNull(),
  venue: text('venue').notNull(),
  country: text('country').notNull(),
  ticketUrl: text('ticket_url'),
  soldOut: integer('sold_out', { mode: 'boolean' }).notNull().default(false),
});

export const pressItems = sqliteTable('press_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  source: text('source').notNull(),
  quote: text('quote').notNull(),
  url: text('url'),
});

export const contactCategories = sqliteTable('contact_categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  label: text('label').notNull(),
  email: text('email').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
});

export const contactSettings = sqliteTable('contact_settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  subtitle: text('subtitle').notNull().default('Get in touch'),
});

export const socialLinks = sqliteTable('social_links', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  url: text('url').notNull(),
  iconKey: text('icon_key').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
});

export const navigationItems = sqliteTable('navigation_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  label: text('label').notNull(),
  href: text('href').notNull(),
  visible: integer('visible', { mode: 'boolean' }).notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
});

export const siteSettings = sqliteTable('site_settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  key: text('key').notNull().unique(),
  value: text('value').notNull().default(''),
});
