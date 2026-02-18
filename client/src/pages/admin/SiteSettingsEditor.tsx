import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { DEFAULT_ACCENT, lightenColor } from '../../lib/color';

export function SiteSettingsEditor() {
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => api.get<Record<string, string>>('/settings'),
  });

  const [form, setForm] = useState<Record<string, string>>({});
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (settings) {
      setForm(settings);
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: (data: Record<string, string>) => api.put<Record<string, string>>('/settings', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    saveMutation.mutate(form);
  };

  const handleAddKey = () => {
    const trimmedKey = newKey.trim();
    if (!trimmedKey || form[trimmedKey] !== undefined) return;
    const updated = { ...form, [trimmedKey]: newValue };
    setForm(updated);
    setNewKey('');
    setNewValue('');
    saveMutation.mutate(updated);
  };

  const handleDeleteKey = (key: string) => {
    const updated = { ...form };
    delete updated[key];
    setForm(updated);
    setDeleteConfirm(null);
    saveMutation.mutate(updated);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#a0a0a0]">Loading settings...</div>
      </div>
    );
  }

  const accentColor = form.accentColor || DEFAULT_ACCENT;
  const accentLight = lightenColor(accentColor);
  const navbarTextColor = form.navbarTextColor || '#ffffff';
  const keys = Object.keys(form).filter(k => k !== 'accentColor' && k !== 'navbarTextColor');

  const handleAccentChange = (color: string) => {
    setForm((prev) => ({ ...prev, accentColor: color }));
  };

  const handleAccentReset = () => {
    setForm((prev) => {
      const updated = { ...prev };
      delete updated.accentColor;
      return updated;
    });
  };

  const handleNavbarTextChange = (color: string) => {
    setForm((prev) => ({ ...prev, navbarTextColor: color }));
  };

  const handleNavbarTextReset = () => {
    setForm((prev) => {
      const updated = { ...prev };
      delete updated.navbarTextColor;
      return updated;
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl text-white" style={{ fontFamily: 'var(--font-heading)' }}>
          SITE SETTINGS
        </h1>
      </div>

      {/* Accent Color */}
      <div className="bg-[#141414] border border-[#1a1a1a] rounded-lg p-5 mb-8">
        <h2 className="text-white text-sm font-medium mb-4">Accent Color</h2>
        <div className="flex items-center gap-4 flex-wrap">
          <input
            type="color"
            value={accentColor}
            onChange={(e) => handleAccentChange(e.target.value)}
            className="w-10 h-10 rounded-lg border border-[#1a1a1a] cursor-pointer bg-transparent"
          />
          <input
            type="text"
            value={accentColor}
            onChange={(e) => {
              const v = e.target.value;
              if (/^#[0-9a-fA-F]{0,6}$/.test(v)) handleAccentChange(v);
            }}
            maxLength={7}
            className="w-28 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-[#e63946] transition-colors"
          />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded" style={{ backgroundColor: accentColor }} title="Primary" />
            <div className="w-8 h-8 rounded" style={{ backgroundColor: accentLight }} title="Hover" />
            <span className="text-[#a0a0a0] text-xs ml-1">Primary / Hover</span>
          </div>
          {form.accentColor && (
            <button
              onClick={handleAccentReset}
              className="text-[#a0a0a0] hover:text-white text-sm transition-colors"
            >
              Reset to default
            </button>
          )}
        </div>
      </div>

      {/* Navbar Text Color */}
      <div className="bg-[#141414] border border-[#1a1a1a] rounded-lg p-5 mb-8">
        <h2 className="text-white text-sm font-medium mb-4">Navbar Text & Icons Color</h2>
        <div className="flex items-center gap-4 flex-wrap">
          <input
            type="color"
            value={navbarTextColor}
            onChange={(e) => handleNavbarTextChange(e.target.value)}
            className="w-10 h-10 rounded-lg border border-[#1a1a1a] cursor-pointer bg-transparent"
          />
          <input
            type="text"
            value={navbarTextColor}
            onChange={(e) => {
              const v = e.target.value;
              if (/^#[0-9a-fA-F]{0,6}$/.test(v)) handleNavbarTextChange(v);
            }}
            maxLength={7}
            className="w-28 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-[#e63946] transition-colors"
          />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded border border-[#333]" style={{ backgroundColor: navbarTextColor }} title="Navbar text" />
            <span className="text-[#a0a0a0] text-xs ml-1">Preview</span>
          </div>
          {form.navbarTextColor && (
            <button
              onClick={handleNavbarTextReset}
              className="text-[#a0a0a0] hover:text-white text-sm transition-colors"
            >
              Reset to default
            </button>
          )}
        </div>
      </div>

      {/* Existing settings */}
      <div className="space-y-3 mb-8">
        {keys.length === 0 && (
          <p className="text-[#a0a0a0] text-sm">No settings yet. Add one below.</p>
        )}
        {keys.map((key) => (
          <div
            key={key}
            className="bg-[#141414] border border-[#1a1a1a] rounded-lg p-4"
          >
            {deleteConfirm === key ? (
              <div className="flex items-center justify-between">
                <p className="text-[#a0a0a0] text-sm">
                  Delete setting <span className="text-white font-medium">"{key}"</span>?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="px-3 py-1.5 text-sm text-[#a0a0a0] hover:text-white bg-[#1a1a1a] rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteKey(key)}
                    className="px-3 py-1.5 text-sm text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <label className="text-[#a0a0a0] text-sm min-w-[140px] shrink-0 font-medium">
                  {key}
                </label>
                <input
                  type="text"
                  value={form[key]}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className="flex-1 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#e63946] transition-colors"
                />
                <button
                  onClick={() => setDeleteConfirm(key)}
                  className="text-[#a0a0a0] hover:text-red-400 text-sm transition-colors shrink-0"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Save all changes */}
      <div className="mb-8">
        <button
          onClick={handleSave}
          disabled={saveMutation.isPending}
          className="px-6 py-2.5 text-sm text-white bg-[#e63946] hover:bg-[#ff6b6b] rounded-lg transition-colors disabled:opacity-50"
        >
          {saveMutation.isPending ? 'Saving...' : 'Save All Settings'}
        </button>
        {saveMutation.isSuccess && (
          <span className="ml-3 text-green-400 text-sm">Saved successfully</span>
        )}
        {saveMutation.isError && (
          <span className="ml-3 text-red-400 text-sm">Failed to save</span>
        )}
      </div>

      {/* Add new setting */}
      <div className="bg-[#141414] border border-[#1a1a1a] rounded-lg p-5">
        <h2 className="text-white text-sm font-medium mb-4">Add New Setting</h2>
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label className="block text-[#a0a0a0] text-xs mb-1.5">Key</label>
            <input
              type="text"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder="setting_key"
              className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#e63946] transition-colors"
            />
          </div>
          <div className="flex-1">
            <label className="block text-[#a0a0a0] text-xs mb-1.5">Value</label>
            <input
              type="text"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="value"
              className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#e63946] transition-colors"
            />
          </div>
          <button
            onClick={handleAddKey}
            disabled={!newKey.trim()}
            className="px-4 py-2 text-sm text-white bg-[#e63946] hover:bg-[#ff6b6b] rounded-lg transition-colors disabled:opacity-50 shrink-0"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
