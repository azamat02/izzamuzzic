import { useState, useRef, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import type { UploadResult, ImageUploadOptions, VideoUploadOptions } from '../../lib/api';
import { useToast } from '../../components/admin/Toast';
import { ConfirmModal } from '../../components/admin/ConfirmModal';
import { CompressionModal } from '../../components/admin/CompressionModal';
import type { CompressionSettings } from '../../components/admin/CompressionModal';
import { HiOutlineUpload, HiOutlineTrash, HiOutlineCheck } from 'react-icons/hi';

interface HeroMediaItem {
  id: number;
  mediaUrl: string;
  mediaType: string;
  label: string;
  createdAt: string;
}

interface HeroSettingsData {
  id: number;
  videoUrl: string;
  activeMediaId: number | null;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function HeroEditor() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<HeroMediaItem | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: heroSettings } = useQuery({
    queryKey: ['hero-settings'],
    queryFn: () => api.get<HeroSettingsData | null>('/hero-settings'),
  });

  const { data: mediaList = [], isLoading } = useQuery({
    queryKey: ['hero-media'],
    queryFn: () => api.get<HeroMediaItem[]>('/hero-media'),
  });

  const activateMutation = useMutation({
    mutationFn: (id: number) => api.put(`/hero-media/${id}/activate`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hero-settings'] });
      queryClient.invalidateQueries({ queryKey: ['hero-media'] });
      toast('Active media updated', 'success');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/hero-media/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hero-settings'] });
      queryClient.invalidateQueries({ queryKey: ['hero-media'] });
      setDeleteTarget(null);
      toast('Media deleted', 'success');
    },
  });

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const pollVideoCompression = useCallback(
    (jobId: string, fileName: string) => {
      setUploadProgress('Compressing video... 0%');

      pollRef.current = setInterval(async () => {
        try {
          const status = await api.getCompressionStatus(jobId);

          if (status.status === 'compressing') {
            setUploadProgress(`Compressing video... ${status.progress}%`);
            return;
          }

          if (pollRef.current) clearInterval(pollRef.current);
          pollRef.current = null;

          if (status.status === 'done' && status.result) {
            await api.post('/hero-media', {
              mediaUrl: status.result.url,
              mediaType: 'video',
              label: fileName,
              createdAt: new Date().toISOString(),
            });
            queryClient.invalidateQueries({ queryKey: ['hero-media'] });

            const saved = status.result.originalSize - status.result.compressedSize;
            toast(
              `Video compressed: ${formatSize(status.result.originalSize)} → ${formatSize(status.result.compressedSize)} (saved ${formatSize(saved)})`,
              'success'
            );
          } else {
            toast(status.error || 'Video compression failed', 'error');
          }
        } catch {
          if (pollRef.current) clearInterval(pollRef.current);
          pollRef.current = null;
          toast('Failed to check compression status', 'error');
        } finally {
          setUploading(false);
          setUploadProgress('');
        }
      }, 2000);
    },
    [queryClient, toast]
  );

  const handleUploadWithSettings = useCallback(
    async (file: File, settings: CompressionSettings) => {
      setUploading(true);
      const isVideo = file.type.startsWith('video/');

      const onProgress = (percent: number) => {
        setUploadProgress(`Uploading ${file.name}... ${percent}%`);
      };

      try {
        if (isVideo) {
          setUploadProgress(`Uploading ${file.name}... 0%`);
          const videoOptions: VideoUploadOptions | undefined = settings.compress
            ? { compressPreset: settings.preset }
            : undefined;

          const result = await api.uploadVideo(file, videoOptions, onProgress);

          if ('compressing' in result && result.compressing) {
            pollVideoCompression(result.jobId, file.name);
            return; // Don't reset uploading — polling handles it
          }

          // No compression — direct result
          const uploadResult = result as UploadResult;
          await api.post('/hero-media', {
            mediaUrl: uploadResult.url,
            mediaType: 'video',
            label: file.name,
            createdAt: new Date().toISOString(),
          });
          queryClient.invalidateQueries({ queryKey: ['hero-media'] });
          toast('Media uploaded', 'success');
        } else {
          setUploadProgress(`Uploading ${file.name}... 0%`);
          const imageOptions: ImageUploadOptions | undefined = settings.compress
            ? { compressQuality: settings.quality, compressMaxWidth: settings.maxWidth }
            : undefined;

          const result = await api.uploadFile(file, imageOptions, onProgress);

          await api.post('/hero-media', {
            mediaUrl: result.url,
            mediaType: 'image',
            label: file.name,
            createdAt: new Date().toISOString(),
          });
          queryClient.invalidateQueries({ queryKey: ['hero-media'] });

          if (result.originalSize && result.compressedSize) {
            const saved = result.originalSize - result.compressedSize;
            toast(
              `Image compressed: ${formatSize(result.originalSize)} → ${formatSize(result.compressedSize)} (saved ${formatSize(saved)})`,
              'success'
            );
          } else {
            toast('Media uploaded', 'success');
          }
        }
      } catch (err) {
        toast(err instanceof Error ? err.message : 'Upload failed', 'error');
      } finally {
        if (!pollRef.current) {
          setUploading(false);
          setUploadProgress('');
        }
      }
    },
    [queryClient, toast, pollVideoCompression]
  );

  const handleFileSelect = (file: File) => {
    setPendingFile(file);
  };

  const handleCompressionConfirm = (settings: CompressionSettings) => {
    if (pendingFile) {
      handleUploadWithSettings(pendingFile, settings);
    }
    setPendingFile(null);
  };

  const handleCompressionCancel = () => {
    setPendingFile(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#e63946] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const activeId = heroSettings?.activeMediaId ?? null;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl text-white" style={{ fontFamily: 'var(--font-heading)' }}>HERO</h1>
      </div>

      {/* Upload Zone */}
      <div className="bg-[#141414] border border-[#1a1a1a] rounded-lg p-6 mb-8">
        <h2 className="text-lg text-white mb-2" style={{ fontFamily: 'var(--font-heading)' }}>UPLOAD MEDIA</h2>
        <p className="text-[#a0a0a0] text-sm mb-4">
          Upload photos or videos for the hero background. Supported: JPEG, PNG, WebP, GIF, MP4, WebM, MOV.
        </p>

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
              <p className="text-[#a0a0a0] text-sm">Click or drag file to upload</p>
              <p className="text-[#666] text-xs mt-1">Images & videos — photos up to 10MB, videos up to 100MB</p>
            </>
          )}
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
            e.target.value = '';
          }}
        />
      </div>

      {/* Media Grid */}
      {mediaList.length > 0 && (
        <div className="bg-[#141414] border border-[#1a1a1a] rounded-lg p-6">
          <h2 className="text-lg text-white mb-4" style={{ fontFamily: 'var(--font-heading)' }}>MEDIA VARIANTS</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {mediaList.map((item) => {
              const isActive = activeId === item.id;
              return (
                <div
                  key={item.id}
                  className={`relative rounded-lg border-2 overflow-hidden transition-colors ${
                    isActive ? 'border-green-500' : 'border-[#1a1a1a]'
                  }`}
                >
                  {/* Preview */}
                  <div className="aspect-video bg-black">
                    {item.mediaType === 'video' ? (
                      <video
                        src={item.mediaUrl}
                        className="w-full h-full object-cover"
                        muted
                        loop
                        autoPlay
                        playsInline
                      />
                    ) : (
                      <img
                        src={item.mediaUrl}
                        alt={item.label}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  {/* Active badge */}
                  {isActive && (
                    <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded">
                      ACTIVE
                    </div>
                  )}

                  {/* Info + actions */}
                  <div className="p-3 bg-[#0e0e0e]">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-white text-sm truncate">{item.label}</p>
                        <p className="text-[#666] text-xs mt-0.5">
                          {item.mediaType === 'video' ? 'Video' : 'Image'} &middot; {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {!isActive && (
                          <button
                            onClick={() => activateMutation.mutate(item.id)}
                            disabled={activateMutation.isPending}
                            className="p-1.5 rounded-lg bg-[#1a1a1a] hover:bg-green-500/20 text-[#a0a0a0] hover:text-green-400 transition-colors"
                            title="Set Active"
                          >
                            <HiOutlineCheck className="text-base" />
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteTarget(item)}
                          className="p-1.5 rounded-lg bg-[#1a1a1a] hover:bg-red-500/20 text-[#a0a0a0] hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <HiOutlineTrash className="text-base" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Compression Modal */}
      <CompressionModal
        open={!!pendingFile}
        file={pendingFile}
        onConfirm={handleCompressionConfirm}
        onCancel={handleCompressionCancel}
      />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Media"
        message={`Delete "${deleteTarget?.label}"? ${deleteTarget && activeId === deleteTarget.id ? 'This is the active variant — the hero will fall back to the default.' : ''}`}
        confirmLabel="Delete"
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
