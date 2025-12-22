
export interface Registration {
  id: string;
  name: string;
  employeeId: string;
  department: string;
  adultFamilyCount: number;
  childFamilyCount: number;
  dietaryNotes: string;
  timestamp: number;
}

export type AppView = 'home' | 'register' | 'info' | 'admin';

export interface CampusInfoSection {
  title: string;
  description: string;
  image: string;
  items: string[];
}
