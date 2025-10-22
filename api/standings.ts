import type { VercelRequest, VercelResponse } from '@vercel/node';

const API_BASE = 'https://v3.football.api-sports.io';
const API_KEY = process.env.FOOTBALL_API_KEY || process.env.VITE_FOOTBALL_API_KEY || process.env.X_RAPIDAPI_KEY;

async function fetchJson(url: string, headers: Record<string,string>) {
  try {
    const r = await fetch(url, { headers });
    const text = await r.text();
    if (!r.ok) {
      console.error('[api/standings] upstream error', { url, status: r.status, statusText: r.statusText, bodySnippet: text.slice(0, 500) });
      return { error: true, status: r.status, statusText: r.statusText, body: text };
    }
    try {
      return JSON.parse(text);
    } catch (error_) {
      console.error('[api/standings] invalid JSON', { url, parseErr: String(error_), textSnippet: text.slice(0, 500) });
      return { error: true, parseErr: String(error_) };
    }
  } catch (e) {
    console.error('[api/standings] fetch failed', { err: String(e) });
    return { error: true, err: String(e) };
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!API_KEY) {
    console.error('[api/standings] missing API key');
    res.setHeader('Content-Type', 'application/json');
    res.status(500).json({ error: 'Missing football API key on server (FOOTBALL_API_KEY)' });
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
      const sampleLeagues = [39, 61, 140, 78, 135];
      const promises: Promise<any>[] = sampleLeagues.map(id => fetchJson(`${API_BASE}/standings?league=${id}&season=${season}`, headers));
      const results = await Promise.all(promises);
      const cleaned = results.filter(r => r && Array.isArray(r.response)).map(r => r.response[0]);
      res.setHeader('Content-Type', 'application/json');
      res.status(200).json(cleaned);
      return;
    }

    const json = await fetchJson(`${API_BASE}/standings?league=${leagueId}&season=${season}`, headers);
    if (json?.error) {
      console.error('[api/standings] upstream returned error', { json: sanitize(json) });
      res.setHeader('Content-Type', 'application/json');
      res.status(502).json({ error: 'Upstream football API error', details: sanitize(json) });
      return;
    }
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(json.response || []);
  } catch (err) {
    console.error('[api/standings] unexpected error', err);
    res.setHeader('Content-Type', 'application/json');
    res.status(500).json({ error: 'Internal server error', message: String(err) });
  }
}

function sanitize(obj: any) {
  if (!obj) return null;
  if (typeof obj !== 'object') return obj;
  try {
    return { status: obj.status || null, statusText: obj.statusText || null, hasResponse: !!obj.response };
  } catch (e) {
    return null;
  }
}
