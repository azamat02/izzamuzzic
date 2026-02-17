import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth';

export function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/admin');
    } catch {
      setError('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src="/logo_white.png" alt="IZZAMUZZIC" className="h-12 mx-auto mb-4" />
          <h1 className="text-2xl text-white" style={{ fontFamily: 'var(--font-heading)' }}>ADMIN PANEL</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[#a0a0a0] text-sm mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#141414] border border-[#1a1a1a] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#e63946] transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-[#a0a0a0] text-sm mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#141414] border border-[#1a1a1a] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#e63946] transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#e63946] text-white py-3 rounded-lg font-medium hover:bg-[#ff6b6b] transition-colors duration-300 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center mt-6">
          <a href="/" className="text-[#a0a0a0] hover:text-white text-sm transition-colors">
            &larr; Back to site
          </a>
        </div>
      </div>
    </div>
  );
}
