import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { httpError } from '../httpError.js';

function readToken(req) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return null;
  try {
    const payload = jwt.verify(header.slice(7), config.jwtSecret);
    return { id: payload.id, role: payload.role };
  } catch {
    return null;
  }
}

export function requireAuth(req, res, next) {
  const user = readToken(req);
  if (!user) return next(httpError(401, 'Authentication required'));
  req.user = user;
  next();
}

// Sets req.user when a valid token is present, but lets anonymous requests through.
export function optionalAuth(req, res, next) {
  req.user = readToken(req);
  next();
}

// Use after requireAuth.
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) return next(httpError(403, 'Forbidden'));
    next();
  };
}
