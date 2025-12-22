
import { kv } from '@vercel/kv';
import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const STORAGE_KEY = 'corsair_2026_registrations';

  if (req.method === 'GET') {
    // 获取所有报名信息
    const data = await kv.get(STORAGE_KEY);
    return res.status(200).json(data || []);
  }

  if (req.method === 'POST') {
    // 保存或更新报名信息
    const { registration } = req.body;
    if (!registration) return res.status(400).json({ error: 'Missing data' });

    const currentData: any[] = (await kv.get(STORAGE_KEY)) || [];
    
    // 检查是否是更新
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
    // 管理员清空数据
    const { password } = req.body;
    if (password === 'sce2026') {
      await kv.set(STORAGE_KEY, []);
      return res.status(200).json({ success: true });
    }
    return res.status(403).json({ error: 'Forbidden' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
