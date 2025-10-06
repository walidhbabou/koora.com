import type { VercelRequest, VercelResponse } from '@vercel/node';
import mysql from 'mysql2/promise';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS for local dev and Vercel
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  let connection;
  const dbConfig = {
    host: 'srv1540.hstgr.io',
    user: 'u772497629_eZrQf',
    password: '8SsJwwgSkH', 
    database: 'u772497629_CwWyn'
  };
  console.log('Attempting MySQL connection with config:', dbConfig);
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('MySQL connection established successfully');
  } catch (connErr) {
    console.error('MySQL connection error:', connErr);
    res.status(500).json({ error: 'MySQL connection error', details: connErr instanceof Error ? connErr.message : connErr, config: dbConfig });
    return;
  }
  try {
    // On récupère les 20 derniers articles publiés
    const [rows] = await connection.execute(`
      SELECT ID, post_date, post_title, post_excerpt, post_content, post_status, post_type
      FROM wp_posts
      WHERE post_status = 'publish' AND post_type = 'post'
      ORDER BY post_date DESC
      LIMIT 20
    `);
    await connection.end();
    // Always return valid JSON array
    res.status(200).json(Array.isArray(rows) ? rows : []);
  } catch (error) {
    console.error('MySQL query error:', error);
    res.status(500).json({ error: 'MySQL query error', details: error instanceof Error ? error.message : error });
    if (connection) await connection.end();
  }
}
