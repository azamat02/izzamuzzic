import { useState, useEffect, useRef } from 'react';

export interface CompressionSettings {
  compress: boolean;
  // Image options
  quality?: number;
  maxWidth?: number;
  // Video options
  preset?: 'light' | 'medium' | 'heavy';
}

interface CompressionModalProps {
  open: boolean;
  file: File | null;
  onConfirm: (settings: CompressionSettings) => void;
  onCancel: () => void;
}

const MAX_WIDTH_OPTIONS = [
  { label: 'Original', value: 0 },
  { label: '4K (3840px)', value: 3840 },
  { label: 'Full HD (1920px)', value: 1920 },
  { label: 'HD (1280px)', value: 1280 },
  { label: 'Small (800px)', value: 800 },
];

const VIDEO_PRESETS = [
  { value: 'light' as const, label: 'Light', desc: '1080p, high quality — slight size reduction' },
  { value: 'medium' as const, label: 'Medium', desc: '720p, balanced — good size reduction' },
  { value: 'heavy' as const, label: 'Heavy', desc: '480p, smaller file — significant reduction' },
];

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function CompressionModal({ open, file, onConfirm, onCancel }: CompressionModalProps) {
  const [compress, setCompress] = useState(false);
  const [quality, setQuality] = useState(80);
  const [maxWidth, setMaxWidth] = useState(0);
  const [preset, setPreset] = useState<'light' | 'medium' | 'heavy'>('medium');
  const previewRef = useRef<string | null>(null);

  const isVideo = file?.type.startsWith('video/') ?? false;

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      previewRef.current = url;
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  useEffect(() => {
    if (!open) {
      setCompress(false);
      setQuality(80);
      setMaxWidth(0);
      setPreset('medium');
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open, onCancel]);

  if (!open || !file) return null;

  const handleConfirm = () => {
    if (!compress) {
      onConfirm({ compress: false });
      return;
    }
    if (isVideo) {
      onConfirm({ compress: true, preset });
    } else {
      onConfirm({
        compress: true,
        quality,
        maxWidth: maxWidth || undefined,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onCancel} />
      <div className="relative bg-[#141414] border border-[#1a1a1a] rounded-xl p-6 max-w-lg w-full mx-4 shadow-2xl">
        <h3 className="text-white font-medium text-lg mb-4">Upload Media</h3>

        {/* File preview */}
        <div className="mb-4 rounded-lg overflow-hidden bg-black aspect-video flex items-center justify-center">
          {isVideo ? (
            <video
              src={previewRef.current ?? undefined}
              className="max-h-full max-w-full"
              muted
              autoPlay
              loop
              playsInline
            />
          ) : (
            <img
              src={previewRef.current ?? undefined}
              alt="Preview"
              className="max-h-full max-w-full object-contain"
            />
          )}
        </div>

        {/* File info */}
        <div className="text-sm text-[#a0a0a0] mb-4">
          <span className="text-white">{file.name}</span>
          <span className="mx-2">&middot;</span>
          <span>{formatSize(file.size)}</span>
        </div>

        {/* Compress toggle */}
        <label className="flex items-center gap-3 mb-4 cursor-pointer select-none">
          <div
            className={`w-10 h-5 rounded-full relative transition-colors ${
              compress ? 'bg-[#e63946]' : 'bg-[#2a2a2a]'
            }`}
            onClick={() => setCompress(!compress)}
          >
            <div
              className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                compress ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </div>
          <span className="text-white text-sm">Compress before upload</span>
        </label>

        {/* Compression options */}
        {compress && (
          <div className="space-y-4 mb-4 p-4 bg-[#0e0e0e] rounded-lg">
            {isVideo ? (
              <div>
                <p className="text-[#a0a0a0] text-xs mb-3 uppercase tracking-wide">Video preset</p>
                <div className="space-y-2">
                  {VIDEO_PRESETS.map((p) => (
                    <label
                      key={p.value}
                      className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        preset === p.value
                          ? 'bg-[#e63946]/10 border border-[#e63946]/30'
                          : 'bg-[#1a1a1a] border border-transparent hover:border-[#2a2a2a]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="preset"
                        value={p.value}
                        checked={preset === p.value}
                        onChange={() => setPreset(p.value)}
                        className="mt-0.5 accent-[#e63946]"
                      />
                      <div>
                        <span className="text-white text-sm font-medium">{p.label}</span>
                        <p className="text-[#666] text-xs mt-0.5">{p.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[#a0a0a0] text-xs uppercase tracking-wide">Quality</p>
                    <span className="text-white text-sm">{quality}%</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full accent-[#e63946]"
                  />
                  <div className="flex justify-between text-[#666] text-xs mt-1">
                    <span>Smaller file</span>
                    <span>Better quality</span>
                  </div>
                </div>
                <div>
                  <p className="text-[#a0a0a0] text-xs mb-2 uppercase tracking-wide">Max width</p>
                  <div className="flex flex-wrap gap-2">
                    {MAX_WIDTH_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setMaxWidth(opt.value)}
                        className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                          maxWidth === opt.value
                            ? 'bg-[#e63946] text-white'
                            : 'bg-[#1a1a1a] text-[#a0a0a0] hover:bg-[#2a2a2a]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-[#a0a0a0] hover:text-white bg-[#1a1a1a] hover:bg-[#2a2a2a] rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 text-sm text-white bg-[#e63946] hover:bg-[#ff6b6b] rounded-lg transition-colors"
          >
            {compress ? 'Compress & Upload' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
}
