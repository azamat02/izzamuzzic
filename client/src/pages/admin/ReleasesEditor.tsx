import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { ImageUploader } from '../../components/admin/ImageUploader';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineCheck, HiOutlineX } from 'react-icons/hi';

interface Release {
  id: number;
  title: string;
  type: string;
  year: number;
  cover: string;
  spotifyUrl: string;
  youtubeUrl: string;
  sortOrder: number;
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
  spotifyUrl: string;
  youtubeUrl: string;
  sortOrder: number;
}

const releaseTypes = ['single', 'ep', 'album'];

const emptyForm: ReleaseForm = {
  title: '',
  type: 'single',
  year: new Date().getFullYear(),
  cover: '',
  spotifyUrl: '',
  youtubeUrl: '',
  sortOrder: 0,
};

export function ReleasesEditor() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [editForm, setEditForm] = useState<ReleaseForm>(emptyForm);
  const [musicSubtitle, setMusicSubtitle] = useState('');
  const [spotifyEmbed, setSpotifyEmbed] = useState('');
  const [settingsDirty, setSettingsDirty] = useState(false);

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

  const handleEdit = (release: Release) => {
    setEditingId(release.id);
    setEditForm({
      title: release.title,
      type: release.type,
      year: release.year,
      cover: release.cover,
      spotifyUrl: release.spotifyUrl,
      youtubeUrl: release.youtubeUrl,
      sortOrder: release.sortOrder,
    });
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this release?')) {
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

  const handleSettingsSave = () => {
    settingsMutation.mutate({ subtitle: musicSubtitle, spotifyEmbedUrl: spotifyEmbed });
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
            <label className="block text-[#a0a0a0] text-sm mb-2">Spotify URL</label>
            <input
              type="url"
              value={editForm.spotifyUrl}
              onChange={(e) => setEditForm({ ...editForm, spotifyUrl: e.target.value })}
              className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#e63946] transition-colors"
              placeholder="https://open.spotify.com/..."
            />
          </div>
          <div>
            <label className="block text-[#a0a0a0] text-sm mb-2">YouTube URL</label>
            <input
              type="url"
              value={editForm.youtubeUrl}
              onChange={(e) => setEditForm({ ...editForm, youtubeUrl: e.target.value })}
              className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#e63946] transition-colors"
              placeholder="https://youtube.com/..."
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
                  {release.spotifyUrl && (
                    <p className="text-[#a0a0a0] text-xs mt-1 truncate">Spotify: {release.spotifyUrl}</p>
                  )}
                  {release.youtubeUrl && (
                    <p className="text-[#a0a0a0] text-xs truncate">YouTube: {release.youtubeUrl}</p>
                  )}
                  <p className="text-[#a0a0a0] text-xs mt-1">Sort: {release.sortOrder}</p>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleEdit(release)}
                      className="text-[#a0a0a0] hover:text-white p-2 rounded-lg hover:bg-[#1a1a1a] transition-colors"
                    >
                      <HiOutlinePencil className="text-lg" />
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
    </div>
  );
}
