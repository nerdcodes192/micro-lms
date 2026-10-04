import { createContext, useContext, useState } from 'react';
import { api } from './api.js';

const AuthContext = createContext(null);

function loadUser() {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
}

// Keeps token + user in localStorage so a page refresh stays logged in.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser);

  function saveSession({ token, user }) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
    return user;
  }

  async function login(email, password) {
    return saveSession(await api('/auth/login', { method: 'POST', body: { email, password } }));
  }

  async function signup(fields) {
    return saveSession(await api('/auth/signup', { method: 'POST', body: fields }));
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

// Where each role lands after login/signup.
export function homeFor(user) {
  return user?.role === 'instructor' ? '/instructor' : '/';
}
