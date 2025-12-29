
export interface Registration {
  id: string;
  name: string;
  englishName: string;
  phone: string;
  adultFamilyCount: number;
  childFamilyCount: number;
  timestamp: number;
  hasEdited?: boolean;
}

export interface EditLog {
  id: string;
  userName: string;
  timestamp: number;
  action: 'create' | 'update';
}

export interface AppConfig {
  isRegistrationOpen: boolean;
  deadline: number;
  maxCapacity: number;
}

export type AppView = 'home' | 'register' | 'info' | 'admin' | 'edit';

export interface CampusInfoSection {
  title: string;
  description: string;
  image: string;
  items: string[];
}
