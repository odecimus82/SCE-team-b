import { Registration, CampusInfoSection } from '../types';
import { CAMPUS_DATA as DEFAULT_CAMPUS_DATA } from '../constants';

const OWN_REG_ID_KEY = 'corsair_own_reg_id';
const LOCAL_DATA_CACHE = 'corsair_registrations_cache';
const CAMPUS_STORAGE_KEY = 'corsair_campus_config_2026';
const SYNC_API = '/api/sync';

export const storageService = {
  // 获取所有报名数据（优先云端，失败则用本地缓存）
  fetchRemoteRegistrations: async (): Promise<Registration[]> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒超时

      const res = await fetch(SYNC_API, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          localStorage.setItem(LOCAL_DATA_CACHE, JSON.stringify(data));
          return data;
        }
      }
    } catch (e) {
      console.warn('Cloud sync unavailable, falling back to local cache.');
    }
    const cache = localStorage.getItem(LOCAL_DATA_CACHE);
    return cache ? JSON.parse(cache) : [];
  },

  // 保存报名
  saveRegistration: async (data: Omit<Registration, 'id' | 'timestamp' | 'hasEdited'>): Promise<Registration> => {
    const id = Math.random().toString(36).substr(2, 9);
    const newReg: Registration = {
      ...data,
      id,
      timestamp: Date.now(),
      hasEdited: false,
    };

    // 1. 先存本地标识
    localStorage.setItem(OWN_REG_ID_KEY, id);
    
    // 2. 尝试同步到云端
    try {
      const res = await fetch(SYNC_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registration: newReg })
      });
      
      if (res.ok) {
        // 同步成功后刷新本地全量缓存
        await storageService.fetchRemoteRegistrations();
      }
    } catch (e) {
      console.error('Failed to sync to cloud, data remains local-only for now.');
      // 如果云端失败，手动把这个条目加进本地缓存
      const cache = JSON.parse(localStorage.getItem(LOCAL_DATA_CACHE) || '[]');
      cache.push(newReg);
      localStorage.setItem(LOCAL_DATA_CACHE, JSON.stringify(cache));
    }

    return newReg;
  },

  // 获取自己的报名信息
  getOwnRegistration: async (): Promise<Registration | null> => {
    const id = localStorage.getItem(OWN_REG_ID_KEY);
    if (!id) return null;
    const data = await storageService.fetchRemoteRegistrations();
    return data.find(r => r.id === id) || null;
  },

  // 更新报名（仅限一次修改）
  updateRegistration: async (id: string, data: Partial<Registration>): Promise<boolean> => {
    const remoteData = await storageService.fetchRemoteRegistrations();
    const index = remoteData.findIndex(r => r.id === id);
    
    if (index !== -1 && !remoteData[index].hasEdited) {
      const updated = { ...remoteData[index], ...data, hasEdited: true };
      
      try {
        const res = await fetch(SYNC_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ registration: updated })
        });
        
        if (res.ok) {
          await storageService.fetchRemoteRegistrations();
          return true;
        }
      } catch (e) {
        console.error('Update failed');
      }
    }
    return false;
  },

  calculateTotalCount: (regs: Registration[]): number => {
    return regs.reduce((sum, reg) => sum + 1 + (Number(reg.adultFamilyCount) || 0) + (Number(reg.childFamilyCount) || 0), 0);
  },

  getCampusData: (): CampusInfoSection[] => {
    const data = localStorage.getItem(CAMPUS_STORAGE_KEY);
    return data ? JSON.parse(data) : DEFAULT_CAMPUS_DATA;
  },

  saveCampusData: (data: CampusInfoSection[]) => {
    localStorage.setItem(CAMPUS_STORAGE_KEY, JSON.stringify(data));
  },

  clearAllRemote: async (password: string) => {
    if (password === 'sce2026') {
      try {
        await fetch(SYNC_API, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password })
        });
      } catch (e) {}
      localStorage.removeItem(LOCAL_DATA_CACHE);
      localStorage.removeItem(OWN_REG_ID_KEY);
    }
  }
};