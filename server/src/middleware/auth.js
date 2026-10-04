import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { httpError } from '../httpError.js';
import { User } from '../models/User.js';

// Returns { id, role } for a valid token whose user still exists, else null.
// The existence check stops a token from outliving its account (e.g. after a re-seed).
async function readToken(req) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return null;
  let payload;
  try {
    payload = jwt.verify(header.slice(7), config.jwtSecret);
  } catch {
    return null;
  }
  if (!(await User.exists({ _id: payload.id }))) return null;
  return { id: payload.id, role: payload.role };
}

export async function requireAuth(req, res, next) {
  const user = await readToken(req);
  if (!user) return next(httpError(401, 'Authentication required'));
  req.user = user;
  next();
}

// Sets req.user when a valid token is present, but lets anonymous requests through.
export async function optionalAuth(req, res, next) {
  req.user = await readToken(req);
  next();
}

// Use after requireAuth.
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) return next(httpError(403, 'Forbidden'));
    next();
  };
}
