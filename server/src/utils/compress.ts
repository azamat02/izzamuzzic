import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import { uploadsDir } from './upload.js';

export interface CompressResult {
  filename: string;
  originalSize: number;
  compressedSize: number;
}

export interface ImageCompressOptions {
  quality?: number;
  maxWidth?: number;
}

export type VideoPreset = 'light' | 'medium' | 'heavy';

const VIDEO_PRESETS: Record<VideoPreset, { resolution: number; crf: number }> = {
  light: { resolution: 1080, crf: 23 },
  medium: { resolution: 720, crf: 28 },
  heavy: { resolution: 480, crf: 32 },
};

export async function compressImage(
  filename: string,
  options: ImageCompressOptions
): Promise<CompressResult> {
  const inputPath = path.join(uploadsDir, filename);
  const ext = path.extname(filename);
  const base = path.basename(filename, ext);
  const outputFilename = `${base}_compressed.jpg`;
  const outputPath = path.join(uploadsDir, outputFilename);

  const originalSize = fs.statSync(inputPath).size;

  let pipeline = sharp(inputPath);

  if (options.maxWidth) {
    pipeline = pipeline.resize(options.maxWidth, undefined, {
      withoutEnlargement: true,
    });
  }

  await pipeline
    .jpeg({ quality: options.quality ?? 80 })
    .toFile(outputPath);

  const compressedSize = fs.statSync(outputPath).size;

  fs.unlinkSync(inputPath);

  return { filename: outputFilename, originalSize, compressedSize };
}

export function compressVideo(
  filename: string,
  preset: VideoPreset,
  onProgress?: (percent: number) => void
): Promise<CompressResult> {
  const inputPath = path.join(uploadsDir, filename);
  const ext = path.extname(filename);
  const base = path.basename(filename, ext);
  const outputFilename = `${base}_compressed.mp4`;
  const outputPath = path.join(uploadsDir, outputFilename);

  const originalSize = fs.statSync(inputPath).size;
  const { resolution, crf } = VIDEO_PRESETS[preset];

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .videoCodec('libx264')
      .addOption('-crf', String(crf))
      .addOption('-preset', 'medium')
      .size(`?x${resolution}`)
      .audioCodec('aac')
      .audioBitrate('128k')
      .on('progress', (info) => {
        if (onProgress && info.percent != null) {
          onProgress(Math.round(info.percent));
        }
      })
      .on('end', () => {
        const compressedSize = fs.statSync(outputPath).size;
        fs.unlinkSync(inputPath);
        resolve({ filename: outputFilename, originalSize, compressedSize });
      })
      .on('error', (err) => {
        // Clean up output on failure
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
        reject(err);
      })
      .save(outputPath);
  });
}
