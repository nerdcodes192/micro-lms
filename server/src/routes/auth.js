import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { config } from '../config.js';
import { httpError } from '../httpError.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

function signToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, config.jwtSecret, { expiresIn: '7d' });
}

router.post('/signup', async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email) throw httpError(400, 'Name and email are required');
  if (!['instructor', 'student'].includes(role)) {
    throw httpError(400, 'Role must be instructor or student');
  }
  if (typeof password !== 'string' || password.length < 6) {
    throw httpError(400, 'Password must be at least 6 characters');
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash, role });
    res.status(201).json({ token: signToken(user), user });
  } catch (err) {
    if (err.code === 11000) throw httpError(409, 'Email already registered');
    throw err;
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = email ? await User.findOne({ email: String(email).trim().toLowerCase() }) : null;
  const ok = user && (await bcrypt.compare(String(password || ''), user.passwordHash));
  // Same message either way, so the response doesn't reveal which emails exist.
  if (!ok) throw httpError(401, 'Invalid email or password');
  res.json({ token: signToken(user), user });
});

router.get('/me', requireAuth, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) throw httpError(401, 'Authentication required');
  res.json({ user });
});

export default router;
