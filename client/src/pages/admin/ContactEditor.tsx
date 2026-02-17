import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineCheck, HiOutlineX } from 'react-icons/hi';

interface ContactCategory {
  id: number;
  label: string;
  email: string;
  sortOrder: number;
}

interface ContactSettings {
  id: number;
  subtitle: string;
}

export function ContactEditor() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [editForm, setEditForm] = useState({ label: '', email: '', sortOrder: 0 });
  const [subtitle, setSubtitle] = useState('');
  const [subtitleDirty, setSubtitleDirty] = useState(false);

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['contact-categories'],
    queryFn: () => api.get<ContactCategory[]>('/contact-categories'),
  });

  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ['contact-settings'],
    queryFn: () => api.get<ContactSettings>('/contact-settings'),
  });

  useEffect(() => {
    if (settings && !subtitleDirty) {
      setSubtitle(settings.subtitle || '');
    }
  }, [settings, subtitleDirty]);

  const settingsMutation = useMutation({
    mutationFn: (data: { subtitle: string }) => api.put('/contact-settings', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-settings'] });
      setSubtitleDirty(false);
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: { label: string; email: string; sortOrder: number }) =>
      api.post('/contact-categories', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-categories'] });
      setAddingNew(false);
      setEditForm({ label: '', email: '', sortOrder: 0 });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: number; label: string; email: string; sortOrder: number }) =>
      api.put(`/contact-categories/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-categories'] });
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/contact-categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-categories'] });
    },
  });

  const handleEdit = (category: ContactCategory) => {
    setEditingId(category.id);
    setEditForm({ label: category.label, email: category.email, sortOrder: category.sortOrder });
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
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

  const handleSubtitleSave = () => {
    settingsMutation.mutate({ subtitle });
  };

  if (categoriesLoading || settingsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#e63946] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl text-white mb-8" style={{ fontFamily: 'var(--font-heading)' }}>CONTACT</h1>

      {/* Subtitle Settings */}
      <div className="bg-[#141414] border border-[#1a1a1a] rounded-lg p-6 mb-8">
        <h2 className="text-lg text-white mb-4" style={{ fontFamily: 'var(--font-heading)' }}>PAGE SETTINGS</h2>
        <div>
          <label className="block text-[#a0a0a0] text-sm mb-2">Subtitle</label>
          <div className="flex gap-3">
            <input
              type="text"
              value={subtitle}
              onChange={(e) => { setSubtitle(e.target.value); setSubtitleDirty(true); }}
              className="flex-1 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#e63946] transition-colors"
              placeholder="Page subtitle..."
            />
            <button
              onClick={handleSubtitleSave}
              disabled={settingsMutation.isPending}
              className="bg-[#e63946] text-white px-5 py-2.5 rounded-lg hover:bg-[#ff6b6b] transition-colors disabled:opacity-50"
            >
              {settingsMutation.isPending ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg text-white" style={{ fontFamily: 'var(--font-heading)' }}>CATEGORIES</h2>
        <button
          onClick={() => {
            setAddingNew(true);
            setEditForm({ label: '', email: '', sortOrder: categories.length });
          }}
          className="flex items-center gap-2 bg-[#e63946] text-white px-4 py-2 rounded-lg hover:bg-[#ff6b6b] transition-colors text-sm"
        >
          <HiOutlinePlus className="text-lg" />
          Add Category
        </button>
      </div>

      {/* Add New Form */}
      {addingNew && (
        <div className="bg-[#141414] border border-[#e63946]/30 rounded-lg p-5 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-[#a0a0a0] text-sm mb-2">Label</label>
              <input
                type="text"
                value={editForm.label}
                onChange={(e) => setEditForm({ ...editForm, label: e.target.value })}
                className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#e63946] transition-colors"
                placeholder="Category label"
              />
            </div>
            <div>
              <label className="block text-[#a0a0a0] text-sm mb-2">Email</label>
              <input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#e63946] transition-colors"
                placeholder="email@example.com"
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
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={createMutation.isPending}
              className="flex items-center gap-1 bg-[#e63946] text-white px-4 py-2 rounded-lg hover:bg-[#ff6b6b] transition-colors text-sm disabled:opacity-50"
            >
              <HiOutlineCheck className="text-lg" />
              {createMutation.isPending ? 'Creating...' : 'Create'}
            </button>
            <button
              onClick={() => setAddingNew(false)}
              className="flex items-center gap-1 bg-[#1a1a1a] text-[#a0a0a0] px-4 py-2 rounded-lg hover:text-white transition-colors text-sm"
            >
              <HiOutlineX className="text-lg" />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Categories List */}
      <div className="space-y-3">
        {categories.map((category) => (
          <div key={category.id} className="bg-[#141414] border border-[#1a1a1a] rounded-lg p-5">
            {editingId === category.id ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-[#a0a0a0] text-sm mb-2">Label</label>
                    <input
                      type="text"
                      value={editForm.label}
                      onChange={(e) => setEditForm({ ...editForm, label: e.target.value })}
                      className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#e63946] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[#a0a0a0] text-sm mb-2">Email</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#e63946] transition-colors"
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
              </>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">{category.label}</p>
                  <p className="text-[#a0a0a0] text-sm">{category.email}</p>
                  <p className="text-[#a0a0a0] text-xs mt-1">Sort: {category.sortOrder}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="text-[#a0a0a0] hover:text-white p-2 rounded-lg hover:bg-[#1a1a1a] transition-colors"
                  >
                    <HiOutlinePencil className="text-lg" />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    disabled={deleteMutation.isPending}
                    className="text-[#a0a0a0] hover:text-[#e63946] p-2 rounded-lg hover:bg-[#1a1a1a] transition-colors disabled:opacity-50"
                  >
                    <HiOutlineTrash className="text-lg" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {categories.length === 0 && !addingNew && (
          <div className="text-center py-12 text-[#a0a0a0]">
            <p>No contact categories yet.</p>
            <p className="text-sm mt-1">Click "Add Category" to create one.</p>
          </div>
        )}
      </div>
    </div>
  );
}
