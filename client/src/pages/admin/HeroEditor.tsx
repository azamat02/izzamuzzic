import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { HiOutlineUpload, HiOutlineX } from 'react-icons/hi';

interface HeroData {
  id: number;
  videoUrl: string;
}

export function HeroEditor() {
  const queryClient = useQueryClient();
  const [videoUrl, setVideoUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: heroSettings, isLoading } = useQuery({
    queryKey: ['hero-settings'],
    queryFn: () => api.get<HeroData | null>('/hero-settings'),
  });

  useEffect(() => {
    if (heroSettings) {
      setVideoUrl(heroSettings.videoUrl || '');
    }
  }, [heroSettings]);

  const saveMutation = useMutation({
    mutationFn: (data: { videoUrl: string }) => api.put('/hero-settings', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hero-settings'] });
    },
  });

  const handleUpload = async (file: File) => {
    setUploading(true);
    setUploadProgress(`Uploading ${file.name}...`);
    try {
      const result = await api.uploadVideo(file);
      setVideoUrl(result.url);
      setUploadProgress('');
    } catch {
      alert('Video upload failed. Make sure the file is mp4, webm, or mov and under 100MB.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  const handleSave = () => {
    saveMutation.mutate({ videoUrl });
  };

  const handleRemove = () => {
    setVideoUrl('');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#e63946] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl text-white" style={{ fontFamily: 'var(--font-heading)' }}>HERO</h1>
        <button
          onClick={handleSave}
          disabled={saveMutation.isPending}
          className="bg-[#e63946] text-white px-6 py-2.5 rounded-lg hover:bg-[#ff6b6b] transition-colors disabled:opacity-50"
        >
          {saveMutation.isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {saveMutation.isSuccess && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg text-sm mb-6">
          Changes saved successfully.
        </div>
      )}

      {saveMutation.isError && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm mb-6">
          Failed to save changes. Please try again.
        </div>
      )}

      <div className="space-y-6">
        {/* Video Upload */}
        <div className="bg-[#141414] border border-[#1a1a1a] rounded-lg p-6">
          <h2 className="text-lg text-white mb-2" style={{ fontFamily: 'var(--font-heading)' }}>BACKGROUND VIDEO</h2>
          <p className="text-[#a0a0a0] text-sm mb-4">
            Upload a video for the hero section background. Supported formats: MP4, WebM, MOV. Max size: 100MB.
          </p>

          {videoUrl ? (
            <div className="relative group">
              <video
                src={videoUrl}
                className="w-full max-w-2xl h-64 object-cover rounded-lg border border-[#1a1a1a]"
                muted
                loop
                autoPlay
                playsInline
              />
              <button
                onClick={handleRemove}
                className="absolute top-3 right-3 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <HiOutlineX className="text-sm" />
              </button>
              <p className="text-[#a0a0a0] text-xs mt-2">{videoUrl}</p>
            </div>
          ) : (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => !uploading && fileRef.current?.click()}
              className="border-2 border-dashed border-[#1a1a1a] rounded-lg p-12 text-center cursor-pointer hover:border-[#e63946]/50 transition-colors max-w-2xl"
            >
              {uploading ? (
                <div>
                  <div className="w-8 h-8 border-2 border-[#e63946] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-[#a0a0a0] text-sm">{uploadProgress}</p>
                </div>
              ) : (
                <>
                  <HiOutlineUpload className="text-3xl text-[#a0a0a0] mx-auto mb-3" />
                  <p className="text-[#a0a0a0] text-sm">Click or drag video to upload</p>
                  <p className="text-[#666] text-xs mt-1">MP4, WebM, MOV — up to 100MB</p>
                </>
              )}
            </div>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUpload(file);
              e.target.value = '';
            }}
          />
        </div>

        {/* Bottom Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="bg-[#e63946] text-white px-8 py-3 rounded-lg hover:bg-[#ff6b6b] transition-colors disabled:opacity-50"
          >
            {saveMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
