import type { VercelRequest, VercelResponse } from '@vercel/node';

const API_BASE = 'https://v3.football.api-sports.io';
const API_KEY = process.env.FOOTBALL_API_KEY || process.env.VITE_FOOTBALL_API_KEY || process.env.X_RAPIDAPI_KEY;

async function fetchJson(url: string, headers: Record<string,string>) {
  try {
    const r = await fetch(url, { headers });
    if (!r.ok) return null;
    return await r.json();
  } catch (e) {
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!API_KEY) {
    res.status(200).json([]);
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

    const live = (liveJson && Array.isArray(liveJson.response)) ? liveJson.response : [];
    const todayFixtures = (todayJson && Array.isArray(todayJson.response)) ? todayJson.response : [];

    // Merge and dedupe by fixture id
    const map = new Map<number, any>();
    [...live, ...todayFixtures].forEach((item: any) => {
      const id = item.fixture?.id || item.id || 0;
      if (!map.has(id) && id) map.set(id, item);
    });

    const result = Array.from(map.values()).slice(0, 100).map((f: any) => ({
      id: f.fixture?.id || f.id,
      date: f.fixture?.date || f.date,
      league: f.league || null,
      teams: f.teams || f.teams || null
    }));

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json([]);
  }
}
