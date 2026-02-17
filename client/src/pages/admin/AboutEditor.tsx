import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { ImageUploader } from '../../components/admin/ImageUploader';

interface AboutData {
  id: number;
  photo: string;
  paragraph1: string;
  paragraph2: string;
  paragraph3: string;
  stat1Value: string;
  stat1Label: string;
  stat2Value: string;
  stat2Label: string;
  stat3Value: string;
  stat3Label: string;
  subtitle: string;
}

interface AboutForm {
  photo: string;
  paragraph1: string;
  paragraph2: string;
  paragraph3: string;
  stat1Value: string;
  stat1Label: string;
  stat2Value: string;
  stat2Label: string;
  stat3Value: string;
  stat3Label: string;
  subtitle: string;
}

const emptyForm: AboutForm = {
  photo: '',
  paragraph1: '',
  paragraph2: '',
  paragraph3: '',
  stat1Value: '',
  stat1Label: '',
  stat2Value: '',
  stat2Label: '',
  stat3Value: '',
  stat3Label: '',
  subtitle: '',
};

export function AboutEditor() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<AboutForm>(emptyForm);

  const { data: about, isLoading } = useQuery({
    queryKey: ['about'],
    queryFn: () => api.get<AboutData>('/about'),
  });

  useEffect(() => {
    if (about) {
      setForm({
        photo: about.photo || '',
        paragraph1: about.paragraph1 || '',
        paragraph2: about.paragraph2 || '',
        paragraph3: about.paragraph3 || '',
        stat1Value: about.stat1Value || '',
        stat1Label: about.stat1Label || '',
        stat2Value: about.stat2Value || '',
        stat2Label: about.stat2Label || '',
        stat3Value: about.stat3Value || '',
        stat3Label: about.stat3Label || '',
        subtitle: about.subtitle || '',
      });
    }
  }, [about]);

  const saveMutation = useMutation({
    mutationFn: (data: AboutForm) => api.put('/about', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['about'] });
    },
  });

  const handleSave = () => {
    saveMutation.mutate(form);
  };

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
        <h1 className="text-3xl text-white" style={{ fontFamily: 'var(--font-heading)' }}>ABOUT</h1>
        <button
          onClick={handleSave}
          disabled={saveMutation.isPending}
          className="bg-[#e63946] text-white px-6 py-2.5 rounded-lg hover:bg-[#ff6b6b] transition-colors disabled:opacity-50"
        >
          {saveMutation.isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {saveMutation.isSuccess && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg text-sm mb-6">
          Changes saved successfully.
        </div>
      )}

      {saveMutation.isError && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm mb-6">
          Failed to save changes. Please try again.
        </div>
      )}

      <div className="space-y-6">
        {/* Subtitle */}
        <div className="bg-[#141414] border border-[#1a1a1a] rounded-lg p-6">
          <h2 className="text-lg text-white mb-4" style={{ fontFamily: 'var(--font-heading)' }}>PAGE SETTINGS</h2>
          <div>
            <label className="block text-[#a0a0a0] text-sm mb-2">Subtitle</label>
            <input
              type="text"
              value={form.subtitle}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#e63946] transition-colors"
              placeholder="About page subtitle..."
            />
          </div>
        </div>

        {/* Photo */}
        <div className="bg-[#141414] border border-[#1a1a1a] rounded-lg p-6">
          <h2 className="text-lg text-white mb-4" style={{ fontFamily: 'var(--font-heading)' }}>PHOTO</h2>
          <ImageUploader
            value={form.photo}
            onChange={(url) => setForm({ ...form, photo: url })}
            className="max-w-md"
          />
        </div>

        {/* Paragraphs */}
        <div className="bg-[#141414] border border-[#1a1a1a] rounded-lg p-6">
          <h2 className="text-lg text-white mb-4" style={{ fontFamily: 'var(--font-heading)' }}>BIO</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-[#a0a0a0] text-sm mb-2">Paragraph 1</label>
              <textarea
                value={form.paragraph1}
                onChange={(e) => setForm({ ...form, paragraph1: e.target.value })}
                rows={4}
                className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#e63946] transition-colors resize-vertical"
                placeholder="First paragraph..."
              />
            </div>
            <div>
              <label className="block text-[#a0a0a0] text-sm mb-2">Paragraph 2</label>
              <textarea
                value={form.paragraph2}
                onChange={(e) => setForm({ ...form, paragraph2: e.target.value })}
                rows={4}
                className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#e63946] transition-colors resize-vertical"
                placeholder="Second paragraph..."
              />
            </div>
            <div>
              <label className="block text-[#a0a0a0] text-sm mb-2">Paragraph 3</label>
              <textarea
                value={form.paragraph3}
                onChange={(e) => setForm({ ...form, paragraph3: e.target.value })}
                rows={4}
                className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#e63946] transition-colors resize-vertical"
                placeholder="Third paragraph..."
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-[#141414] border border-[#1a1a1a] rounded-lg p-6">
          <h2 className="text-lg text-white mb-4" style={{ fontFamily: 'var(--font-heading)' }}>STATS</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h3 className="text-[#e63946] text-sm font-medium">Stat 1</h3>
              <div>
                <label className="block text-[#a0a0a0] text-sm mb-2">Value</label>
                <input
                  type="text"
                  value={form.stat1Value}
                  onChange={(e) => setForm({ ...form, stat1Value: e.target.value })}
                  className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#e63946] transition-colors"
                  placeholder="e.g. 1M+"
                />
              </div>
              <div>
                <label className="block text-[#a0a0a0] text-sm mb-2">Label</label>
                <input
                  type="text"
                  value={form.stat1Label}
                  onChange={(e) => setForm({ ...form, stat1Label: e.target.value })}
                  className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#e63946] transition-colors"
                  placeholder="e.g. Monthly Listeners"
                />
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-[#e63946] text-sm font-medium">Stat 2</h3>
              <div>
                <label className="block text-[#a0a0a0] text-sm mb-2">Value</label>
                <input
                  type="text"
                  value={form.stat2Value}
                  onChange={(e) => setForm({ ...form, stat2Value: e.target.value })}
                  className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#e63946] transition-colors"
                  placeholder="e.g. 50+"
                />
              </div>
              <div>
                <label className="block text-[#a0a0a0] text-sm mb-2">Label</label>
                <input
                  type="text"
                  value={form.stat2Label}
                  onChange={(e) => setForm({ ...form, stat2Label: e.target.value })}
                  className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#e63946] transition-colors"
                  placeholder="e.g. Releases"
                />
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-[#e63946] text-sm font-medium">Stat 3</h3>
              <div>
                <label className="block text-[#a0a0a0] text-sm mb-2">Value</label>
                <input
                  type="text"
                  value={form.stat3Value}
                  onChange={(e) => setForm({ ...form, stat3Value: e.target.value })}
                  className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#e63946] transition-colors"
                  placeholder="e.g. 100M+"
                />
              </div>
              <div>
                <label className="block text-[#a0a0a0] text-sm mb-2">Label</label>
                <input
                  type="text"
                  value={form.stat3Label}
                  onChange={(e) => setForm({ ...form, stat3Label: e.target.value })}
                  className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#e63946] transition-colors"
                  placeholder="e.g. Total Streams"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="bg-[#e63946] text-white px-8 py-3 rounded-lg hover:bg-[#ff6b6b] transition-colors disabled:opacity-50"
          >
            {saveMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
