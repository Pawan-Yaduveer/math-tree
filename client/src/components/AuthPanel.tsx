import { useState } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';

const initialFormState = { username: '', password: '' };

const AuthPanel = () => {
  const { user, status, error, login, register, upgrade, logout } = useAuth();
  const [form, setForm] = useState(initialFormState);
  const [mode, setMode] = useState<'login' | 'register'>('login');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (mode === 'login') {
      await login(form.username.trim(), form.password);
    } else {
      await register(form.username.trim(), form.password);
    }
    setForm(initialFormState);
  };

  return (
    <section className="panel">
      <header className="panel__header">
        <div>
          <h2>Account</h2>
          <p>{user ? `Signed in as ${user.username} (${user.role})` : 'Create or sign in to interact'}</p>
        </div>
        {user && (
          <button className="ghost" onClick={logout}>Logout</button>
        )}
      </header>

      {!user && (
        <form onSubmit={handleSubmit} className="stack">
          <div className="tabs">
            <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Login</button>
            <button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>Register</button>
          </div>
          <label>
            <span>Username</span>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
              minLength={3}
            />
          </label>
          <label>
            <span>Password</span>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={6}
            />
          </label>
          {error && <p className="error">{error}</p>}
          <button type="submit" className="primary" disabled={status === 'loading'}>
            {status === 'loading' ? 'Please wait…' : mode === 'login' ? 'Login' : 'Register'}
          </button>
        </form>
      )}

      {user && user.role === 'unregistered' && (
        <div className="panel__upgrade">
          <p>You currently have observer access. Upgrade to start posting operations.</p>
          <button className="primary" onClick={upgrade} disabled={status === 'loading'}>
            {status === 'loading' ? 'Upgrading…' : 'Become Registered'}
          </button>
        </div>
      )}

      {error && user && <p className="error">{error}</p>}
    </section>
  );
};

export default AuthPanel;
