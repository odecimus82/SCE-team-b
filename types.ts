
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

export type AppView = 'home' | 'register' | 'info' | 'admin' | 'edit';

export interface CampusInfoSection {
  title: string;
  description: string;
  image: string;
  items: string[];
}
