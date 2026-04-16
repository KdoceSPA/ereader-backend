import './config/env'; // Validate env vars at startup
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth.routes';
import booksRoutes from './routes/books.routes';
import uploadRoutes from './routes/upload.routes';
import institutionsRoutes from './routes/institutions.routes';
import usersRoutes from './routes/users.routes';

const app = express();

// Ensure storage directories exist on startup
const storageDirs = [
  path.join(env.STORAGE_PATH, 'covers'),
  path.join(env.STORAGE_PATH, 'books'),
];
storageDirs.forEach((dir) => fs.mkdirSync(dir, { recursive: true }));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving for storage
app.use('/storage', express.static(path.resolve(env.STORAGE_PATH)));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', booksRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/institutions', institutionsRoutes);
app.use('/api/users', usersRoutes);

// Error handler (must be last)
app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`Server running on http://localhost:${env.PORT}`);
  console.log(`Environment: ${env.NODE_ENV}`);
});

export default app;
