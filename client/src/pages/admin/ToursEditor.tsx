import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';

interface TourDate {
  id: number;
  date: string;
  city: string;
  venue: string;
  country: string;
  ticketUrl: string | null;
  soldOut: boolean;
}

interface TourForm {
  date: string;
  city: string;
  venue: string;
  country: string;
  ticketUrl: string;
  soldOut: boolean;
}

const emptyForm: TourForm = { date: '', city: '', venue: '', country: '', ticketUrl: '', soldOut: false };

export function ToursEditor() {
  const queryClient = useQueryClient();
  const { data: tours, isLoading } = useQuery({
    queryKey: ['tours'],
    queryFn: () => api.get<TourDate[]>('/tours'),
  });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<TourForm>(emptyForm);
  const [isAdding, setIsAdding] = useState(false);
  const [addForm, setAddForm] = useState<TourForm>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const createMutation = useMutation({
    mutationFn: (data: TourForm) => api.post<TourDate>('/tours', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tours'] });
      setIsAdding(false);
      setAddForm(emptyForm);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: TourForm }) =>
      api.put<TourDate>(`/tours/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tours'] });
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/tours/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tours'] });
      setDeleteConfirm(null);
    },
  });

  const startEditing = (item: TourDate) => {
    setEditingId(item.id);
    setEditForm({
      date: item.date,
      city: item.city,
      venue: item.venue,
      country: item.country,
      ticketUrl: item.ticketUrl || '',
      soldOut: item.soldOut,
    });
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
    if (!addForm.date.trim() || !addForm.city.trim()) return;
    createMutation.mutate(addForm);
  };

  const startAdding = () => {
    setIsAdding(true);
    setEditingId(null);
    setAddForm(emptyForm);
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#a0a0a0]">Loading tour dates...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl text-white" style={{ fontFamily: 'var(--font-heading)' }}>
          TOUR DATES
        </h1>
        <button
          onClick={startAdding}
          className="px-4 py-2 text-sm text-white bg-[#e63946] hover:bg-[#ff6b6b] rounded-lg transition-colors"
        >
          Add Date
        </button>
      </div>

      {/* Add form */}
      {isAdding && (
        <div className="bg-[#141414] border border-[#e63946]/30 rounded-lg p-5 mb-4">
          <h3 className="text-white text-sm font-medium mb-4">New Tour Date</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-[#a0a0a0] text-xs mb-1.5">Date</label>
              <input
                type="date"
                value={addForm.date}
                onChange={(e) => setAddForm({ ...addForm, date: e.target.value })}
                className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#e63946] transition-colors"
              />
            </div>
            <div>
              <label className="block text-[#a0a0a0] text-xs mb-1.5">City</label>
              <input
                type="text"
                value={addForm.city}
                onChange={(e) => setAddForm({ ...addForm, city: e.target.value })}
                placeholder="Los Angeles"
                className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#e63946] transition-colors"
              />
            </div>
            <div>
              <label className="block text-[#a0a0a0] text-xs mb-1.5">Venue</label>
              <input
                type="text"
                value={addForm.venue}
                onChange={(e) => setAddForm({ ...addForm, venue: e.target.value })}
                placeholder="The Wiltern"
                className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#e63946] transition-colors"
              />
            </div>
            <div>
              <label className="block text-[#a0a0a0] text-xs mb-1.5">Country</label>
              <input
                type="text"
                value={addForm.country}
                onChange={(e) => setAddForm({ ...addForm, country: e.target.value })}
                placeholder="USA"
                className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#e63946] transition-colors"
              />
            </div>
            <div>
              <label className="block text-[#a0a0a0] text-xs mb-1.5">Ticket URL</label>
              <input
                type="text"
                value={addForm.ticketUrl}
                onChange={(e) => setAddForm({ ...addForm, ticketUrl: e.target.value })}
                placeholder="https://..."
                className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#e63946] transition-colors"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-3 cursor-pointer py-2">
                <input
                  type="checkbox"
                  checked={addForm.soldOut}
                  onChange={(e) => setAddForm({ ...addForm, soldOut: e.target.checked })}
                  className="w-4 h-4 rounded border-[#1a1a1a] bg-[#0a0a0a] accent-[#e63946]"
                />
                <span className="text-[#a0a0a0] text-sm">Sold Out</span>
              </label>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={createMutation.isPending || !addForm.date.trim() || !addForm.city.trim()}
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
        {(!tours || tours.length === 0) && !isAdding && (
          <p className="text-[#a0a0a0] text-sm">No tour dates yet.</p>
        )}
        {tours?.map((item) => (
          <div
            key={item.id}
            className="bg-[#141414] border border-[#1a1a1a] rounded-lg p-4"
          >
            {editingId === item.id ? (
              /* Editing mode */
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-[#a0a0a0] text-xs mb-1.5">Date</label>
                    <input
                      type="date"
                      value={editForm.date}
                      onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                      className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#e63946] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[#a0a0a0] text-xs mb-1.5">City</label>
                    <input
                      type="text"
                      value={editForm.city}
                      onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                      className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#e63946] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[#a0a0a0] text-xs mb-1.5">Venue</label>
                    <input
                      type="text"
                      value={editForm.venue}
                      onChange={(e) => setEditForm({ ...editForm, venue: e.target.value })}
                      className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#e63946] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[#a0a0a0] text-xs mb-1.5">Country</label>
                    <input
                      type="text"
                      value={editForm.country}
                      onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                      className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#e63946] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[#a0a0a0] text-xs mb-1.5">Ticket URL</label>
                    <input
                      type="text"
                      value={editForm.ticketUrl}
                      onChange={(e) => setEditForm({ ...editForm, ticketUrl: e.target.value })}
                      className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#e63946] transition-colors"
                    />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-3 cursor-pointer py-2">
                      <input
                        type="checkbox"
                        checked={editForm.soldOut}
                        onChange={(e) => setEditForm({ ...editForm, soldOut: e.target.checked })}
                        className="w-4 h-4 rounded border-[#1a1a1a] bg-[#0a0a0a] accent-[#e63946]"
                      />
                      <span className="text-[#a0a0a0] text-sm">Sold Out</span>
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
                  Delete tour date for <span className="text-white font-medium">"{item.city}"</span>?
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
                <div className="flex items-center gap-4 min-w-0 flex-wrap">
                  <span className="text-[#e63946] text-sm font-medium shrink-0">
                    {formatDate(item.date)}
                  </span>
                  <span className="text-white text-sm">{item.city}, {item.country}</span>
                  <span className="text-[#a0a0a0] text-xs">{item.venue}</span>
                  {item.soldOut && (
                    <span className="text-xs px-2 py-0.5 rounded bg-red-500/10 text-red-400">
                      Sold Out
                    </span>
                  )}
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
