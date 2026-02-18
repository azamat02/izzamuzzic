import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useToast } from '../../components/admin/Toast';
import { ConfirmModal } from '../../components/admin/ConfirmModal';
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

export function HeroEditor() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<HeroMediaItem | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

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

  const handleUpload = async (file: File) => {
    setUploading(true);
    const isVideo = file.type.startsWith('video/');
    setUploadProgress(`Uploading ${file.name}...`);
    try {
      const result = isVideo
        ? await api.uploadVideo(file)
        : await api.uploadFile(file);

      await api.post('/hero-media', {
        mediaUrl: result.url,
        mediaType: isVideo ? 'video' : 'image',
        label: file.name,
        createdAt: new Date().toISOString(),
      });

      queryClient.invalidateQueries({ queryKey: ['hero-media'] });
      toast('Media uploaded', 'success');
    } catch {
      toast('Upload failed. Check file format and size.', 'error');
    } finally {
      setUploading(false);
      setUploadProgress('');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
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
            if (file) handleUpload(file);
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
