import { useState, useRef } from 'react';
import { api } from '../../lib/api';
import { useToast } from './Toast';
import { HiOutlineUpload, HiOutlineX } from 'react-icons/hi';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  className?: string;
}

export function ImageUploader({ value, onChange, className = '' }: ImageUploaderProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const result = await api.uploadFile(file);
      onChange(result.url);
    } catch {
      toast('Upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
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
          if (file) handleUpload(file);
        }}
      />
    </div>
  );
}
