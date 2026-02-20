import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import type { ImageUploadOptions } from '../../lib/api';
import { ImageUploader } from '../../components/admin/ImageUploader';
import { CompressionModal } from '../../components/admin/CompressionModal';
import type { CompressionSettings } from '../../components/admin/CompressionModal';
import { ConfirmModal } from '../../components/admin/ConfirmModal';
import { useToast } from '../../components/admin/Toast';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineCheck, HiOutlineX, HiOutlinePhotograph } from 'react-icons/hi';

interface GalleryImage {
  id: number;
  src: string;
  alt: string;
  sortOrder: number;
}

export function GalleryEditor() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [editForm, setEditForm] = useState({ src: '', alt: '', sortOrder: 0 });
  const [batchUploading, setBatchUploading] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ done: 0, total: 0 });
  const batchInputRef = useRef<HTMLInputElement>(null);
  const [pendingBatchFiles, setPendingBatchFiles] = useState<FileList | null>(null);

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [selectMode, setSelectMode] = useState(false);

  // Confirm modal state
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ open: false, title: '', message: '', onConfirm: () => {} });

  const { data: images = [], isLoading } = useQuery({
    queryKey: ['gallery'],
    queryFn: () => api.get<GalleryImage[]>('/gallery'),
  });

  const createMutation = useMutation({
    mutationFn: (data: { src: string; alt: string; sortOrder: number }) =>
      api.post('/gallery', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
      setAddingNew(false);
      setEditForm({ src: '', alt: '', sortOrder: 0 });
      toast('Image added');
    },
    onError: () => toast('Failed to add image', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: number; src: string; alt: string; sortOrder: number }) =>
      api.put(`/gallery/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
      setEditingId(null);
      toast('Image updated');
    },
    onError: () => toast('Failed to update image', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/gallery/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
    },
  });

  const handleEdit = (image: GalleryImage) => {
    setEditingId(image.id);
    setEditForm({ src: image.src, alt: image.alt, sortOrder: image.sortOrder });
  };

  const handleDelete = (id: number) => {
    setConfirmModal({
      open: true,
      title: 'Delete Image',
      message: 'Are you sure you want to delete this image? This action cannot be undone.',
      onConfirm: () => {
        deleteMutation.mutate(id);
        setConfirmModal((prev) => ({ ...prev, open: false }));
        toast('Image deleted');
      },
    });
  };

  const handleSave = () => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...editForm });
    }
  };

  const handleCreate = () => {
    createMutation.mutate(editForm);
  };

  // Selection helpers
  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === images.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(images.map((img) => img.id)));
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    setConfirmModal({
      open: true,
      title: 'Delete Selected Images',
      message: `Are you sure you want to delete ${selectedIds.size} image${selectedIds.size > 1 ? 's' : ''}? This action cannot be undone.`,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, open: false }));
        const ids = Array.from(selectedIds);
        await Promise.all(ids.map((id) => api.delete(`/gallery/${id}`)));
        await queryClient.invalidateQueries({ queryKey: ['gallery'] });
        setSelectedIds(new Set());
        setSelectMode(false);
        toast(`${ids.length} image${ids.length > 1 ? 's' : ''} deleted`);
      },
    });
  };

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelectedIds(new Set());
  };

  const handleBatchUpload = async (files: FileList, options?: ImageUploadOptions) => {
    const total = files.length;
    setBatchUploading(true);
    setBatchProgress({ done: 0, total });

    const currentMax = images.reduce((max, img) => Math.max(max, img.sortOrder), 0);

    const uploads = Array.from(files).map(async (file, i) => {
      try {
        const result = await api.uploadFile(file, options);
        await api.post('/gallery', {
          src: result.url,
          alt: file.name,
          sortOrder: currentMax + i + 1,
        });
      } finally {
        setBatchProgress((prev) => ({ ...prev, done: prev.done + 1 }));
      }
    });

    await Promise.allSettled(uploads);
    await queryClient.invalidateQueries({ queryKey: ['gallery'] });
    setBatchUploading(false);
    toast(`${total} image${total > 1 ? 's' : ''} uploaded`);
  };

  const handleBatchFileSelect = (files: FileList) => {
    setPendingBatchFiles(files);
  };

  const handleBatchCompressionConfirm = (settings: CompressionSettings) => {
    if (pendingBatchFiles) {
      const options: ImageUploadOptions | undefined = settings.compress
        ? { compressQuality: settings.quality, compressMaxWidth: settings.maxWidth }
        : undefined;
      handleBatchUpload(pendingBatchFiles, options);
    }
    setPendingBatchFiles(null);
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
        <h1 className="text-3xl text-white" style={{ fontFamily: 'var(--font-heading)' }}>GALLERY</h1>
        <div className="flex items-center gap-2">
          {selectMode ? (
            <>
              <button
                onClick={selectAll}
                className="text-sm text-[#a0a0a0] hover:text-white px-3 py-2 rounded-lg bg-[#1a1a1a] transition-colors"
              >
                {selectedIds.size === images.length ? 'Deselect All' : 'Select All'}
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={selectedIds.size === 0}
                className="flex items-center gap-1.5 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm disabled:opacity-50"
              >
                <HiOutlineTrash className="text-lg" />
                Delete ({selectedIds.size})
              </button>
              <button
                onClick={exitSelectMode}
                className="flex items-center gap-1 text-sm text-[#a0a0a0] hover:text-white px-3 py-2 rounded-lg bg-[#1a1a1a] transition-colors"
              >
                <HiOutlineX className="text-lg" />
                Cancel
              </button>
            </>
          ) : (
            <>
              {images.length > 0 && (
                <button
                  onClick={() => setSelectMode(true)}
                  className="text-sm text-[#a0a0a0] hover:text-white px-3 py-2 rounded-lg bg-[#1a1a1a] transition-colors"
                >
                  Select
                </button>
              )}
              <input
                ref={batchInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleBatchFileSelect(e.target.files);
                  }
                  e.target.value = '';
                }}
              />
              <button
                onClick={() => batchInputRef.current?.click()}
                disabled={batchUploading}
                className="flex items-center gap-2 bg-[#1a1a1a] text-white px-4 py-2 rounded-lg hover:bg-[#2a2a2a] transition-colors text-sm border border-[#e63946]/30 disabled:opacity-50"
              >
                <HiOutlinePhotograph className="text-lg" />
                Batch Upload
              </button>
              <button
                onClick={() => {
                  setAddingNew(true);
                  setEditForm({ src: '', alt: '', sortOrder: images.length });
                }}
                className="flex items-center gap-2 bg-[#e63946] text-white px-4 py-2 rounded-lg hover:bg-[#ff6b6b] transition-colors text-sm"
              >
                <HiOutlinePlus className="text-lg" />
                Add Image
              </button>
            </>
          )}
        </div>
      </div>

      {/* Batch Upload Progress */}
      {batchUploading && (
        <div className="bg-[#141414] border border-[#e63946]/30 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white text-sm">Uploading {batchProgress.done}/{batchProgress.total}...</span>
            <span className="text-[#a0a0a0] text-xs">{Math.round((batchProgress.done / batchProgress.total) * 100)}%</span>
          </div>
          <div className="w-full h-2 bg-[#0a0a0a] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#e63946] rounded-full transition-all duration-300"
              style={{ width: `${(batchProgress.done / batchProgress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Add New Form */}
      {addingNew && (
        <div className="bg-[#141414] border border-[#e63946]/30 rounded-lg p-5 mb-6">
          <h3 className="text-white font-medium mb-4">New Image</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-[#a0a0a0] text-sm mb-2">Image</label>
              <ImageUploader
                value={editForm.src}
                onChange={(url) => setEditForm({ ...editForm, src: url })}
                enableCompression
              />
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[#a0a0a0] text-sm mb-2">Alt Text</label>
                <input
                  type="text"
                  value={editForm.alt}
                  onChange={(e) => setEditForm({ ...editForm, alt: e.target.value })}
                  className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#e63946] transition-colors"
                  placeholder="Image description"
                />
              </div>
              <div>
                <label className="block text-[#a0a0a0] text-sm mb-2">Sort Order</label>
                <input
                  type="number"
                  value={editForm.sortOrder}
                  onChange={(e) => setEditForm({ ...editForm, sortOrder: parseInt(e.target.value) || 0 })}
                  className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#e63946] transition-colors"
                />
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={createMutation.isPending || !editForm.src}
              className="flex items-center gap-1 bg-[#e63946] text-white px-4 py-2 rounded-lg hover:bg-[#ff6b6b] transition-colors text-sm disabled:opacity-50"
            >
              <HiOutlineCheck className="text-lg" />
              {createMutation.isPending ? 'Creating...' : 'Create'}
            </button>
            <button
              onClick={() => { setAddingNew(false); setEditForm({ src: '', alt: '', sortOrder: 0 }); }}
              className="flex items-center gap-1 bg-[#1a1a1a] text-[#a0a0a0] px-4 py-2 rounded-lg hover:text-white transition-colors text-sm"
            >
              <HiOutlineX className="text-lg" />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image) => (
          <div
            key={image.id}
            className={`bg-[#141414] border rounded-lg overflow-hidden transition-colors ${
              selectMode && selectedIds.has(image.id)
                ? 'border-[#e63946]'
                : 'border-[#1a1a1a]'
            } ${selectMode ? 'cursor-pointer' : ''}`}
            onClick={selectMode ? () => toggleSelect(image.id) : undefined}
          >
            {editingId === image.id ? (
              <div className="p-5">
                <div className="mb-4">
                  <label className="block text-[#a0a0a0] text-sm mb-2">Image</label>
                  <ImageUploader
                    value={editForm.src}
                    onChange={(url) => setEditForm({ ...editForm, src: url })}
                    enableCompression
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-[#a0a0a0] text-sm mb-2">Alt Text</label>
                  <input
                    type="text"
                    value={editForm.alt}
                    onChange={(e) => setEditForm({ ...editForm, alt: e.target.value })}
                    className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#e63946] transition-colors"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-[#a0a0a0] text-sm mb-2">Sort Order</label>
                  <input
                    type="number"
                    value={editForm.sortOrder}
                    onChange={(e) => setEditForm({ ...editForm, sortOrder: parseInt(e.target.value) || 0 })}
                    className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#e63946] transition-colors"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={updateMutation.isPending}
                    className="flex items-center gap-1 bg-[#e63946] text-white px-4 py-2 rounded-lg hover:bg-[#ff6b6b] transition-colors text-sm disabled:opacity-50"
                  >
                    <HiOutlineCheck className="text-lg" />
                    {updateMutation.isPending ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="flex items-center gap-1 bg-[#1a1a1a] text-[#a0a0a0] px-4 py-2 rounded-lg hover:text-white transition-colors text-sm"
                  >
                    <HiOutlineX className="text-lg" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="relative">
                  {image.src && (
                    <img src={image.src} alt={image.alt} className="w-full h-48 object-cover" />
                  )}
                  {selectMode && (
                    <div className={`absolute top-2 left-2 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                      selectedIds.has(image.id)
                        ? 'bg-[#e63946] border-[#e63946]'
                        : 'border-white/50 bg-black/30'
                    }`}>
                      {selectedIds.has(image.id) && (
                        <HiOutlineCheck className="text-white text-sm" />
                      )}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-white text-sm font-medium truncate">{image.alt || 'No alt text'}</p>
                  <p className="text-[#a0a0a0] text-xs mt-1">Sort: {image.sortOrder}</p>
                  {!selectMode && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleEdit(image)}
                        className="text-[#a0a0a0] hover:text-white p-2 rounded-lg hover:bg-[#1a1a1a] transition-colors"
                      >
                        <HiOutlinePencil className="text-lg" />
                      </button>
                      <button
                        onClick={() => handleDelete(image.id)}
                        disabled={deleteMutation.isPending}
                        className="text-[#a0a0a0] hover:text-[#e63946] p-2 rounded-lg hover:bg-[#1a1a1a] transition-colors disabled:opacity-50"
                      >
                        <HiOutlineTrash className="text-lg" />
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {images.length === 0 && !addingNew && (
        <div className="text-center py-12 text-[#a0a0a0]">
          <p>No gallery images yet.</p>
          <p className="text-sm mt-1">Click "Add Image" to upload one.</p>
        </div>
      )}

      <ConfirmModal
        open={confirmModal.open}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel="Delete"
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, open: false }))}
      />

      <CompressionModal
        open={!!pendingBatchFiles}
        file={pendingBatchFiles?.[0] ?? null}
        onConfirm={handleBatchCompressionConfirm}
        onCancel={() => setPendingBatchFiles(null)}
      />
    </div>
  );
}
