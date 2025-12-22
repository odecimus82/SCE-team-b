import { Registration, CampusInfoSection } from '../types';
import { CAMPUS_DATA as DEFAULT_CAMPUS_DATA } from '../constants';

const OWN_REG_ID_KEY = 'corsair_own_reg_id';
const CAMPUS_STORAGE_KEY = 'corsair_campus_config_2026';
const SYNC_API = '/api/sync';

export const storageService = {
  // 从服务器拉取最新汇总数据
  fetchRemoteRegistrations: async (): Promise<Registration[]> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8秒超时

      const res = await fetch(SYNC_API, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.warn('Sync API responded with error:', res.status, errorData);
        return [];
      }
      return await res.json();
    } catch (e: any) {
      if (e.name === 'AbortError') {
        console.error('Sync request timed out');
      } else {
        console.warn('Remote sync unavailable (likely local dev or missing KV):', e.message);
      }
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

    localStorage.setItem(OWN_REG_ID_KEY, id);

    try {
      const res = await fetch(SYNC_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registration: newReg })
      });
      if (!res.ok) throw new Error('Cloud save failed');
    } catch (e) {
      console.error('Failed to sync registration to cloud:', e);
      // 虽然同步失败，但我们已经在本地存了 ID，用户体验上会继续
    }

    return newReg;
  },

  // 更新报名信息
  updateRegistration: async (id: string, data: Partial<Registration>): Promise<boolean> => {
    try {
      const remoteData = await storageService.fetchRemoteRegistrations();
      const existing = remoteData.find(r => r.id === id);
      
      if (existing) {
        if (existing.hasEdited) return false;
        const updated = { ...existing, ...data, hasEdited: true };
        
        const res = await fetch(SYNC_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ registration: updated })
        });
        return res.ok;
      }
    } catch (e) {
      console.error('Update sync failed:', e);
    }
    return false;
  },

  getOwnRegistration: async (): Promise<Registration | null> => {
    const id = localStorage.getItem(OWN_REG_ID_KEY);
    if (!id) return null;
    const remoteData = await storageService.fetchRemoteRegistrations();
    return remoteData.find(r => r.id === id) || null;
  },

  calculateTotalCount: (regs: Registration[]): number => {
    return regs.reduce((sum, reg) => sum + 1 + (reg.adultFamilyCount || 0) + (reg.childFamilyCount || 0), 0);
  },

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