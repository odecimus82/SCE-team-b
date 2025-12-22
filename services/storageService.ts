
import { Registration, CampusInfoSection } from '../types';
import { CAMPUS_DATA as DEFAULT_CAMPUS_DATA } from '../constants';

const OWN_REG_ID_KEY = 'corsair_own_reg_id';
const CAMPUS_STORAGE_KEY = 'corsair_campus_config_2026';
const SYNC_API = '/api/sync';

export const storageService = {
  // 从服务器拉取最新汇总数据
  fetchRemoteRegistrations: async (): Promise<Registration[]> => {
    try {
      const res = await fetch(SYNC_API);
      if (!res.ok) throw new Error('Fetch failed');
      return await res.json();
    } catch (e) {
      console.error('Remote sync failed, using fallback', e);
      return [];
    }
  },

  // 提交报名到云端
  saveRegistration: async (data: Omit<Registration, 'id' | 'timestamp' | 'hasEdited'>): Promise<Registration> => {
    const id = Math.random().toString(36).substr(2, 9);
    const newReg: Registration = {
      ...data,
      id,
      timestamp: Date.now(),
      hasEdited: false,
    };

    // 1. 保存 ID 到本地，标识“我的报名”
    localStorage.setItem(OWN_REG_ID_KEY, id);

    // 2. 同步到云端
    await fetch(SYNC_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ registration: newReg })
    });

    return newReg;
  },

  // 更新报名信息
  updateRegistration: async (id: string, data: Partial<Registration>): Promise<boolean> => {
    const remoteData = await storageService.fetchRemoteRegistrations();
    const existing = remoteData.find(r => r.id === id);
    
    if (existing) {
      if (existing.hasEdited) return false; // 防止重复修改
      const updated = { ...existing, ...data, hasEdited: true };
      
      await fetch(SYNC_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registration: updated })
      });
      return true;
    }
    return false;
  },

  getOwnRegistration: async (): Promise<Registration | null> => {
    const id = localStorage.getItem(OWN_REG_ID_KEY);
    if (!id) return null;
    const remoteData = await storageService.fetchRemoteRegistrations();
    return remoteData.find(r => r.id === id) || null;
  },

  // 获取总人数（前端实时计算）
  calculateTotalCount: (regs: Registration[]): number => {
    return regs.reduce((sum, reg) => sum + 1 + (reg.adultFamilyCount || 0) + (reg.childFamilyCount || 0), 0);
  },

  // 园区指南配置（仍保持本地或按需同步）
  getCampusData: (): CampusInfoSection[] => {
    const data = localStorage.getItem(CAMPUS_STORAGE_KEY);
    return data ? JSON.parse(data) : DEFAULT_CAMPUS_DATA;
  },

  saveCampusData: (data: CampusInfoSection[]) => {
    localStorage.setItem(CAMPUS_STORAGE_KEY, JSON.stringify(data));
  },

  clearAllRemote: async (password: string) => {
    await fetch(SYNC_API, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    localStorage.removeItem(OWN_REG_ID_KEY);
  }
};
