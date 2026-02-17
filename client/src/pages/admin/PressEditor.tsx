import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';

interface PressItem {
  id: number;
  source: string;
  quote: string;
  url: string | null;
}

interface PressForm {
  source: string;
  quote: string;
  url: string;
}

const emptyForm: PressForm = { source: '', quote: '', url: '' };

export function PressEditor() {
  const queryClient = useQueryClient();
  const { data: press, isLoading } = useQuery({
    queryKey: ['press'],
    queryFn: () => api.get<PressItem[]>('/press'),
  });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<PressForm>(emptyForm);
  const [isAdding, setIsAdding] = useState(false);
  const [addForm, setAddForm] = useState<PressForm>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const createMutation = useMutation({
    mutationFn: (data: PressForm) => api.post<PressItem>('/press', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['press'] });
      setIsAdding(false);
      setAddForm(emptyForm);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: PressForm }) =>
      api.put<PressItem>(`/press/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['press'] });
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/press/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['press'] });
      setDeleteConfirm(null);
    },
  });

  const startEditing = (item: PressItem) => {
    setEditingId(item.id);
    setEditForm({ source: item.source, quote: item.quote, url: item.url || '' });
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
    if (!addForm.source.trim()) return;
    createMutation.mutate(addForm);
  };

  const startAdding = () => {
    setIsAdding(true);
    setEditingId(null);
    setAddForm(emptyForm);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#a0a0a0]">Loading press items...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl text-white" style={{ fontFamily: 'var(--font-heading)' }}>
          PRESS
        </h1>
        <button
          onClick={startAdding}
          className="px-4 py-2 text-sm text-white bg-[#e63946] hover:bg-[#ff6b6b] rounded-lg transition-colors"
        >
          Add Quote
        </button>
      </div>

      {/* Add form */}
      {isAdding && (
        <div className="bg-[#141414] border border-[#e63946]/30 rounded-lg p-5 mb-4">
          <h3 className="text-white text-sm font-medium mb-4">New Press Quote</h3>
          <div className="space-y-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#a0a0a0] text-xs mb-1.5">Source</label>
                <input
                  type="text"
                  value={addForm.source}
                  onChange={(e) => setAddForm({ ...addForm, source: e.target.value })}
                  placeholder="Rolling Stone"
                  className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#e63946] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[#a0a0a0] text-xs mb-1.5">URL</label>
                <input
                  type="text"
                  value={addForm.url}
                  onChange={(e) => setAddForm({ ...addForm, url: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#e63946] transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-[#a0a0a0] text-xs mb-1.5">Quote</label>
              <textarea
                value={addForm.quote}
                onChange={(e) => setAddForm({ ...addForm, quote: e.target.value })}
                placeholder="An incredible artist..."
                rows={3}
                className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#e63946] transition-colors resize-none"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={createMutation.isPending || !addForm.source.trim()}
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
        {(!press || press.length === 0) && !isAdding && (
          <p className="text-[#a0a0a0] text-sm">No press quotes yet.</p>
        )}
        {press?.map((item) => (
          <div
            key={item.id}
            className="bg-[#141414] border border-[#1a1a1a] rounded-lg p-4"
          >
            {editingId === item.id ? (
              /* Editing mode */
              <div>
                <div className="space-y-4 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[#a0a0a0] text-xs mb-1.5">Source</label>
                      <input
                        type="text"
                        value={editForm.source}
                        onChange={(e) => setEditForm({ ...editForm, source: e.target.value })}
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
                  </div>
                  <div>
                    <label className="block text-[#a0a0a0] text-xs mb-1.5">Quote</label>
                    <textarea
                      value={editForm.quote}
                      onChange={(e) => setEditForm({ ...editForm, quote: e.target.value })}
                      rows={3}
                      className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#e63946] transition-colors resize-none"
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
                  Delete quote from <span className="text-white font-medium">"{item.source}"</span>?
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
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-[#e63946] font-medium text-sm">{item.source}</span>
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#a0a0a0] hover:text-white text-xs underline transition-colors"
                      >
                        Link
                      </a>
                    )}
                  </div>
                  <p className="text-[#a0a0a0] text-sm line-clamp-2">"{item.quote}"</p>
                </div>
                <div className="flex gap-2 shrink-0">
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
