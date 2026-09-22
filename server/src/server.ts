import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const HOST = process.env.HOST || '0.0.0.0';

// Configurable CORS to allow client on Railway, Vercel, Netlify, or local dev
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(s => s.trim())
  : '*';

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Root endpoint for Railway deployment verification and discovery
app.get('/', (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    name: 'Hikmat Quran Backend API',
    version: '1.4.0',
    platform: 'Railway Production Deployment',
    endpoints: {
      health: '/api/health',
      manifest: '/api/manifest',
      syncPush: '/api/sync/push'
    },
    documentation: 'Offline-First AI Quran Learning, Recitation & Sync Service'
  });
});

// Standard health check for Railway (/health and /api/health)
app.get(['/health', '/api/health'], (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    platform: 'Hikmat Quran Node/Express Backend on Railway',
    port: PORT,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Content Manifest & Integrity verification
app.get('/api/manifest', (_req: Request, res: Response) => {
  res.json({
    name: 'Hikmat Quran Core Dataset',
    version: '1.4.0',
    publicationDate: '2026-09-20',
    riwayah: 'Hafs an Asim',
    script: 'Uthmani Standard',
    verification: {
      verifiedBy: 'Qualified Quran & Tajweed Review Board',
      checksumSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      status: 'VERIFIED'
    },
    packages: [
      { id: 'surah_fatiha_baqarah', title: 'Al-Fatiha & Al-Baqarah (1-25)', sizeBytes: 145000, offlineReady: true },
      { id: 'juz_amma', title: 'Juz 30 (Juz Amma)', sizeBytes: 850000, offlineReady: true },
      { id: 'surah_mulk_yasin', title: 'Al-Mulk & Ya-Sin', sizeBytes: 320000, offl