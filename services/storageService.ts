
import { Registration, CampusInfoSection, AppConfig } from '../types';
import { CAMPUS_DATA as DEFAULT_CAMPUS_DATA, REGISTRATION_DEADLINE as DEFAULT_DEADLINE } from '../constants';

const OWN_REG_ID_KEY = 'corsair_own_reg_id';
const LOCAL_DATA_CACHE = 'corsair_registrations_cache';
const SYNC_API = '/api/sync';

export const storageService = {
  // 获取全局配置
  fetchConfig: async (): Promise<AppConfig> => {
    try {
      const res = await fetch(`${SYNC_API}?type=config&t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data.isRegistrationOpen === 'boolean') {
          return data;
        }
      }
    } catch (e) {}
    return { isRegistrationOpen: true, deadline: DEFAULT_DEADLINE };
  },

  // 保存全局配置
  saveConfig: async (config: AppConfig): Promise<boolean> => {
    try {
      const res = await fetch(SYNC_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'config', config })
      });
      return res.ok;
    } catch (e) {
      return false;
    }
  },

  fetchRemoteRegistrations: async (): Promise<Registration[]> => {
    try {
      const res = await fetch(`${SYNC_API}?t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          localStorage.setItem(LOCAL_DATA_CACHE, JSON.stringify(data));
          return data;
        }
      }
    } catch (e) {
      console.warn('Fallback to local cache');
    }
    const cache = localStorage.getItem(LOCAL_DATA_CACHE);
    return cache ? JSON.parse(cache) : [];
  },

  fetchCampusData: async (): Promise<CampusInfoSection[]> => {
    try {
      const res = await fetch(`${SYNC_API}?type=campus&t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch (e) {}
    return DEFAULT_CAMPUS_DATA;
  },

  saveCampusDataToCloud: async (data: CampusInfoSection[]): Promise<boolean> => {
    try {
      const res = await fetch(SYNC_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'campus', campusData: data })
      });
      return res.ok;
    } catch (e) {
      return false;
    }
  },

  saveRegistration: async (data: Omit<Registration, 'id' | 'timestamp' | 'hasEdited'>): Promise<Registration> => {
    // 智能匹配逻辑：如果在提交时发现姓名相同的记录，则转为更新
    const remoteData = await storageService.fetchRemoteRegistrations();
    const existing = remoteData.find(r => r.name.trim() === data.name.trim());
    
    if (existing) {
      const updated = { ...existing, ...data, hasEdited: true, timestamp: Date.now() };
      await fetch(SYNC_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registration: updated })
      });
      localStorage.setItem(OWN_REG_ID_KEY, existing.id);
      return updated;
    }

    const id = Math.random().toString(36).substr(2, 9);
    const newReg: Registration = { ...data, id, timestamp: Date.now(), hasEdited: false };
    localStorage.setItem(OWN_REG_ID_KEY, id);
    try {
      await fetch(SYNC_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registration: newReg })
      });
    } catch (e) {}
    return newReg;
  },

  getOwnRegistration: async (): Promise<Registration | null> => {
    const id = localStorage.getItem(OWN_REG_ID_KEY);
    if (!id) return null;
    const data = await storageService.fetchRemoteRegistrations();
    return data.find(r => r.id === id) || null;
  },

  updateRegistration: async (id: string, data: Partial<Registration>): Promise<boolean> => {
    const remoteData = await storageService.fetchRemoteRegistrations();
    const index = remoteData.findIndex(r => r.id === id);
    if (index !== -1) {
      const updated = { ...remoteData[index], ...data, hasEdited: true };
      try {
        const res = await fetch(SYNC_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ registration: updated })
        });
        return res.ok;
      } catch (e) {}
    }
    return false;
  },

  calculateTotalCount: (regs: Registration[]): number => {
    return regs.reduce((sum, reg) => sum + 1 + (Number(reg.adultFamilyCount) || 0) + (Number(reg.childFamilyCount) || 0), 0);
  }
};
