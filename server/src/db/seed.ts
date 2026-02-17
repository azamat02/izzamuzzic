import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import bcrypt from 'bcryptjs';
const { hashSync } = bcrypt;
import path from 'path';
import { fileURLToPath } from 'url';
import * as schema from './schema.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', '..', 'data.db');

const sqlite = new Database(dbPath);
sqlite.pragma('journal_mode = WAL');
const db = drizzle(sqlite, { schema });

// Create tables
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS about_content (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    photo TEXT NOT NULL DEFAULT '',
    paragraph1 TEXT NOT NULL DEFAULT '',
    paragraph2 TEXT NOT NULL DEFAULT '',
    paragraph3 TEXT NOT NULL DEFAULT '',
    stat1_value TEXT NOT NULL DEFAULT '',
    stat1_label TEXT NOT NULL DEFAULT '',
    stat2_value TEXT NOT NULL DEFAULT '',
    stat2_label TEXT NOT NULL DEFAULT '',
    stat3_value TEXT NOT NULL DEFAULT '',
    stat3_label TEXT NOT NULL DEFAULT '',
    subtitle TEXT NOT NULL DEFAULT 'The story behind the sound'
  );

  CREATE TABLE IF NOT EXISTS releases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'single',
    year INTEGER NOT NULL,
    cover TEXT NOT NULL DEFAULT '',
    spotify_url TEXT,
    youtube_url TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS music_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subtitle TEXT NOT NULL DEFAULT 'Latest releases and tracks',
    spotify_embed_url TEXT NOT NULL DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS gallery_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    src TEXT NOT NULL,
    alt TEXT NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS merch_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    image TEXT NOT NULL DEFAULT '',
    url TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS tour_dates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    city TEXT NOT NULL,
    venue TEXT NOT NULL,
    country TEXT NOT NULL,
    ticket_url TEXT,
    sold_out INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS press_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source TEXT NOT NULL,
    quote TEXT NOT NULL,
    url TEXT
  );

  CREATE TABLE IF NOT EXISTS contact_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    label TEXT NOT NULL,
    email TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS contact_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subtitle TEXT NOT NULL DEFAULT 'Get in touch'
  );

  CREATE TABLE IF NOT EXISTS social_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    icon_key TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS navigation_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    label TEXT NOT NULL,
    href TEXT NOT NULL,
    visible INTEGER NOT NULL DEFAULT 1,
    sort_order INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS site_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL DEFAULT ''
  );
`);

// Clear existing data
sqlite.exec(`
  DELETE FROM admin_users;
  DELETE FROM about_content;
  DELETE FROM releases;
  DELETE FROM music_settings;
  DELETE FROM gallery_images;
  DELETE FROM merch_items;
  DELETE FROM tour_dates;
  DELETE FROM press_items;
  DELETE FROM contact_categories;
  DELETE FROM contact_settings;
  DELETE FROM social_links;
  DELETE FROM navigation_items;
  DELETE FROM site_settings;
