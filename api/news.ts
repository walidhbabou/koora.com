
import type { VercelRequest, VercelResponse } from '@vercel/node';
import mysql from 'mysql2/promise';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const connection = await mysql.createConnection({
      host: 'auth-db1540.hstgr.io',
      user: 'u772497629_eZrQF',
      password: '8SsJwwgSkH',
      database: 'u772497629_CwWyn'
    });
    // On récupère les 20 derniers articles publiés
    const [rows] = await connection.execute(`
      SELECT ID, post_date, post_title, post_excerpt, post_content, post_status, post_type
      FROM wp_posts
      WHERE post_status = 'publish' AND post_type = 'post'
      ORDER BY post_date DESC
      LIMIT 20
    `);
    await connection.end();
    res.status(200).json(rows);
  } catch (error) {
    console.error('MySQL connection/query error:', error);
    res.status(500).json({ error: 'MySQL connection/query error', details: error instanceof Error ? error.message : error });
  }
}