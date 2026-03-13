import type { VercelRequest, VercelResponse } from '@vercel/node';

let lastRequestTime = 0;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { q, type = 'release' } = req.query;
  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: 'Missing query parameter "q"' });
  }

  // Enforce 1 request per second for MusicBrainz API compliance
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < 1000) {
    await new Promise((resolve) => setTimeout(resolve, 1000 - elapsed));
  }
  lastRequestTime = Date.now();

  const searchType = type === 'artist' ? 'artist' : 'release';
  const params = new URLSearchParams({
    query: q,
    fmt: 'json',
    limit: '25',
  });

  try {
    const response = await fetch(
      `https://musicbrainz.org/ws/2/${searchType}?${params}`,
      {
        headers: {
          'User-Agent': 'NetMDStudio/1.0.0 (https://netmd.studio)',
          Accept: 'application/json',
        },
      }
    );

    if (!response.ok) {
      return res.status(response.status).json({ error: 'MusicBrainz API error' });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('MusicBrainz search error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
