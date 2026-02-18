import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { ImageUploader } from '../../components/admin/ImageUploader';
import { ConfirmModal } from '../../components/admin/ConfirmModal';
import { useToast } from '../../components/admin/Toast';
import { getIcon, platformOptions } from '../../lib/iconMap';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineCheck, HiOutlineX, HiOutlineLink } from 'react-icons/hi';

interface ReleaseLink {
  id: number;
  releaseId: number;
  platform: string;
  url: string;
  hoverColor: string | null;
  sortOrder: number;
}

interface Release {
  id: number;
  title: string;
  type: string;
  year: number;
  cover: string;
  sortOrder: number;
  links: ReleaseLink[];
}

interface MusicSettings {
  id: number;
  subtitle: string;
  spotifyEmbedUrl: string;
}

interface ReleaseForm {
  title: string;
  type: string;
  year: number;
  cover: string;
  sortOrder: number;
}

const releaseTypes = ['single', 'ep', 'album'];

const emptyForm: ReleaseForm = {
  title: '',
  type: 'single',
  year: new Date().getFullYear(),
  cover: '',
  sortOrder: 0,
};

export function ReleasesEditor() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [editForm, setEditForm] = useState<ReleaseForm>(emptyForm);
  const [musicSubtitle, setMusicSubtitle] = useState('');
  const [spotifyEmbed, setSpotifyEmbed] = useState('');
  const [settingsDirty, setSettingsDirty] = useState(false);
  const [linksOpenFor, setLinksOpenFor] = useState<number | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; title: string; message: string; onConfirm: () => void }>({ open: false, title: '', message: '', onConfirm: () => {} });
  const [newLinkPlatform, setNewLinkPlatform] = useState(platformOptions[0].key);
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkHoverColor, setNewLinkHoverColor] = useState('');

  const { data: releases = [], isLoading: releasesLoading } = useQuery({
    queryKey: ['releases'],
    queryFn: () => api.get<Release[]>('/releases'),
  });

  const { data: musicSettings, isLoading: settingsLoading } = useQuery({
    queryKey: ['music-settings'],
    queryFn: () => api.get<MusicSettings>('/music-settings'),
  });

  useEffect(() => {
    if (musicSettings && !settingsDirty) {
      setMusicSubtitle(musicSettings.subtitle || '');
      setSpotifyEmbed(musicSettings.spotifyEmbedUrl || '');
    }
  }, [musicSettings, settingsDirty]);

  const settingsMutation = useMutation({
    mutationFn: (data: { subtitle: string; spotifyEmbedUrl: string }) =>
      api.put('/music-settings', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['music-settings'] });
      setSettingsDirty(false);
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: ReleaseForm) => api.post('/releases', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['releases'] });
      setAddingNew(false);
      setEditForm(emptyForm);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: ReleaseForm & { id: number }) =>
      api.put(`/releases/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['releases'] });
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/releases/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['releases'] });
    },
  });

  const addLinkMutation = useMutation({
    mutationFn: ({ releaseId, platform, url, hoverColor, sortOrder }: { releaseId: number; platform: string; url: string; hoverColor: string | null; sortOrder: number }) =>
      api.post(`/releases/${releaseId}/links`, { platform, url, hoverColor, sortOrder }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['releases'] });
      setNewLinkUrl('');
      setNewLinkHoverColor('');
    },
  });

  const updateLinkMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: number; hoverColor: string | null }) =>
      api.put(`/release-links/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['releases'] });
    },
  });

  const deleteLinkMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/release-links/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['releases'] });
    },
  });

  const handleEdit = (release: Release) => {
    setEditingId(release.id);
    setEditForm({
      title: release.title,
      type: release.type,
      year: release.year,
      cover: release.cover,
      sortOrder: release.sortOrder,
    });
  };

  const handleDelete = (id: number) => {
    setConfirmModal({
      open: true,
      title: 'Delete Release',
      message: 'Are you sure you want to delete this release and all its links? This action cannot be undone.',
      onConfirm: () => {
        deleteMutation.mutate(id);
        setConfirmModal((prev) => ({ ...prev, open: false }));
        toast('Release deleted');
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

  const handleSettingsSave = () => {
    settingsMutation.mutate({ subtitle: musicSubtitle, spotifyEmbedUrl: spotifyEmbed });
  };

  const handleAddLink = (releaseId: number, existingLinks: ReleaseLink[]) => {
    if (!newLinkUrl.trim()) return;
    addLinkMutation.mutate({
      releaseId,
      platform: newLinkPlatform,
      url: newLinkUrl.trim(),
      hoverColor: newLinkHoverColor.trim() || null,
      sortOrder: existingLinks.length,
    });
  };

  const handleDeleteLink = (linkId: number) => {
    deleteLinkMutation.mutate(linkId);
  };

  const renderForm = (onSubmit: () => void, isPending: boolean, submitLabel: string, onCancel: () => void) => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[#a0a0a0] text-sm mb-2">Cover</label>
          <ImageUploader
            value={editForm.cover}
            onChange={(url) => setEditForm({ ...editForm, cover: url })}
          />
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-[#a0a0a0] text-sm mb-2">Title</label>
            <input
              type="text"
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#e63946] transition-colors"
              placeholder="Release title"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[#a0a0a0] text-sm mb-2">Type</label>
              <select
                value={editForm.type}
                onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#e63946] transition-colors"
              >
                {releaseTypes.map((t) => (
                  <option key={t} value={t}>{t.toUpperCase()}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[#a0a0a0] text-sm mb-2">Year</label>
              <input
                type="number"
                value={editForm.year}
                onChange={(e) => setEditForm({ ...editForm, year: parseInt(e.target.value) || 0 })}
                className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#e63946] transition-colors"
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
          disabled={isPending || !editForm.title}
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

  const renderLinksPanel = (release: Release) => (
    <div className="border-t border-[#1a1a1a] p-4 space-y-3">
      <h4 className="text-white text-sm font-medium">Links</h4>
      {release.links.length > 0 && (
        <div className="space-y-2">
          {release.links.map((link) => {
            const Icon = getIcon(link.platform);
            const platformLabel = platformOptions.find(p => p.key === link.platform)?.label || link.platform;
            return (
              <div key={link.id} className="flex items-center gap-3 bg-[#0a0a0a] rounded-lg px-3 py-2">
                <Icon className="text-[#a0a0a0] text-lg shrink-0" />
                <span className="text-[#a0a0a0] text-xs shrink-0">{platformLabel}</span>
                <span className="text-white text-xs truncate flex-1">{link.url}</span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <input
                    type="color"
                    value={link.hoverColor || '#ffffff'}
                    onChange={(e) => updateLinkMutation.mutate({ id: link.id, hoverColor: e.target.value })}
                    className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                    title="Hover color"
                  />
                  {link.hoverColor && (
                    <button
                      onClick={() => updateLinkMutation.mutate({ id: link.id, hoverColor: null })}
                      className="text-[#a0a0a0] hover:text-white text-[10px] transition-colors"
                      title="Reset to default"
                    >
                      <HiOutlineX className="text-sm" />
                    </button>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteLink(link.id)}
                  disabled={deleteLinkMutation.isPending}
                  className="text-[#a0a0a0] hover:text-[#e63946] transition-colors shrink-0"
                >
                  <HiOutlineTrash className="text-base" />
                </button>
              </div>
            );
          })}
        </div>
      )}
      <div className="flex gap-2 items-end flex-wrap">
        <div className="flex-shrink-0">
          <label className="block text-[#a0a0a0] text-xs mb-1">Platform</label>
          <select
            value={newLinkPlatform}
            onChange={(e) => setNewLinkPlatform(e.target.value)}
            className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#e63946] transition-colors"
          >
            {platformOptions.map((p) => (
              <option key={p.key} value={p.key}>{p.label}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-[120px]">
          <label className="block text-[#a0a0a0] text-xs mb-1">URL</label>
          <input
            type="url"
            value={newLinkUrl}
            onChange={(e) => setNewLinkUrl(e.target.value)}
            className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#e63946] transition-colors"
            placeholder="https://..."
          />
        </div>
        <div className="flex-shrink-0">
          <label className="block text-[#a0a0a0] text-xs mb-1">Hover Color</label>
          <input
            type="color"
            value={newLinkHoverColor || '#e63946'}
            onChange={(e) => setNewLinkHoverColor(e.target.value)}
            className="w-full h-[38px] rounded-lg cursor-pointer bg-[#0a0a0a] border border-[#1a1a1a]"
          />
        </div>
        <button
          onClick={() => handleAddLink(release.id, release.links)}
          disabled={addLinkMutation.isPending || !newLinkUrl.trim()}
          className="flex items-center gap-1 bg-[#e63946] text-white px-3 py-2 rounded-lg hover:bg-[#ff6b6b] transition-colors text-sm disabled:opacity-50 shrink-0"
        >
          <HiOutlinePlus className="text-base" />
          Add
        </button>
      </div>
    </div>
  );

  if (releasesLoading || settingsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#e63946] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl text-white mb-8" style={{ fontFamily: 'var(--font-heading)' }}>RELEASES</h1>

      {/* Music Settings */}
      <div className="bg-[#141414] border border-[#1a1a1a] rounded-lg p-6 mb-8">
        <h2 className="text-lg text-white mb-4" style={{ fontFamily: 'var(--font-heading)' }}>MUSIC PAGE SETTINGS</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-[#a0a0a0] text-sm mb-2">Subtitle</label>
            <input
              type="text"
              value={musicSubtitle}
              onChange={(e) => { setMusicSubtitle(e.target.value); setSettingsDirty(true); }}
              className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#e63946] transition-colors"
              placeholder="Music page subtitle..."
            />
          </div>
          <div>
            <label className="block text-[#a0a0a0] text-sm mb-2">Spotify Embed URL</label>
            <input
              type="url"
              value={spotifyEmbed}
              onChange={(e) => { setSpotifyEmbed(e.target.value); setSettingsDirty(true); }}
              className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#e63946] transition-colors"
              placeholder="https://open.spotify.com/embed/..."
            />
          </div>
          <button
            onClick={handleSettingsSave}
            disabled={settingsMutation.isPending}
            className="bg-[#e63946] text-white px-5 py-2.5 rounded-lg hover:bg-[#ff6b6b] transition-colors disabled:opacity-50"
          >
            {settingsMutation.isPending ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* Releases */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg text-white" style={{ fontFamily: 'var(--font-heading)' }}>RELEASES</h2>
        <button
          onClick={() => {
            setAddingNew(true);
            setEditForm({ ...emptyForm, sortOrder: releases.length });
          }}
          className="flex items-center gap-2 bg-[#e63946] text-white px-4 py-2 rounded-lg hover:bg-[#ff6b6b] transition-colors text-sm"
        >
          <HiOutlinePlus className="text-lg" />
          Add Release
        </button>
      </div>

      {/* Add New Form */}
      {addingNew && (
        <div className="bg-[#141414] border border-[#e63946]/30 rounded-lg p-5 mb-6">
          <h3 className="text-white font-medium mb-4">New Release</h3>
          {renderForm(handleCreate, createMutation.isPending, 'Create', () => { setAddingNew(false); setEditForm(emptyForm); })}
        </div>
      )}

      {/* Releases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {releases.map((release) => (
          <div key={release.id} className="bg-[#141414] border border-[#1a1a1a] rounded-lg overflow-hidden">
            {editingId === release.id ? (
              <div className="p-5">
                {renderForm(handleSave, updateMutation.isPending, 'Save', () => setEditingId(null))}
              </div>
            ) : (
              <>
                {release.cover && (
                  <img src={release.cover} alt={release.title} className="w-full h-48 object-cover" />
                )}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[#e63946] text-xs font-medium uppercase bg-[#e63946]/10 px-2 py-0.5 rounded">
                      {release.type}
                    </span>
                    <span className="text-[#a0a0a0] text-xs">{release.year}</span>
                  </div>
                  <p className="text-white font-medium">{release.title}</p>
                  <p className="text-[#a0a0a0] text-xs mt-1">
                    {release.links.length} link{release.links.length !== 1 ? 's' : ''} | Sort: {release.sortOrder}
                  </p>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleEdit(release)}
                      className="text-[#a0a0a0] hover:text-white p-2 rounded-lg hover:bg-[#1a1a1a] transition-colors"
                    >
                      <HiOutlinePencil className="text-lg" />
                    </button>
                    <button
                      onClick={() => setLinksOpenFor(linksOpenFor === release.id ? null : release.id)}
                      className={`text-[#a0a0a0] hover:text-white p-2 rounded-lg hover:bg-[#1a1a1a] transition-colors ${linksOpenFor === release.id ? 'text-[#e63946] bg-[#1a1a1a]' : ''}`}
                    >
                      <HiOutlineLink className="text-lg" />
                    </button>
                    <button
                      onClick={() => handleDelete(release.id)}
                      disabled={deleteMutation.isPending}
                      className="text-[#a0a0a0] hover:text-[#e63946] p-2 rounded-lg hover:bg-[#1a1a1a] transition-colors disabled:opacity-50"
                    >
                      <HiOutlineTrash className="text-lg" />
                    </button>
                  </div>
                </div>
                {linksOpenFor === release.id && renderLinksPanel(release)}
              </>
            )}
          </div>
        ))}
      </div>

      {releases.length === 0 && !addingNew && (
        <div className="text-center py-12 text-[#a0a0a0]">
          <p>No releases yet.</p>
          <p className="text-sm mt-1">Click "Add Release" to create one.</p>
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
    </div>
  );
}
