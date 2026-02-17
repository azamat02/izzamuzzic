import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { ImageUploader } from '../../components/admin/ImageUploader';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineCheck, HiOutlineX } from 'react-icons/hi';

interface MerchImage {
  id: number;
  merchItemId: number;
  url: string;
  sortOrder: number;
}

interface MerchVariant {
  id: number;
  merchItemId: number;
  label: string;
  inStock: boolean;
  sortOrder: number;
}

interface MerchItem {
  id: number;
  name: string;
  description: string;
  price: number;
  currency: string;
  image: string;
  sortOrder: number;
  images: MerchImage[];
  variants: MerchVariant[];
}

interface MerchForm {
  name: string;
  description: string;
  price: number;
  currency: string;
  image: string;
  sortOrder: number;
}

const emptyForm: MerchForm = { name: '', description: '', price: 0, currency: 'USD', image: '', sortOrder: 0 };

export function MerchEditor() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [editForm, setEditForm] = useState<MerchForm>(emptyForm);
  const [managingImagesId, setManagingImagesId] = useState<number | null>(null);
  const [managingVariantsId, setManagingVariantsId] = useState<number | null>(null);
  const [newVariantLabel, setNewVariantLabel] = useState('');

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

  const addImageMutation = useMutation({
    mutationFn: ({ merchItemId, url, sortOrder }: { merchItemId: number; url: string; sortOrder: number }) =>
      api.post(`/merch/${merchItemId}/images`, { url, sortOrder }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merch'] });
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: (imageId: number) => api.delete(`/merch-images/${imageId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merch'] });
    },
  });

  const addVariantMutation = useMutation({
    mutationFn: ({ merchItemId, label, sortOrder }: { merchItemId: number; label: string; sortOrder: number }) =>
      api.post(`/merch/${merchItemId}/variants`, { label, inStock: true, sortOrder }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merch'] });
      setNewVariantLabel('');
    },
  });

  const updateVariantMutation = useMutation({
    mutationFn: ({ id, inStock }: { id: number; inStock: boolean }) =>
      api.put(`/merch-variants/${id}`, { inStock }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merch'] });
    },
  });

  const deleteVariantMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/merch-variants/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merch'] });
    },
  });

  const handleEdit = (item: MerchItem) => {
    setEditingId(item.id);
    setEditForm({
      name: item.name,
      description: item.description || '',
      price: item.price,
      currency: item.currency,
      image: item.image,
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

  const handleAddImage = (merchItemId: number, url: string) => {
    const item = items.find(i => i.id === merchItemId);
    const sortOrder = item?.images?.length || 0;
    addImageMutation.mutate({ merchItemId, url, sortOrder });
  };

  const handleAddVariant = (merchItemId: number) => {
    if (!newVariantLabel.trim()) return;
    const item = items.find(i => i.id === merchItemId);
    const sortOrder = item?.variants?.length || 0;
    addVariantMutation.mutate({ merchItemId, label: newVariantLabel.trim(), sortOrder });
  };

  const renderForm = (onSubmit: () => void, isPending: boolean, submitLabel: string, onCancel: () => void) => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[#a0a0a0] text-sm mb-2">Cover Image</label>
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
          <div>
            <label className="block text-[#a0a0a0] text-sm mb-2">Description</label>
            <textarea
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#e63946] transition-colors resize-none"
              placeholder="Product description"
              rows={3}
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

  const renderImagesPanel = (item: MerchItem) => (
    <div className="border-t border-[#1a1a1a] mt-4 pt-4">
      <div className="flex items-center justify-between mb-3">
        <label className="text-[#a0a0a0] text-sm">Additional Photos ({item.images?.length || 0})</label>
        <button
          onClick={() => setManagingImagesId(null)}
          className="text-[#a0a0a0] hover:text-white text-sm transition-colors"
        >
          Close
        </button>
      </div>

      {/* Existing images */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {(item.images || []).map((img) => (
          <div key={img.id} className="relative group">
            <img src={img.url} alt="" className="w-full h-24 object-cover rounded-lg border border-[#1a1a1a]" />
            <button
              onClick={() => deleteImageMutation.mutate(img.id)}
              disabled={deleteImageMutation.isPending}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <HiOutlineX className="text-xs" />
            </button>
          </div>
        ))}
      </div>

      {/* Upload new */}
      <ImageUploader
        value=""
        onChange={(url) => {
          if (url) handleAddImage(item.id, url);
        }}
      />
    </div>
  );

  const renderVariantsPanel = (item: MerchItem) => (
    <div className="border-t border-[#1a1a1a] mt-4 pt-4">
      <div className="flex items-center justify-between mb-3">
        <label className="text-[#a0a0a0] text-sm">Variants / Sizes ({item.variants?.length || 0})</label>
        <button
          onClick={() => setManagingVariantsId(null)}
          className="text-[#a0a0a0] hover:text-white text-sm transition-colors"
        >
          Close
        </button>
      </div>

      {/* Existing variants */}
      <div className="space-y-2 mb-3">
        {(item.variants || []).map((variant) => (
          <div key={variant.id} className="flex items-center gap-2">
            <button
              onClick={() => updateVariantMutation.mutate({ id: variant.id, inStock: !variant.inStock })}
              disabled={updateVariantMutation.isPending}
              className={`flex-1 text-left px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                variant.inStock
                  ? 'border-green-500/50 bg-green-500/10 text-green-400'
                  : 'border-[#1a1a1a] bg-[#0a0a0a] text-[#555] line-through'
              }`}
            >
              {variant.label} {variant.inStock ? '- In Stock' : '- Out of Stock'}
            </button>
            <button
              onClick={() => deleteVariantMutation.mutate(variant.id)}
              disabled={deleteVariantMutation.isPending}
              className="text-[#a0a0a0] hover:text-[#e63946] p-1 rounded transition-colors"
            >
              <HiOutlineX className="text-sm" />
            </button>
          </div>
        ))}
      </div>

      {/* Add new variant */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newVariantLabel}
          onChange={(e) => setNewVariantLabel(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleAddVariant(item.id); }}
          className="flex-1 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-[#e63946] transition-colors"
          placeholder="e.g. S, M, L, XL"
        />
        <button
          onClick={() => handleAddVariant(item.id)}
          disabled={addVariantMutation.isPending || !newVariantLabel.trim()}
          className="bg-[#e63946] text-white px-3 py-1.5 rounded-lg hover:bg-[#ff6b6b] transition-colors text-sm disabled:opacity-50"
        >
          Add
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
                  {item.description && (
                    <p className="text-[#a0a0a0] text-xs mt-1 line-clamp-2">{item.description}</p>
                  )}
                  {item.images?.length > 0 && (
                    <p className="text-[#a0a0a0] text-xs mt-1">
                      +{item.images.length} photo{item.images.length !== 1 ? 's' : ''}
                    </p>
                  )}
                  {item.variants?.length > 0 && (
                    <p className="text-[#a0a0a0] text-xs mt-1">
                      {item.variants.filter(v => v.inStock).length}/{item.variants.length} variants in stock
                    </p>
                  )}
                  <p className="text-[#a0a0a0] text-xs mt-1">Sort: {item.sortOrder}</p>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-[#a0a0a0] hover:text-white p-2 rounded-lg hover:bg-[#1a1a1a] transition-colors"
                      title="Edit"
                    >
                      <HiOutlinePencil className="text-lg" />
                    </button>
                    <button
                      onClick={() => setManagingImagesId(managingImagesId === item.id ? null : item.id)}
                      className="text-[#a0a0a0] hover:text-white p-2 rounded-lg hover:bg-[#1a1a1a] transition-colors"
                      title="Manage photos"
                    >
                      <HiOutlinePlus className="text-lg" />
                    </button>
                    <button
                      onClick={() => {
                        setManagingVariantsId(managingVariantsId === item.id ? null : item.id);
                        setNewVariantLabel('');
                      }}
                      className="text-[#a0a0a0] hover:text-white p-2 rounded-lg hover:bg-[#1a1a1a] transition-colors text-xs font-bold"
                      title="Manage variants"
                    >
                      S/M/L
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deleteMutation.isPending}
                      className="text-[#a0a0a0] hover:text-[#e63946] p-2 rounded-lg hover:bg-[#1a1a1a] transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      <HiOutlineTrash className="text-lg" />
                    </button>
                  </div>

                  {managingImagesId === item.id && renderImagesPanel(item)}
                  {managingVariantsId === item.id && renderVariantsPanel(item)}
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
