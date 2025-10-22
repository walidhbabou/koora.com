import type { VercelRequest, VercelResponse } from '@vercel/node';

const API_BASE = 'https://v3.football.api-sports.io';
const API_KEY = process.env.FOOTBALL_API_KEY || process.env.VITE_FOOTBALL_API_KEY || process.env.X_RAPIDAPI_KEY;

async function fetchJson(url: string, headers: Record<string,string>) {
  try {
    const r = await fetch(url, { headers });
    const text = await r.text();
    if (!r.ok) {
      console.error('[api/matches] upstream error', { url, status: r.status, statusText: r.statusText, bodySnippet: text.slice(0, 500) });
      return { error: true, status: r.status, statusText: r.statusText, body: text };
    }
    try {
      return JSON.parse(text);
    } catch (error_) {
      console.error('[api/matches] invalid JSON', { url, parseErr: String(error_), textSnippet: text.slice(0, 500) });
      return { error: true, parseErr: String(error_) };
    }
  } catch (e) {
    console.error('[api/matches] fetch failed', { url, err: String(e) });
    return { error: true, err: String(e) };
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!API_KEY) {
    console.error('[api/matches] missing API key');
    res.setHeader('Content-Type', 'application/json');
    res.status(500).json({ error: 'Missing football API key on server (FOOTBALL_API_KEY)' });
    return;
  }

  const headers = {
    'x-apisports-key': API_KEY,
    'X-RapidAPI-Key': API_KEY,
    'Accept': 'application/json'
  } as Record<string,string>;

  try {
    const today = new Date().toISOString().split('T')[0];
    const liveUrl = `${API_BASE}/fixtures?live=all`;
    const todayUrl = `${API_BASE}/fixtures?date=${today}`;

    const [liveJson, todayJson] = await Promise.all([
      fetchJson(liveUrl, headers),
      fetchJson(todayUrl, headers)
    ]);

    if (liveJson?.error || todayJson?.error) {
      console.error('[api/matches] upstream returned error', { liveJson, todayJson });
      res.setHeader('Content-Type', 'application/json');
      res.status(502).json({ error: 'Upstream football API error', details: { liveJson: sanitize(liveJson), todayJson: sanitize(todayJson) } });
      return;
    }

    const live = (liveJson && Array.isArray(liveJson.response)) ? liveJson.response : [];
    const todayFixtures = (todayJson && Array.isArray(todayJson.response)) ? todayJson.response : [];

    const map = new Map<number, any>();
    for (const item of [...live, ...todayFixtures]) {
      const id = item.fixture?.id || item.id || 0;
      if (!map.has(id) && id) map.set(id, item);
    }

    const result = Array.from(map.values()).slice(0, 100).map((f: any) => ({
      id: f.fixture?.id || f.id,
      date: f.fixture?.date || f.date,
      league: f.league || null,
      teams: f.teams || null
    }));

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(result);
  } catch (err) {
    console.error('[api/matches] unexpected error', err);
    res.setHeader('Content-Type', 'application/json');
    res.status(500).json({ error: 'Internal server error', message: String(err) });
  }
}


function sanitize(obj: any) {
  if (!obj) return null;
  if (typeof obj !== 'object') return obj;
  try {
    // Keep only shallow fields to avoid huge logs
    return { status: obj.status || null, statusText: obj.statusText || null, hasResponse: !!obj.response };
  } catch (e) {
    return null;
  }
}
