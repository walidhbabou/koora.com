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

  const leagueId = Number(req.query.league || req.query.id || 0);
  const season = Number(req.query.season || new Date().getFullYear());

  const headers = {
    'x-apisports-key': API_KEY,
    'X-RapidAPI-Key': API_KEY,
    'Accept': 'application/json'
  } as Record<string,string>;

  try {
    if (!leagueId) {
      // Return a small list of standings for main leagues
      const sampleLeagues = [39, 61, 140, 78, 135];
      const promises = sampleLeagues.map(id => fetchJson(`${API_BASE}/standings?league=${id}&season=${season}`, headers));
      const results = await Promise.all(promises);
      const cleaned = results.filter(r => r && Array.isArray(r.response)).map(r => r.response[0]);
      res.setHeader('Content-Type', 'application/json');
      res.status(200).json(cleaned);
      return;
    }

    const json = await fetchJson(`${API_BASE}/standings?league=${leagueId}&season=${season}`, headers);
    if (!json) {
      res.status(200).json([]);
      return;
    }
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(json.response || []);
  } catch (err) {
    res.status(500).json([]);
  }
}
