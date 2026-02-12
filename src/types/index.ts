export interface User {
  id: string;
  username: string;
  firstName: string;
  lastName?: string;
  photoUrl?: string;
  isPremium?: boolean;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  dailyPercentage: number;
  features: string[];
  color: string;
}

export interface Withdrawal {
  id: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
}

export interface Referral {
  id: string;
  username: string;
  earnings: number;
  date: string;
}

export interface DailyUpdate {
  date: string;
  percentage: number;
  amount: number;
}
