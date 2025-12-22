import { kv } from '@vercel/kv';
import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const STORAGE_KEY = 'corsair_2026_registrations';

  try {
    if (req.method === 'GET') {
      const data = await kv.get(STORAGE_KEY);
      return res.status(200).json(data || []);
    }

    if (req.method === 'POST') {
      const { registration } = req.body;
      if (!registration) return res.status(400).json({ error: 'Missing data' });

      const currentData: any[] = (await kv.get(STORAGE_KEY)) || [];
      const index = currentData.findIndex(r => r.id === registration.id);
      
      if (index !== -1) {
        currentData[index] = registration;
      } else {
        currentData.push(registration);
      }

      await kv.set(STORAGE_KEY, currentData);
      return res.status(200).json({ success: true });
    }

    if (req.method === 'DELETE') {
      const { password } = req.body;
      if (password === 'sce2026') {
        await kv.set(STORAGE_KEY, []);
        return res.status(200).json({ success: true });
      }
      return res.status(403).json({ error: 'Forbidden' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('API Error:', error);
    // 如果 KV 未配置，Vercel 会抛出错误，这里返回 500 并附带提示
    return res.status(500).json({ 
      error: 'Database error', 
      message: '请确保在 Vercel 后台已连接 KV 数据库。',
      details: error.message 
    });
  }
}