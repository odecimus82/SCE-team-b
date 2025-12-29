
import { Registration, CampusInfoSection, AppConfig, EditLog } from '../types';
import { CAMPUS_DATA as DEFAULT_CAMPUS_DATA, REGISTRATION_DEADLINE as DEFAULT_DEADLINE, MAX_CAPACITY_TARGET as DEFAULT_CAPACITY } from '../constants';

const OWN_REG_ID_KEY = 'corsair_own_reg_id';
const LOCAL_DATA_CACHE = 'corsair_registrations_cache';
const SYNC_API = '/api/sync';

export const storageService = {
  fetchConfig: async (): Promise<AppConfig> => {
    try {
      const res = await fetch(`${SYNC_API}?type=config&t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data.isRegistrationOpen === 'boolean') {
          return {
            ...data,
            maxCapacity: data.maxCapacity || DEFAULT_CAPACITY
          };
        }
      }
    } catch (e) {}
    return { isRegistrationOpen: true, deadline: DEFAULT_DEADLINE, maxCapacity: DEFAULT_CAPACITY };
  },

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

  fetchLogs: async (): Promise<EditLog[]> => {
    try {
      const res = await fetch(`${SYNC_API}?type=logs&t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        return Array.isArray(data) ? data : [];
      }
    } catch (e) {}
    return [];
  },

  addLog: async (userName: string, action: 'create' | 'update', details?: string): Promise<void> => {
    try {
      const log: EditLog = {
        id: Math.random().toString(36).substr(2, 9),
        userName,
        timestamp: Date.now(),
        action,
        details
      };
      await fetch(SYNC_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'logs', log })
      });
    } catch (e) {}
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

  saveRegistration: async (data: Omit<Registration, 'id' | 'timestamp' | 'hasEdited'>): Promise<Registration> => {
    const remoteData = await storageService.fetchRemoteRegistrations();
    const existing = remoteData.find(r => r.name.trim() === data.name.trim());
    
    if (existing) {
      // 计算差异
      const diff: string[] = [];
      if (existing.englishName !== data.englishName) diff.push(`英文名: ${existing.englishName || '-'} -> ${data.englishName || '-'}`);
      if (existing.phone !== data.phone) diff.push(`手机: ${existing.phone} -> ${data.phone}`);
      if (existing.adultFamilyCount !== data.adultFamilyCount) diff.push(`大人: ${existing.adultFamilyCount} -> ${data.adultFamilyCount}`);
      if (existing.childFamilyCount !== data.childFamilyCount) diff.push(`儿童: ${existing.childFamilyCount} -> ${data.childFamilyCount}`);
      
      const details = diff.length > 0 ? diff.join(' | ') : '无关键字段变动';

      const updated = { ...existing, ...data, hasEdited: true, timestamp: Date.now() };
      await fetch(SYNC_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registration: updated })
      });
      await storageService.addLog(data.name, 'update', details);
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
      await storageService.addLog(data.name, 'create', `初始报名: 总人数 ${1 + data.adultFamilyCount + data.childFamilyCount}`);
    } catch (e) {}
    return newReg;
  },

  getOwnRegistration: async (): Promise<Registration | null> => {
    const id = localStorage.getItem(OWN_REG_ID_KEY);
    if (!id) return null;
    const data = await storageService.fetchRemoteRegistrations();
    return data.find(r => r.id === id) || null;
  },

  calculateTotalCount: (regs: Registration[]): number => {
    return regs.reduce((sum, reg) => sum + 1 + (Number(reg.adultFamilyCount) || 0) + (Number(reg.childFamilyCount) || 0), 0);
  }
};
