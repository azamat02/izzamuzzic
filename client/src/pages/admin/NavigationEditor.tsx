import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';

interface NavigationItem {
  id: number;
  label: string;
  href: string;
  visible: boolean;
  sortOrder: number;
}

interface NavForm {
  label: string;
  href: string;
  visible: boolean;
  sortOrder: number;
}

const emptyForm: NavForm = { label: '', href: '', visible: true, sortOrder: 0 };

export function NavigationEditor() {
  const queryClient = useQueryClient();
  const { data: navigation, isLoading } = useQuery({
    queryKey: ['navigation'],
    queryFn: () => api.get<NavigationItem[]>('/navigation'),
  });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<NavForm>(emptyForm);
  const [isAdding, setIsAdding] = useState(false);
  const [addForm, setAddForm] = useState<NavForm>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const createMutation = useMutation({
    mutationFn: (data: NavForm) => api.post<NavigationItem>('/navigation', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['navigation'] });
      setIsAdding(false);
      setAddForm(emptyForm);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: NavForm }) =>
      api.put<NavigationItem>(`/navigation/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['navigation'] });
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/navigation/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['navigation'] });
      setDeleteConfirm(null);
    },
  });

  const startEditing = (item: NavigationItem) => {
    setEditingId(item.id);
    setEditForm({ label: item.label, href: item.href, visible: item.visible, sortOrder: item.sortOrder });
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
    if (!addForm.label.trim()) return;
    createMutation.mutate(addForm);
  };

  const startAdding = () => {
    setIsAdding(true);
    setEditingId(null);
    setAddForm({ ...emptyForm, sortOrder: (navigation?.length ?? 0) });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#a0a0a0]">Loading navigation...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl text-white" style={{ fontFamily: 'var(--font-heading)' }}>
          NAVIGATION
        </h1>
        <button
          onClick={startAdding}
          className="px-4 py-2 text-sm text-white bg-[#e63946] hover:bg-[#ff6b6b] rounded-lg transition-colors"
        >
          Add Item
        </button>
      </div>

      {/* Add form */}
      {isAdding && (
        <div className="bg-[#141414] border border-[#e63946]/30 rounded-lg p-5 mb-4">
          <h3 className="text-white text-sm font-medium mb-4">New Navigation Item</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-[#a0a0a0] text-xs mb-1.5">Label</label>
              <input
                type="text"
                value={addForm.label}
                onChange={(e) => setAddForm({ ...addForm, label: e.target.value })}
                placeholder="Music"
                className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#e63946] transition-colors"
              />
            </div>
            <div>
              <label className="block text-[#a0a0a0] text-xs mb-1.5">Href</label>
              <input
                type="text"
                value={addForm.href}
                onChange={(e) => setAddForm({ ...addForm, href: e.target.value })}
                placeholder="#music"
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
            <div className="flex items-end">
              <label className="flex items-center gap-3 cursor-pointer py-2">
                <input
                  type="checkbox"
                  checked={addForm.visible}
                  onChange={(e) => setAddForm({ ...addForm, visible: e.target.checked })}
                  className="w-4 h-4 rounded border-[#1a1a1a] bg-[#0a0a0a] accent-[#e63946]"
                />
                <span className="text-[#a0a0a0] text-sm">Visible</span>
              </label>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={createMutation.isPending || !addForm.label.trim()}
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
        {(!navigation || navigation.length === 0) && !isAdding && (
          <p className="text-[#a0a0a0] text-sm">No navigation items yet.</p>
        )}
        {navigation?.map((item) => (
          <div
            key={item.id}
            className="bg-[#141414] border border-[#1a1a1a] rounded-lg p-4"
          >
            {editingId === item.id ? (
              /* Editing mode */
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-[#a0a0a0] text-xs mb-1.5">Label</label>
                    <input
                      type="text"
                      value={editForm.label}
                      onChange={(e) => setEditForm({ ...editForm, label: e.target.value })}
                      className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#e63946] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[#a0a0a0] text-xs mb-1.5">Href</label>
                    <input
                      type="text"
                      value={editForm.href}
                      onChange={(e) => setEditForm({ ...editForm, href: e.target.value })}
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
                  <div className="flex items-end">
                    <label className="flex items-center gap-3 cursor-pointer py-2">
                      <input
                        type="checkbox"
                        checked={editForm.visible}
                        onChange={(e) => setEditForm({ ...editForm, visible: e.target.checked })}
                        className="w-4 h-4 rounded border-[#1a1a1a] bg-[#0a0a0a] accent-[#e63946]"
                      />
                      <span className="text-[#a0a0a0] text-sm">Visible</span>
                    </label>
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
                  Delete <span className="text-white font-medium">"{item.label}"</span>?
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
                  <span className="text-white font-medium text-sm">{item.label}</span>
                  <span className="text-[#a0a0a0] text-xs">{item.href}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      item.visible
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-red-500/10 text-red-400'
                    }`}
                  >
                    {item.visible ? 'Visible' : 'Hidden'}
                  </span>
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
