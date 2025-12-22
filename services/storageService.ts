import { Registration, CampusInfoSection } from '../types';
import { CAMPUS_DATA as DEFAULT_CAMPUS_DATA } from '../constants';

const OWN_REG_ID_KEY = 'corsair_own_reg_id';
const LOCAL_DATA_CACHE = 'corsair_registrations_cache';
const SYNC_API = '/api/sync';

export const storageService = {
  // 获取所有报名数据
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
      console.warn('Fallback to local cache for registrations');
    }
    const cache = localStorage.getItem(LOCAL_DATA_CACHE);
    return cache ? JSON.parse(cache) : [];
  },

  // 获取园区指南数据（云端优先）
  fetchCampusData: async (): Promise<CampusInfoSection[]> => {
    try {
      const res = await fetch(`${SYNC_API}?type=campus&t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data;
        }
      }
    } catch (e) {
      console.error('Failed to fetch campus data from cloud');
    }
    return DEFAULT_CAMPUS_DATA;
  },

  // 保存园区指南到云端
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

  // 保存报名
  saveRegistration: async (data: Omit<Registration, 'id' | 'timestamp' | 'hasEdited'>): Promise<Registration> => {
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
    if (index !== -1 && !remoteData[index].hasEdited) {
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