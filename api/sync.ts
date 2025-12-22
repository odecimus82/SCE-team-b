import { kv } from '@vercel/kv';
import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const REG_KEY = 'corsair_2026_registrations';
  const CAMPUS_KEY = 'corsair_2026_campus_info';

  const isKvConfigured = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

  try {
    if (!isKvConfigured) {
      return res.status(200).json({ error: 'KV not configured', registrations: [], campus: [] });
    }

    // 处理 GET 请求：获取数据
    if (req.method === 'GET') {
      const { type } = req.query;
      if (type === 'campus') {
        const data = await kv.get(CAMPUS_KEY);
        return res.status(200).json(data || []);
      }
      const data = await kv.get(REG_KEY);
      return res.status(200).json(data || []);
    }

    // 处理 POST 请求：更新数据
    if (req.method === 'POST') {
      const { type, registration, campusData } = req.body;

      if (type === 'campus' && campusData) {
        await kv.set(CAMPUS_KEY, campusData);
        return res.status(200).json({ success: true });
      }

      if (registration) {
        const currentData: any[] = (await kv.get(REG_KEY)) || [];
        const index = currentData.findIndex(r => r.id === registration.id);
        if (index !== -1) {
          currentData[index] = registration;
        } else {
          currentData.push(registration);
        }
        await kv.set(REG_KEY, currentData);
        return res.status(200).json({ success: true });
      }
      
      return res.status(400).json({ error: 'Invalid payload' });
    }

    if (req.method === 'DELETE') {
      const { password } = req.body;
      if (password === 'sce2026') {
        await kv.del(REG_KEY);
        // 不删除指南数据，防止误删配置
        return res.status(200).json({ success: true });
      }
      return res.status(403).json({ error: 'Forbidden' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('KV Storage Error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}