import mongoose from 'mongoose';

// Express 5 forwards errors thrown in async handlers here automatically.
export function errorHandler(err, req, res, next) {
  if (err.status) return res.status(err.status).json({ error: err.message });

  if (err instanceof mongoose.Error.ValidationError) {
    const message = Object.values(err.errors).map((e) => e.message).join(', ');
    return res.status(400).json({ error: message });
  }
  // A malformed ObjectId can never match a document, so treat it as "not found".
  if (err instanceof mongoose.Error.CastError) {
    return res.status(404).json({ error: 'Not found' });
  }
  if (err.code === 11000) return res.status(409).json({ error: 'Duplicate value' });
  // Malformed JSON body from express.json().
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON' });

  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
}
