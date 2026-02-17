import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { ImageUploader } from '../../components/admin/ImageUploader';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineCheck, HiOutlineX } from 'react-icons/hi';

interface MerchItem {
  id: number;
  name: string;
  price: number;
  currency: string;
  image: string;
  url: string;
  sortOrder: number;
}

interface MerchForm {
  name: string;
  price: number;
  currency: string;
  image: string;
  url: string;
  sortOrder: number;
}

const emptyForm: MerchForm = { name: '', price: 0, currency: 'USD', image: '', url: '', sortOrder: 0 };

export function MerchEditor() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [editForm, setEditForm] = useState<MerchForm>(emptyForm);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['merch'],
    queryFn: () => api.get<MerchItem[]>('/merch'),
  });

  const createMutation = useMutation({
    mutationFn: (data: MerchForm) => api.post('/merch', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merch'] });
      setAddingNew(false);
      setEditForm(emptyForm);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: MerchForm & { id: number }) => api.put(`/merch/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merch'] });
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/merch/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merch'] });
    },
  });

  const handleEdit = (item: MerchItem) => {
    setEditingId(item.id);
    setEditForm({
      name: item.name,
      price: item.price,
      currency: item.currency,
      image: item.image,
      url: item.url,
      sortOrder: item.sortOrder,
    });
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this merch item?')) {
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

  const renderForm = (onSubmit: () => void, isPending: boolean, submitLabel: string, onCancel: () => void) => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[#a0a0a0] text-sm mb-2">Image</label>
          <ImageUploader
            value={editForm.image}
            onChange={(url) => setEditForm({ ...editForm, image: url })}
          />
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-[#a0a0a0] text-sm mb-2">Name</label>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#e63946] transition-colors"
              placeholder="Product name"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[#a0a0a0] text-sm mb-2">Price</label>
              <input
                type="number"
                step="0.01"
                value={editForm.price}
                onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) || 0 })}
                className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#e63946] transition-colors"
              />
            </div>
            <div>
              <label className="block text-[#a0a0a0] text-sm mb-2">Currency</label>
              <input
                type="text"
                value={editForm.currency}
                onChange={(e) => setEditForm({ ...editForm, currency: e.target.value })}
                className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#e63946] transition-colors"
                placeholder="USD"
              />
            </div>
          </div>
          <div>
            <label className="block text-[#a0a0a0] text-sm mb-2">URL</label>
            <input
              type="url"
              value={editForm.url}
              onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
              className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#e63946] transition-colors"
              placeholder="https://store.example.com/product"
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
          onClick={onSubmit}
          disabled={isPending || !editForm.name}
          className="flex items-center gap-1 bg-[#e63946] text-white px-4 py-2 rounded-lg hover:bg-[#ff6b6b] transition-colors text-sm disabled:opacity-50"
        >
          <HiOutlineCheck className="text-lg" />
          {isPending ? 'Saving...' : submitLabel}
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-1 bg-[#1a1a1a] text-[#a0a0a0] px-4 py-2 rounded-lg hover:text-white transition-colors text-sm"
        >
          <HiOutlineX className="text-lg" />
          Cancel
        </button>
      </div>
    </div>
  );

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
        <h1 className="text-3xl text-white" style={{ fontFamily: 'var(--font-heading)' }}>MERCH</h1>
        <button
          onClick={() => {
            setAddingNew(true);
            setEditForm({ ...emptyForm, sortOrder: items.length });
          }}
          className="flex items-center gap-2 bg-[#e63946] text-white px-4 py-2 rounded-lg hover:bg-[#ff6b6b] transition-colors text-sm"
        >
          <HiOutlinePlus className="text-lg" />
          Add Item
        </button>
      </div>

      {/* Add New Form */}
      {addingNew && (
        <div className="bg-[#141414] border border-[#e63946]/30 rounded-lg p-5 mb-6">
          <h3 className="text-white font-medium mb-4">New Merch Item</h3>
          {renderForm(handleCreate, createMutation.isPending, 'Create', () => { setAddingNew(false); setEditForm(emptyForm); })}
        </div>
      )}

      {/* Merch Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div key={item.id} className="bg-[#141414] border border-[#1a1a1a] rounded-lg overflow-hidden">
            {editingId === item.id ? (
              <div className="p-5">
                {renderForm(handleSave, updateMutation.isPending, 'Save', () => setEditingId(null))}
              </div>
            ) : (
              <>
                {item.image && (
                  <img src={item.image} alt={item.name} className="w-full h-48 object-cover" />
                )}
                <div className="p-4">
                  <p className="text-white font-medium">{item.name}</p>
                  <p className="text-[#e63946] font-bold mt-1">
                    {item.price} {item.currency}
                  </p>
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#a0a0a0] text-xs hover:text-white transition-colors truncate block mt-1"
                    >
                      {item.url}
                    </a>
                  )}
                  <p className="text-[#a0a0a0] text-xs mt-1">Sort: {item.sortOrder}</p>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-[#a0a0a0] hover:text-white p-2 rounded-lg hover:bg-[#1a1a1a] transition-colors"
                    >
                      <HiOutlinePencil className="text-lg" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
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

      {items.length === 0 && !addingNew && (
        <div className="text-center py-12 text-[#a0a0a0]">
          <p>No merch items yet.</p>
          <p className="text-sm mt-1">Click "Add Item" to create one.</p>
        </div>
      )}
    </div>
  );
}
