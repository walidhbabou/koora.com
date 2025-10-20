import type { VercelRequest, VercelResponse } from '@vercel/node';

// Simple serverless proxy for API-Football to avoid CORS in the browser.
// Usage: /api/football?endpoint=/standings&league=135&season=2025
export default async function handler(req: any, res: any) {
  try {
    const query = { ...(req.query || {}) };
    const endpoint = String(query.endpoint || query.path || '');
    if (!endpoint) {
      return res.status(400).json({ error: 'Missing endpoint query parameter' });
    }

    // Remove endpoint from params
    delete query.endpoint;
    delete query.path;

    const searchParams = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v != null) searchParams.append(k, String(v));
    });

    const base = 'https://v3.football.api-sports.io';
    const url = `${base}${endpoint}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

    const apiKey = process.env.VITE_FOOTBALL_API_KEY || process.env.FOOTBALL_API_KEY || process.env.API_FOOTBALL_KEY;
    if (!apiKey) {
      console.warn('API Football key is missing in server environment. Check Vercel env vars.');
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.status(403).json({ error: 'Missing API key on server. Set VITE_FOOTBALL_API_KEY or FOOTBALL_API_KEY.' });
    }

    // Masked logging to assist debugging without leaking the key
    const masked = apiKey.length > 6 ? `${apiKey.slice(0, 3)}...${apiKey.slice(-3)}` : '***';
    console.log(`Proxy using API key: ${masked}`);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-apisports-key': apiKey,
      'X-RapidAPI-Key': apiKey,
      'X-RapidAPI-Host': 'v3.football.api-sports.io'
    };

    const r = await fetch(url, { headers });
    const data = await r.json().catch(() => null);

    // Ensure same-origin for client and avoid CORS issues
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    return res.status(r.status || 200).json(data);
  } catch (err: any) {
    console.error('Proxy error:', err);
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(500).json({ error: 'Proxy error', details: String(err) });
  }
}
