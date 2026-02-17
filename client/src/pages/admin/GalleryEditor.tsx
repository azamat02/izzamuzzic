import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { ImageUploader } from '../../components/admin/ImageUploader';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineCheck, HiOutlineX } from 'react-icons/hi';

interface GalleryImage {
  id: number;
  src: string;
  alt: string;
  sortOrder: number;
}

export function GalleryEditor() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [editForm, setEditForm] = useState({ src: '', alt: '', sortOrder: 0 });

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
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: number; src: string; alt: string; sortOrder: number }) =>
      api.put(`/gallery/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
      setEditingId(null);
    },
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
    if (window.confirm('Are you sure you want to delete this image?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSave = () => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...editForm });
    }
  };

  const handleCreate = () => {
    createMutation.mutate(editForm);
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
      </div>

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
          <div key={image.id} className="bg-[#141414] border border-[#1a1a1a] rounded-lg overflow-hidden">
            {editingId === image.id ? (
              <div className="p-5">
                <div className="mb-4">
                  <label className="block text-[#a0a0a0] text-sm mb-2">Image</label>
                  <ImageUploader
                    value={editForm.src}
                    onChange={(url) => setEditForm({ ...editForm, src: url })}
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
                {image.src && (
                  <img src={image.src} alt={image.alt} className="w-full h-48 object-cover" />
                )}
                <div className="p-4">
                  <p className="text-white text-sm font-medium truncate">{image.alt || 'No alt text'}</p>
                  <p className="text-[#a0a0a0] text-xs mt-1">Sort: {image.sortOrder}</p>
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
    </div>
  );
}
