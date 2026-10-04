import mongoose from 'mongoose';
import { config } from './config.js';
import { createApp } from './app.js';
import { Enrollment } from './models/Enrollment.js';

if (!config.jwtSecret) {
  console.error('JWT_SECRET is not set — see server/.env.example');
  process.exit(1);
}

try {
  await mongoose.connect(config.mongoUri);
  // Make sure the unique {student, course} index exists before accepting requests.
  await Enrollment.syncIndexes();
  console.log('MongoDB connected'); // URI not logged: it can contain credentials
} catch (err) {
  console.error(`Failed to connect to MongoDB: ${err.message}`);
  process.exit(1);
}

createApp().listen(config.port, () => {
  console.log(`API listening on http://localhost:${config.port}`);
});
