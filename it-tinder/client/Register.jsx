import React, { useState } from 'react';
import axios from 'axios';

export default function Register({ onSwitch }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await axios.post('http://localhost:3000/api/auth/register', { email, password });
      setSuccess('Zarejestrowano! Możesz się teraz zalogować.');
    } catch (err) {
      setError(err.response?.data?.error || 'Błąd rejestracji.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-slate-800/80 p-8 shadow-2xl backdrop-blur-sm">
        <h1 className="mb-2 text-center text-3xl font-extrabold text-white">🔥 IT Tinder</h1>
        <p className="mb-6 text-center text-sm text-slate-400">Rejestracja</p>

        {error && (
          <p className="mb-4 rounded-lg bg-red-500/20 px-4 py-2 text-center text-sm text-red-300">{error}</p>
        )}
        {success && (
          <p className="mb-4 rounded-lg bg-green-500/20 px-4 py-2 text-center text-sm text-green-300">{success}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg bg-slate-700 px-4 py-3 text-sm text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Hasło"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-lg bg-slate-700 px-4 py-3 text-sm text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white transition-all hover:bg-blue-500 disabled:opacity-50"
          >
            {loading ? 'Rejestracja...' : 'Zarejestruj się'}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-slate-400">
          Masz już konto?{' '}
          <button onClick={onSwitch} className="text-blue-400 hover:underline">
            Zaloguj się
          </button>
        </p>
      </div>
    </div>
  );
}
