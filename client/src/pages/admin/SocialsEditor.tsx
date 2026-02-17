import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';

interface SocialLink {
  id: number;
  name: string;
  url: string;
  iconKey: string;
  sortOrder: number;
}

interface SocialForm {
  name: string;
  url: string;
  iconKey: string;
  sortOrder: number;
}

const emptyForm: SocialForm = { name: '', url: '', iconKey: '', sortOrder: 0 };

export function SocialsEditor() {
  const queryClient = useQueryClient();
  const { data: socials, isLoading } = useQuery({
    queryKey: ['socials'],
    queryFn: () => api.get<SocialLink[]>('/socials'),
  });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<SocialForm>(emptyForm);
  const [isAdding, setIsAdding] = useState(false);
  const [addForm, setAddForm] = useState<SocialForm>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const createMutation = useMutation({
    mutationFn: (data: SocialForm) => api.post<SocialLink>('/socials', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socials'] });
      setIsAdding(false);
      setAddForm(emptyForm);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: SocialForm }) =>
      api.put<SocialLink>(`/socials/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socials'] });
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/socials/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socials'] });
      setDeleteConfirm(null);
    },
  });

  const startEditing = (item: SocialLink) => {
    setEditingId(item.id);
    setEditForm({ name: item.name, url: item.url, iconKey: item.iconKey, sortOrder: item.sortOrder });
    setIsAdding(false);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm(emptyForm);
  };

  const handleSaveEdit = () => {
    if (editingId === null) return;
    updateMutation.mutate({ id: editingId, data: editForm });
  };

  const handleCreate = () => {
    if (!addForm.name.trim()) return;
    createMutation.mutate(addForm);
  };

  const startAdding = () => {
    setIsAdding(true);
    setEditingId(null);
    setAddForm({ ...emptyForm, sortOrder: (socials?.length ?? 0) });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#a0a0a0]">Loading socials...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl text-white" style={{ fontFamily: 'var(--font-heading)' }}>
          SOCIAL LINKS
        </h1>
        <button
          onClick={startAdding}
          className="px-4 py-2 text-sm text-white bg-[#e63946] hover:bg-[#ff6b6b] rounded-lg transition-colors"
        >
          Add Social
        </button>
      </div>

      {/* Add form */}
      {isAdding && (
        <div className="bg-[#141414] border border-[#e63946]/30 rounded-lg p-5 mb-4">
          <h3 className="text-white text-sm font-medium mb-4">New Social Link</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-[#a0a0a0] text-xs mb-1.5">Name</label>
              <input
                type="text"
                value={addForm.name}
                onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                placeholder="Spotify"
                className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#e63946] transition-colors"
              />
            </div>
            <div>
              <label className="block text-[#a0a0a0] text-xs mb-1.5">URL</label>
              <input
                type="text"
                value={addForm.url}
                onChange={(e) => setAddForm({ ...addForm, url: e.target.value })}
                placeholder="https://open.spotify.com/artist/..."
                className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#e63946] transition-colors"
              />
            </div>
            <div>
              <label className="block text-[#a0a0a0] text-xs mb-1.5">Icon Key</label>
              <input
                type="text"
                value={addForm.iconKey}
                onChange={(e) => setAddForm({ ...addForm, iconKey: e.target.value })}
                placeholder="FaSpotify"
                className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#e63946] transition-colors"
              />
            </div>
            <div>
              <label className="block text-[#a0a0a0] text-xs mb-1.5">Sort Order</label>
              <input
                type="number"
                value={addForm.sortOrder}
                onChange={(e) => setAddForm({ ...addForm, sortOrder: parseInt(e.target.value) || 0 })}
                className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#e63946] transition-colors"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={createMutation.isPending || !addForm.name.trim()}
              className="px-4 py-2 text-sm text-white bg-[#e63946] hover:bg-[#ff6b6b] rounded-lg transition-colors disabled:opacity-50"
            >
              {createMutation.isPending ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={() => { setIsAdding(false); setAddForm(emptyForm); }}
              className="px-4 py-2 text-sm text-[#a0a0a0] hover:text-white bg-[#1a1a1a] rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {(!socials || socials.length === 0) && !isAdding && (
          <p className="text-[#a0a0a0] text-sm">No social links yet.</p>
        )}
        {socials?.map((item) => (
          <div
            key={item.id}
            className="bg-[#141414] border border-[#1a1a1a] rounded-lg p-4"
          >
            {editingId === item.id ? (
              /* Editing mode */
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-[#a0a0a0] text-xs mb-1.5">Name</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#e63946] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[#a0a0a0] text-xs mb-1.5">URL</label>
                    <input
                      type="text"
                      value={editForm.url}
                      onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
                      className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#e63946] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[#a0a0a0] text-xs mb-1.5">Icon Key</label>
                    <input
                      type="text"
                      value={editForm.iconKey}
                      onChange={(e) => setEditForm({ ...editForm, iconKey: e.target.value })}
                      className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#e63946] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[#a0a0a0] text-xs mb-1.5">Sort Order</label>
                    <input
                      type="number"
                      value={editForm.sortOrder}
                      onChange={(e) => setEditForm({ ...editForm, sortOrder: parseInt(e.target.value) || 0 })}
                      className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#e63946] transition-colors"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveEdit}
                    disabled={updateMutation.isPending}
                    className="px-4 py-2 text-sm text-white bg-[#e63946] hover:bg-[#ff6b6b] rounded-lg transition-colors disabled:opacity-50"
                  >
                    {updateMutation.isPending ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="px-4 py-2 text-sm text-[#a0a0a0] hover:text-white bg-[#1a1a1a] rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : deleteConfirm === item.id ? (
              /* Delete confirmation */
              <div className="flex items-center justify-between">
                <p className="text-[#a0a0a0] text-sm">
                  Delete <span className="text-white font-medium">"{item.name}"</span>?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="px-3 py-1.5 text-sm text-[#a0a0a0] hover:text-white bg-[#1a1a1a] rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(item.id)}
                    disabled={deleteMutation.isPending}
                    className="px-3 py-1.5 text-sm text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              /* Display mode */
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 min-w-0">
                  <span className="text-white font-medium text-sm">{item.name}</span>
                  <span className="text-[#a0a0a0] text-xs truncate">{item.url}</span>
                  <span className="text-[#e63946] text-xs shrink-0">{item.iconKey}</span>
                </div>
                <div className="flex gap-2 shrink-0 ml-4">
                  <button
                    onClick={() => startEditing(item)}
                    className="px-3 py-1.5 text-sm text-[#a0a0a0] hover:text-white bg-[#1a1a1a] rounded-lg transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(item.id)}
                    className="px-3 py-1.5 text-sm text-[#a0a0a0] hover:text-red-400 bg-[#1a1a1a] rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
