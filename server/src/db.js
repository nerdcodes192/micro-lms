import mongoose from 'mongoose';
import { config } from './config.js';
import { Enrollment } from './models/Enrollment.js';

// Connect once and reuse the promise (a warm serverless instance keeps it).
let ready = null;
export function connectDb() {
  ready ??= mongoose
    .connect(config.mongoUri)
    // Make sure the unique {student, course} index exists before accepting requests.
    .then(() => Enrollment.syncIndexes())
    .catch((err) => {
      ready = null; // let the next call retry
      throw err;
    });
  return ready;
}
