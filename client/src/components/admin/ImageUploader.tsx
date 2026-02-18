import { useState, useRef } from 'react';
import { api } from '../../lib/api';
import type { ImageUploadOptions } from '../../lib/api';
import { useToast } from './Toast';
import { CompressionModal } from './CompressionModal';
import type { CompressionSettings } from './CompressionModal';
import { HiOutlineUpload, HiOutlineX } from 'react-icons/hi';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  className?: string;
  enableCompression?: boolean;
}

export function ImageUploader({ value, onChange, className = '', enableCompression = false }: ImageUploaderProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const doUpload = async (file: File, options?: ImageUploadOptions) => {
    setUploading(true);
    try {
      const result = await api.uploadFile(file, options);
      onChange(result.url);
      if (result.originalSize && result.compressedSize) {
        const saved = result.originalSize - result.compressedSize;
        const pct = Math.round((saved / result.originalSize) * 100);
        toast(`Compressed: saved ${pct}%`, 'success');
      }
    } catch {
      toast('Upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (file: File) => {
    if (enableCompression) {
      setPendingFile(file);
    } else {
      doUpload(file);
    }
  };

  const handleCompressionConfirm = (settings: CompressionSettings) => {
    if (pendingFile) {
      const options: ImageUploadOptions | undefined = settings.compress
        ? { compressQuality: settings.quality, compressMaxWidth: settings.maxWidth }
        : undefined;
      doUpload(pendingFile, options);
    }
    setPendingFile(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  return (
    <div className={className}>
      {value ? (
        <div className="relative group">
          <img src={value} alt="Preview" className="w-full h-48 object-cover rounded-lg border border-[#1a1a1a]" />
          <button
            onClick={() => onChange('')}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <HiOutlineX className="text-sm" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-[#1a1a1a] rounded-lg p-8 text-center cursor-pointer hover:border-[#e63946]/50 transition-colors"
        >
          {uploading ? (
            <div className="w-6 h-6 border-2 border-[#e63946] border-t-transparent rounded-full animate-spin mx-auto" />
          ) : (
            <>
              <HiOutlineUpload className="text-2xl text-[#a0a0a0] mx-auto mb-2" />
              <p className="text-[#a0a0a0] text-sm">Click or drag to upload</p>
            </>
          )}
        </div>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
          e.target.value = '';
        }}
      />

      {enableCompression && (
        <CompressionModal
          open={!!pendingFile}
          file={pendingFile}
          onConfirm={handleCompressionConfirm}
          onCancel={() => setPendingFile(null)}
        />
      )}
    </div>
  );
}
