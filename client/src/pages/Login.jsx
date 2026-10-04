import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, homeFor } from '../AuthContext.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import { input, button } from '../components/ui.js';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const user = await login(email, password);
      navigate(homeFor(user));
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto mt-10 max-w-sm space-y-4 rounded bg-white p-6 shadow">
      <h1 className="text-xl font-semibold">Log in</h1>
      <ErrorMessage error={error} />
      <input className={input} type="email" placeholder="Email" required
        value={email} onChange={(e) => setEmail(e.target.value)} />
      <input className={input} type="password" placeholder="Password" required
        value={password} onChange={(e) => setPassword(e.target.value)} />
      <button className={`${button} w-full`} disabled={busy}>Log in</button>
      <p className="text-sm text-slate-600">
        No account? <Link to="/signup" className="underline">Sign up</Link>
      </p>
    </form>
  );
}
