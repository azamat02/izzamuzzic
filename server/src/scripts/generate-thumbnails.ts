import fs from 'fs';
import path from 'path';
import { uploadsDir, generateThumbnail } from '../utils/upload.js';

async function main() {
  const files = fs.readdirSync(uploadsDir);
  const imageExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

  const originals = files.filter((f) => {
    const ext = path.extname(f).toLowerCase();
    return imageExts.includes(ext) && !f.startsWith('thumb_');
  });

  console.log(`Found ${originals.length} images in uploads/`);

  let generated = 0;
  let skipped = 0;
  let failed = 0;

  for (const filename of originals) {
    const ext = path.extname(filename);
    const base = path.basename(filename, ext);
    const thumbPath = path.join(uploadsDir, `thumb_${base}.jpg`);

    const forceRegenerate = process.argv.includes('--force');
    if (!forceRegenerate && fs.existsSync(thumbPath)) {
      skipped++;
      continue;
    }

    try {
      await generateThumbnail(filename);
      generated++;
      console.log(`  Generated: thumb_${base}.jpg`);
    } catch (err) {
      failed++;
      console.error(`  Failed: ${filename}`, err);
    }
  }

  console.log(`\nDone: ${generated} generated, ${skipped} skipped, ${failed} failed`);
}

main();
