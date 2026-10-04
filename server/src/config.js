import 'dotenv/config';

export const config = {
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/micro-lms',
  jwtSecret: process.env.JWT_SECRET,
  port: Number(process.env.PORT) || 5000,
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
};
