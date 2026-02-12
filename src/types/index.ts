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
  minAmount?: number;
  dailyRate?: number;
  description?: string;
  icon?: any;
  popular?: boolean;
}

export interface Withdrawal {
  id: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed';
  date: string;
  paymentMethod?: 'bank_transfer_rd' | 'crypto_usdt';
  bankName?: string;
  accountNumber?: string;
  cryptoNetwork?: 'trc20' | 'bep20';
  cryptoAddress?: string;
  netAmount?: number;
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

export interface BankAccount {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  accountType: string;
  isActive: boolean;
  isDefault: boolean;
}

export interface CryptoWallets {
  usdt_trc20: string;
  usdt_bep20: string;
  activeNetwork: 'trc20' | 'bep20';
}

export interface WithdrawalSchedule {
  enabledDays: string[];
  startHour: number;
  endHour: number;
}

export interface SystemSettings {
  withdrawalSchedule: WithdrawalSchedule;
  currentWithdrawalStatus: 'enabled' | 'disabled';
  plans: {
    basic: Plan;
    intermediate: Plan;
    premium: Plan;
  };
  cryptoWallets: CryptoWallets;
  bankAccounts: BankAccount[];
  maintenanceMode: boolean;
  lastProfitDistribution: any;
  createdAt: any;
  updatedAt: any;
  chatSettings?: {
    enabled: boolean;
    autoReplyEnabled: boolean;
    adminResponseTime: string;
  };
}

export interface FullUser {
  uid: string;
  email: string;
  username: string;
  displayName?: string;
  photoURL?: string;
  role: 'user' | 'admin';
  hasSelectedPlan: boolean;
  selectedPlanId: string | null;
  balance: {
    total: number;
    available: number;
    invested: number;
    totalProfit: number;
    lastProfitDate: any;
  };
  plan: {
    currentPlanId: string | null;
    investedAmount: number;
    isActive: boolean;
  };
  referralCode: string;
  referredBy: string | null;
  isActive: boolean;
  createdAt: any;
  updatedAt: any;
  notifications?: {
    unreadCount: number;
    lastReadAt: any;
  };
  supportChat?: {
    hasUnreadMessages: boolean;
    lastMessageAt: any;
  };
}

export interface Investment {
  id: string;
  userId: string;
  plan: 'basic' | 'intermediate' | 'premium';
  amount: number;
  dailyRate: number;
  totalProfitGenerated: number;
  startDate: any;
  endDate: any;
  isActive: boolean;
  status: 'pending' | 'confirmed' | 'rejected';
  createdAt: any;
  updatedAt: any;
}

export interface Deposit {
  id: string;
  userId: string;
  amount: number;
  type: 'initial' | 'topup' | 'plan_upgrade';
  paymentMethod: 'bank_transfer_rd' | 'crypto_usdt';
  bankName?: string;
  accountNumber?: string;
  cryptoNetwork?: 'trc20' | 'bep20';
  proofImage: string | null;
  status: 'pending' | 'confirmed' | 'rejected';
  approvedBy?: string;
  approvedAt?: any;
  rejectionReason?: string;
  createdAt: any;
  updatedAt: any;
}

export interface FullWithdrawal {
  id: string;
  userId: string;
  amount: number;
  netAmount?: number;
  paymentMethod: 'bank_transfer_rd' | 'crypto_usdt';
  bankName?: string;
  accountNumber?: string;
  cryptoNetwork?: 'trc20' | 'bep20';
  cryptoAddress?: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  approvedBy?: string;
  approvedAt?: any;
  processedAt?: any;
  rejectionReason?: string;
  createdAt: any;
  updatedAt: any;
}

export interface DailyProfit {
  id: string;
  userId: string;
  investmentId: string;
  date: string;
  amount: number;
  investmentAmount: number;
  dailyRate: number;
  isProcessed: boolean;
  processedAt: any;
  createdAt: any;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  userId: string;
  userName: string;
  userRole: 'user' | 'admin';
  message: string;
  type: 'text' | 'image';
  imageUrl?: string;
  timestamp: any;
  read: boolean;
}

export interface ChatRoom {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  lastMessage: string;
  lastMessageAt: any;
  unreadCount: number;
  status: 'active' | 'closed';
  createdAt: any;
}

export interface AdminNotification {
  id: string;
  type: 'deposit' | 'withdrawal' | 'chat' | 'user' | 'system';
  title: string;
  message: string;
  userId?: string;
  userName?: string;
  amount?: number;
  read: boolean;
  createdAt: any;
  actionRequired?: boolean;
  actionType?: 'approve_deposit' | 'approve_withdrawal' | 'view_chat';
  relatedId?: string;
}

export interface AdminStats {
  totalUsers: number;
  totalInvested: number;
  totalProfitPaid: number;
  pendingDeposits: number;
  pendingWithdrawals: number;
  activeInvestments: number;
  todaysProfit: number;
  unreadMessages: number;
  newUsersToday: number;
}
