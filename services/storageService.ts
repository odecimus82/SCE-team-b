
import { Registration } from '../types';

const STORAGE_KEY = 'corsair_registrations_2026';

export const storageService = {
  saveRegistration: (data: Omit<Registration, 'id' | 'timestamp'>): Registration => {
    const registrations = storageService.getRegistrations();
    const newReg: Registration = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
    };
    registrations.push(newReg);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(registrations));
    return newReg;
  },

  getRegistrations: (): Registration[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  getTotalCount: (): number => {
    const regs = storageService.getRegistrations();
    return regs.reduce((sum, reg) => sum + 1 + reg.adultFamilyCount + reg.childFamilyCount, 0);
  },

  clearAll: () => {
    localStorage.removeItem(STORAGE_KEY);
  }
};