`);

// Seed admin user
db.insert(schema.adminUsers).values({
  username: 'admin',
  passwordHash: hashSync('changeme123', 10),
}).run();

// Seed about content
db.insert(schema.aboutContent).values({
  photo: 'https://placehold.co/600x750/141414/e63946?text=Artist+Photo',
  paragraph1: 'IZZAMUZZIC is an electronic music producer and DJ known for creating atmospheric soundscapes that blend deep bass, haunting melodies, and cinematic textures.',
  paragraph2: 'With releases on major labels and millions of streams across platforms, IZZAMUZZIC has established a unique sonic identity that resonates with listeners worldwide.',
  paragraph3: 'From intimate club sets to major festival stages, the live performances deliver an immersive experience that takes audiences on a journey through sound and emotion.',
  stat1Value: '10M+',
  stat1Label: 'Streams',
  stat2Value: '50+',
  stat2Label: 'Releases',
  stat3Value: '20+',
  stat3Label: 'Countries',
  subtitle: 'The story behind the sound',
}).run();

// Seed releases
const releasesData = [
  { title: 'Latest Release', type: 'single', year: 2024, cover: 'https://placehold.co/300x300/141414/e63946?text=Release+1', spotifyUrl: '#', youtubeUrl: '#', sortOrder: 0 },
  { title: 'Second Track', type: 'single', year: 2024, cover: 'https://placehold.co/300x300/141414/e63946?text=Release+2', spotifyUrl: '#', youtubeUrl: '#', sortOrder: 1 },
  { title: 'Third Track', type: 'ep', year: 2023, cover: 'https://placehold.co/300x300/141414/e63946?text=Release+3', spotifyUrl: '#', youtubeUrl: '#', sortOrder: 2 },
  { title: 'Fourth Track', type: 'album', year: 2023, cover: 'https://placehold.co/300x300/141414/e63946?text=Release+4', spotifyUrl: '#', youtubeUrl: '#', sortOrder: 3 },
];
for (const r of releasesData) {
  db.insert(schema.releases).values(r).run();
}

// Seed music settings
db.insert(schema.musicSettings).values({
  subtitle: 'Latest releases and tracks',
  spotifyEmbedUrl: 'https://open.spotify.com/embed/artist/5EiDVD35ofoSKq1KE0jcs8?utm_source=generator&theme=0',
}).run();

// Seed gallery
const galleryData = [
  { src: 'https://placehold.co/600x400/141414/e63946?text=Photo+1', alt: 'IZZAMUZZIC Live Performance', sortOrder: 0 },
  { src: 'https://placehold.co/600x400/1a1a1a/e63946?text=Photo+2', alt: 'IZZAMUZZIC Studio Session', sortOrder: 1 },
  { src: 'https://placehold.co/600x400/141414/e63946?text=Photo+3', alt: 'IZZAMUZZIC Concert', sortOrder: 2 },
  { src: 'https://placehold.co/600x400/1a1a1a/e63946?text=Photo+4', alt: 'IZZAMUZZIC Backstage', sortOrder: 3 },
  { src: 'https://placehold.co/600x400/141414/e63946?text=Photo+5', alt: 'IZZAMUZZIC Portrait', sortOrder: 4 },
  { src: 'https://placehold.co/600x400/1a1a1a/e63946?text=Photo+6', alt: 'IZZAMUZZIC Festival', sortOrder: 5 },
];
for (const g of galleryData) {
  db.insert(schema.galleryImages).values(g).run();
}

// Seed merch
const merchData = [
  { name: 'Classic T-Shirt Black', price: 35, currency: 'USD', image: 'https://placehold.co/300x300/141414/ffffff?text=T-Shirt', url: '#', sortOrder: 0 },
  { name: 'Hoodie Limited Edition', price: 75, currency: 'USD', image: 'https://placehold.co/300x300/141414/ffffff?text=Hoodie', url: '#', sortOrder: 1 },
  { name: 'Vinyl LP', price: 45, currency: 'USD', image: 'https://placehold.co/300x300/141414/e63946?text=Vinyl', url: '#', sortOrder: 2 },
  { name: 'Poster Collection', price: 25, currency: 'USD', image: 'https://placehold.co/300x300/141414/ffffff?text=Poster', url: '#', sortOrder: 3 },
];
for (const m of merchData) {
  db.insert(schema.merchItems).values(m).run();
}

// Seed tour dates
const tourData = [
  { date: '2026-02-15', city: 'Moscow', venue: 'Adrenaline Stadium', country: 'Russia', ticketUrl: '#', soldOut: false },
  { date: '2026-02-22', city: 'Saint Petersburg', venue: 'A2 Green Concert', country: 'Russia', ticketUrl: '#', soldOut: false },
  { date: '2026-03-01', city: 'Almaty', venue: 'Almaty Arena', country: 'Kazakhstan', ticketUrl: '#', soldOut: false },
  { date: '2026-03-08', city: 'Dubai', venue: 'Dubai Opera', country: 'UAE', ticketUrl: '#', soldOut: true },
];
for (const t of tourData) {
  db.insert(schema.tourDates).values(t).run();
}

// Seed press
const pressData = [
  { source: 'Music Magazine', quote: '"IZZAMUZZIC delivers a unique blend of electronic music that captivates listeners from the first note."', url: '#' },
  { source: 'Electronic Beats', quote: '"One of the most exciting artists to emerge from the electronic music scene in recent years."', url: '#' },
  { source: 'DJ Mag', quote: '"A masterful producer with an unmistakable sound signature."', url: '#' },
];
for (const p of pressData) {
  db.insert(schema.pressItems).values(p).run();
}

// Seed contact categories
const contactData = [
  { label: 'Booking Inquiries', email: 'izzamuzzic.mgmt@gmail.com', sortOrder: 0 },
  { label: 'Management', email: 'izzamuzzic.mgmt@gmail.com', sortOrder: 1 },
  { label: 'Press & Media', email: 'izzamuzzic.mgmt@gmail.com', sortOrder: 2 },
];
for (const c of contactData) {
  db.insert(schema.contactCategories).values(c).run();
}

// Seed contact settings
db.insert(schema.contactSettings).values({
  subtitle: 'Get in touch',
}).run();

// Seed social links
const socialsData = [
  { name: 'Spotify', url: 'https://open.spotify.com/artist/5EiDVD35ofoSKq1KE0jcs8', iconKey: 'FaSpotify', sortOrder: 0 },
  { name: 'YouTube', url: 'https://youtube.com/@izzamuzzic', iconKey: 'FaYoutube', sortOrder: 1 },
  { name: 'Instagram', url: 'https://instagram.com/izzamuzzic', iconKey: 'FaInstagram', sortOrder: 2 },
  { name: 'SoundCloud', url: 'https://soundcloud.com/izzamuzzic', iconKey: 'FaSoundcloud', sortOrder: 3 },
  { name: 'Telegram', url: 'https://t.me/izzzzzzzzzzzzzzza', iconKey: 'FaTelegram', sortOrder: 4 },
];
for (const s of socialsData) {
  db.insert(schema.socialLinks).values(s).run();
}

// Seed navigation
const navData = [
  { label: 'Music', href: '#music', visible: true, sortOrder: 0 },
  { label: 'About', href: '#about', visible: true, sortOrder: 1 },
  { label: 'Gallery', href: '#gallery', visible: true, sortOrder: 2 },
  { label: 'Merch', href: '#merch', visible: true, sortOrder: 3 },
  { label: 'Contact', href: '#contact', visible: true, sortOrder: 4 },
  { label: 'Tour', href: '#tour', visible: false, sortOrder: 5 },
  { label: 'Press', href: '#press', visible: false, sortOrder: 6 },
];
for (const n of navData) {
  db.insert(schema.navigationItems).values(n).run();
}

// Seed site settings
const settingsData = [
  { key: 'copyrightText', value: 'IZZAMUZZIC. All rights reserved.' },
  { key: 'aboutSubtitle', value: 'The story behind the sound' },
  { key: 'gallerySubtitle', value: 'Behind the scenes and live moments' },
  { key: 'merchSubtitle', value: 'Official merchandise' },
  { key: 'tourSubtitle', value: 'Upcoming shows and events' },
  { key: 'pressSubtitle', value: 'What they\'re saying' },
];
for (const s of settingsData) {
  db.insert(schema.siteSettings).values(s).run();
}

console.log('Database seeded successfully!');
process.exit(0);
