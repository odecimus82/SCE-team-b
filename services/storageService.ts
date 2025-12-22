
import { Registration, CampusInfoSection } from '../types';
import { CAMPUS_DATA as DEFAULT_CAMPUS_DATA } from '../constants';

const STORAGE_KEY = 'corsair_registrations_2026';
const OWN_REG_ID_KEY = 'corsair_own_reg_id';
const CAMPUS_STORAGE_KEY = 'corsair_campus_config_2026';

export const storageService = {
  // 报名相关
  saveRegistration: (data: Omit<Registration, 'id' | 'timestamp' | 'hasEdited'>): Registration => {
    const registrations = storageService.getRegistrations();
    const id = Math.random().toString(36).substr(2, 9);
    const newReg: Registration = {
      ...data,
      id,
      timestamp: Date.now(),
      hasEdited: false,
    };
    registrations.push(newReg);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(registrations));
    localStorage.setItem(OWN_REG_ID_KEY, id);
    return newReg;
  },

  updateRegistration: (id: string, data: Partial<Omit<Registration, 'id' | 'timestamp'>>): boolean => {
    const registrations = storageService.getRegistrations();
    const index = registrations.findIndex(r => r.id === id);
    if (index !== -1) {
      if (registrations[index].hasEdited) return false;
      registrations[index] = {
        ...registrations[index],
        ...data,
        hasEdited: true 
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(registrations));
      return true;
    }
    return false;
  },

  getOwnRegistration: (): Registration | null => {
    const id = localStorage.getItem(OWN_REG_ID_KEY);
    if (!id) return null;
    return storageService.getRegistrations().find(r => r.id === id) || null;
  },

  getRegistrations: (): Registration[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  getTotalCount: (): number => {
    const regs = storageService.getRegistrations();
    return regs.reduce((sum, reg) => sum + 1 + reg.adultFamilyCount + reg.childFamilyCount, 0);
  },

  // 园区指南配置相关
  getCampusData: (): CampusInfoSection[] => {
    const data = localStorage.getItem(CAMPUS_STORAGE_KEY);
    return data ? JSON.parse(data) : DEFAULT_CAMPUS_DATA;
  },

  saveCampusData: (data: CampusInfoSection[]) => {
    localStorage.setItem(CAMPUS_STORAGE_KEY, JSON.stringify(data));
  },

  clearAll: () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(OWN_REG_ID_KEY);
    localStorage.removeItem(CAMPUS_STORAGE_KEY);
  }
};
