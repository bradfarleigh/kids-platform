import express from 'express';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'kids123';
const YT_API_KEY = process.env.YOUTUBE_API_KEY || '';
const VIDEOS_PATH = join(__dir, 'data/videos.json');

app.use(express.json());
app.use(express.static(join(__dir, 'public')));

// ── Auth middleware ────────────────────────────────────────────────
function requireAdmin(req, res, next) {
  const auth = req.headers['authorization'] ?? '';
  if (auth === `Bearer ${ADMIN_PASSWORD}`) return next();
  res.status(401).json({ error: 'Unauthorized' });
}

function loadVideos() {
  try { return JSON.parse(readFileSync(VIDEOS_PATH, 'utf8')); }
  catch { return []; }
}

function saveVideos(videos) {
  writeFileSync(VIDEOS_PATH, JSON.stringify(videos, null, 2));
}

// ── Video API ──────────────────────────────────────────────────────
app.get('/api/videos', (req, res) => {
  res.json(loadVideos());
});

app.post('/api/videos', requireAdmin, (req, res) => {
  const { id, title, thumbnail, channelTitle, age = 'all' } = req.body;
  if (!id || !title) return res.status(400).json({ error: 'id and title required' });
  const videos = loadVideos();
  if (videos.find(v => v.id === id)) return res.status(409).json({ error: 'Already added' });
  videos.push({ id, title, thumbnail, channelTitle, age, addedAt: new Date().toISOString() });
  saveVideos(videos);
  res.json({ ok: true });
});

app.delete('/api/videos/:id', requireAdmin, (req, res) => {
  const videos = loadVideos().filter(v => v.id !== req.params.id);
  saveVideos(videos);
  res.json({ ok: true });
});

app.patch('/api/videos/:id', requireAdmin, (req, res) => {
  const videos = loadVideos();
  const v = videos.find(v => v.id === req.params.id);
  if (!v) return res.status(404).json({ error: 'Not found' });
  Object.assign(v, req.body);
  saveVideos(videos);
  res.json({ ok: true });
});

// ── YouTube search proxy ───────────────────────────────────────────
app.get('/api/youtube/search', requireAdmin, async (req, res) => {
  if (!YT_API_KEY) return res.status(503).json({ error: 'No YouTube API key configured' });
  const q = encodeURIComponent(req.query.q ?? '');
  const max = Math.min(parseInt(req.query.maxResults ?? 12), 24);
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&safeSearch=strict&q=${q}&maxResults=${max}&key=${YT_API_KEY}`;
  try {
    const r = await fetch(url);
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: data.error?.message ?? 'YouTube error' });
    const items = (data.items ?? []).map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails?.medium?.url,
      channelTitle: item.snippet.channelTitle,
    }));
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => console.log(`Kids platform running on http://localhost:${PORT}`));
