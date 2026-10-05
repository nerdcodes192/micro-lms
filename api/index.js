// Vercel serverless entry: vercel.json rewrites every /api/* request here.
// Local development still runs server/src/index.js.
import { config } from '../server/src/config.js';
import { createApp } from '../server/src/app.js';
import { connectDb } from '../server/src/db.js';

const app = createApp();

export default async function handler(req, res) {
  if (!config.jwtSecret) {
    return res.status(500).json({ error: 'JWT_SECRET is not set' });
  }
  try {
    await connectDb();
  } catch (err) {
    console.error(`Failed to connect to MongoDB: ${err.message}`);
    return res.status(500).json({ error: 'Database unavailable' });
  }
  return app(req, res);
}
