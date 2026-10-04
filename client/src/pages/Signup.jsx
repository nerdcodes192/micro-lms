import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, homeFor } from '../AuthContext.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import { input, button } from '../components/ui.js';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const user = await signup(form);
      navigate(homeFor(user));
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto mt-10 max-w-sm space-y-4 rounded bg-white p-6 shadow">
      <h1 className="text-xl font-semibold">Sign up</h1>
      <ErrorMessage error={error} />
      <input className={input} placeholder="Name" required value={form.name} onChange={update('name')} />
      <input className={input} type="email" placeholder="Email" required
        value={form.email} onChange={update('email')} />
      <input className={input} type="password" placeholder="Password (min 6 characters)" required
        minLength={6} value={form.password} onChange={update('password')} />
      <div className="flex gap-4 text-sm">
        {['student', 'instructor'].map((role) => (
          <label key={role} className="flex items-center gap-1">
            <input type="radio" name="role" value={role}
              checked={form.role === role} onChange={update('role')} />
            {role === 'student' ? 'Student' : 'Instructor'}
          </label>
        ))}
      </div>
      <button className={`${button} w-full`} disabled={busy}>Create account</button>
      <p className="text-sm text-slate-600">
        Have an account? <Link to="/login" className="underline">Log in</Link>
      </p>
    </form>
  );
}
