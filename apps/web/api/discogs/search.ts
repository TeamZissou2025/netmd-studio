import type { VercelRequest, VercelResponse } from '@vercel/node';

let tokenBucket = 60;
let lastRefill = Date.now();

function refillBucket() {
  const now = Date.now();
  const elapsed = (now - lastRefill) / 1000;
  tokenBucket = Math.min(60, tokenBucket + elapsed);
  lastRefill = now;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { q, type = 'release', page = '1' } = req.query;
  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: 'Missing query parameter "q"' });
  }

  refillBucket();
  if (tokenBucket < 1) {
    return res.status(429).json({ error: 'Rate limit exceeded. Try again shortly.' });
  }
  tokenBucket -= 1;

  const consumerKey = process.env.DISCOGS_CONSUMER_KEY;
  const consumerSecret = process.env.DISCOGS_CONSUMER_SECRET;

  if (!consumerKey || !consumerSecret) {
    return res.status(500).json({ error: 'Discogs API not configured' });
  }

  const params = new URLSearchParams({
    q: q,
    type: type === 'artist' ? 'artist' : 'release',
    per_page: '25',
    page: String(page),
    key: consumerKey,
    secret: consumerSecret,
  });

  try {
    const response = await fetch(
      `https://api.discogs.com/database/search?${params}`,
      {
        headers: {
          'User-Agent': 'NetMDStudio/1.0.0 +https://netmd.studio',
          Accept: 'application/json',
        },
      }
    );

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Discogs API error' });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Discogs search error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
