import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Presentation, Check } from 'lucide-react';
import { useAuth, homeFor } from '../AuthContext.jsx';
import AuthLayout from '../components/AuthLayout.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import Button from '../components/Button.jsx';
import { Field, Input } from '../components/Field.jsx';

const roles = [
  { value: 'student', label: 'Learn as a Student', icon: GraduationCap },
  { value: 'instructor', label: 'Teach as an Instructor', icon: Presentation },
];

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
    <AuthLayout
      title="Create your account"
      subtitle="Start learning or teaching in minutes."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-700">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <ErrorMessage error={error} />
        <Field label="Name" htmlFor="name">
          <Input id="name" autoComplete="name" placeholder="Jane Doe" required value={form.name} onChange={update('name')} />
        </Field>
        <Field label="Email" htmlFor="email">
          <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" required
            value={form.email} onChange={update('email')} />
        </Field>
        <Field label="Password" htmlFor="password" hint="At least 6 characters.">
          <Input id="password" type="password" autoComplete="new-password" placeholder="••••••••" required minLength={6}
            value={form.password} onChange={update('password')} />
        </Field>

        <fieldset className="space-y-1.5">
          <legend className="mb-1.5 text-sm font-medium text-zinc-700">I want to…</legend>
          <div className="grid grid-cols-2 gap-3">
            {roles.map(({ value, label, icon: Icon }) => {
              const selected = form.role === value;
              return (
                <label
                  key={value}
                  className={`relative flex cursor-pointer flex-col gap-3 rounded-xl border p-4 transition-all duration-200 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-indigo-500 ${
                    selected
                      ? 'border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-600'
                      : 'border-zinc-200 bg-white hover:border-zinc-300'
                  }`}
                >
                  <input type="radio" name="role" value={value} checked={selected} onChange={update('role')}
                    className="sr-only" />
                  <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${selected ? 'bg-indigo-600 text-white' : 'bg-zinc-100 text-zinc-500'}`}>
                    <Icon size={18} />
                  </span>
                  <span className={`text-sm leading-snug font-medium ${selected ? 'text-indigo-900' : 'text-zinc-700'}`}>
                    {label}
                  </span>
                  {selected && (
                    <Check size={16} strokeWidth={3} className="absolute top-3 right-3 text-indigo-600" />
                  )}
                </label>
              );
            })}
          </div>
        </fieldset>

        <Button type="submit" className="w-full" loading={busy}>
          Create Account
        </Button>
      </form>
    </AuthLayout>
  );
}
