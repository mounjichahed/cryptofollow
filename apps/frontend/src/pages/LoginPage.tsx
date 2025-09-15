import { FormEvent, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

export default function LoginPage() {
  const { token, login, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await api.post<{ accessToken: string }>('/auth/login', { email, password });
      await login(res.data.accessToken);
      navigate('/');
    } catch (err: any) {
      const apiMsg = err?.response?.data?.message || err?.message || 'Erreur de connexion';
      setMessage(apiMsg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Login</h2>
      {isAuthenticated ? (
        <div className="space-y-2">
          <p className="text-sm text-gray-600 dark:text-gray-300 break-all">Token: {token}</p>
          <button className="px-3 py-2 rounded bg-gray-200 dark:bg-gray-700" onClick={logout}>
            Logout
          </button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-3">
          <input
            className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="px-3 py-2 rounded bg-blue-600 text-white" type="submit" disabled={loading}>
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
      </form>
      )}
      {message && <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">{message}</p>}
    </section>
  );
}
