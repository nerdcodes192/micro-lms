import mongoose from 'mongoose';
import { config } from './config.js';
import { createApp } from './app.js';

try {
  await mongoose.connect(config.mongoUri);
  console.log(`MongoDB connected: ${config.mongoUri}`);
} catch (err) {
  console.error(`Failed to connect to MongoDB at ${config.mongoUri}: ${err.message}`);
  process.exit(1);
}

createApp().listen(config.port, () => {
  console.log(`API listening on http://localhost:${config.port}`);
});
