import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

// CORS configuration — allow localhost in dev, production domains in prod
const allowedOrigins = [
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/,
  /^https:\/\/.*\.vercel\.app$/,
  /^https:\/\/tatvalife\.com$/,
  /^https:\/\/.*\.tatvalife\.com$/,
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const allowed = allowedOrigins.some(pattern => pattern.test(origin));
    if (allowed) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Wire up API router
app.use('/api', router);

// Root path handler
app.get('/', (req, res) => {
  res.json({ message: 'Tatvalife Full-Stack API Server is operational.' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error occurred.' });
});

// Start server only when NOT in serverless (Vercel) environment
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`Tatvalife Node.js backend server listening on port ${PORT}`);
  });
}

// Export for Vercel serverless
export default app;
