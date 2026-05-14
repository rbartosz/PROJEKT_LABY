import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminPanel({ token, onBack }) {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  const headers = { Authorization: `Bearer ${token}` };

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/admin/users', { headers });
      setUsers(res.data);
    } catch (err) {
      setError('Nie udało się pobrać użytkowników.');
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (id, email) => {
    if (!confirm(`Usunąć użytkownika ${email}?`)) return;
    try {
      await axios.delete(`http://localhost:3000/api/admin/users/${id}`, { headers });
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      setError('Nie udało się usunąć użytkownika.');
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">🛡️ Panel Admina</h1>
          <button onClick={onBack} className="rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-600">
            ← Wróć do aplikacji
          </button>
        </div>

        {error && <p className="mb-4 rounded-lg bg-red-500/20 px-4 py-2 text-sm text-red-300">{error}</p>}

        <div className="rounded-xl bg-slate-800/80 p-4 shadow-xl">
          <h2 className="mb-4 text-sm font-semibold text-slate-300">Użytkownicy ({users.length})</h2>
          <div className="space-y-2">
            {users.map((u) => (
              <div key={u.id} className="flex items-center justify-between rounded-lg bg-slate-700/50 px-4 py-3">
                <div>
                  <span className="text-sm text-white">{u.email}</span>
                  <span className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium ${u.role === 'admin' ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-blue-300'}`}>
                    {u.role}
                  </span>
                </div>
                {u.role !== 'admin' && (
                  <button
                    onClick={() => handleDelete(u.id, u.email)}
                    className="rounded-lg px-3 py-1 text-xs font-medium text-red-400 hover:bg-red-600/20"
                  >
                    Usuń
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
