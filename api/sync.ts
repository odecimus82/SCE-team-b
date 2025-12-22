import { kv } from '@vercel/kv';
import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const STORAGE_KEY = 'corsair_2026_registrations';

  // 验证 Upstash/KV 环境变量
  const isKvConfigured = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

  try {
    if (!isKvConfigured) {
      console.warn('Vercel KV (Upstash) is not connected. Ensure you have connected the storage in Vercel project settings.');
      // 如果未配置 KV，暂时返回空数组以防前端崩溃，但在控制台记录警告
      return res.status(200).json([]);
    }

    if (req.method === 'GET') {
      const data = await kv.get(STORAGE_KEY);
      return res.status(200).json(data || []);
    }

    if (req.method === 'POST') {
      const { registration } = req.body;
      if (!registration) return res.status(400).json({ error: 'Missing registration data' });

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
        await kv.del(STORAGE_KEY);
        return res.status(200).json({ success: true });
      }
      return res.status(403).json({ error: 'Forbidden' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('KV Storage Error:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error', 
      details: error.message 
    });
  }
}