import type { IconName } from '../components/icons';

export interface MockExpense {
  id: string;
  note: string;
  time: string;
  dateGroup: string;
  date: string; // ISO yyyy-mm-dd
  amount: number;
  color: string;
  icon: IconName;
  category: string;
  source?: 'manual' | 'ocr';
  receiptImage?: string;
  deletedAt?: number;
}

export const MOCK_EXPENSES: MockExpense[] = [
  { id: '1', note: 'Lunch with Ali', time: '1:20 PM', dateGroup: 'Today', date: '2026-07-08', amount: -85000, color: '#8B5CF6', icon: 'coffee', category: 'Food' },
  { id: '2', note: 'Careem ride', time: '11:05 AM', dateGroup: 'Today', date: '2026-07-08', amount: -42000, color: '#F97316', icon: 'truck', category: 'Transport' },
  { id: '3', note: 'Electricity bill', time: '4:40 PM', dateGroup: 'Yesterday', date: '2026-07-07', amount: -680000, color: '#14B8A6', icon: 'zap', category: 'Bills' },
  { id: '4', note: 'Grocery run', time: '10:15 AM', dateGroup: 'Yesterday', date: '2026-07-07', amount: -320000, color: '#8B5CF6', icon: 'coffee', category: 'Food' },
  { id: '5', note: 'July rent', time: '9:00 AM', dateGroup: '2 Jul', date: '2026-07-02', amount: -3500000, color: '#EC4899', icon: 'building', category: 'Rent' },
  { id: '6', note: 'Petrol', time: '6:30 PM', dateGroup: '1 Jul', date: '2026-07-01', amount: -150000, color: '#F97316', icon: 'truck', category: 'Transport' },
  { id: '7', note: 'Coffee with Sarah', time: '3:10 PM', dateGroup: '1 Jul', date: '2026-07-01', amount: -60000, color: '#8B5CF6', icon: 'coffee', category: 'Food' },
  { id: '8', note: 'Internet bill', time: '11:00 AM', dateGroup: '30 Jun', date: '2026-06-30', amount: -450000, color: '#14B8A6', icon: 'zap', category: 'Bills' },
  { id: '9', note: 'June rent', time: '9:00 AM', dateGroup: '28 Jun', date: '2026-06-28', amount: -3500000, color: '#EC4899', icon: 'building', category: 'Rent' },
  { id: '10', note: 'Grocery run', time: '5:45 PM', dateGroup: '20 Jun', date: '2026-06-20', amount: -280000, color: '#8B5CF6', icon: 'coffee', category: 'Food' },
  { id: '11', note: 'Petrol', time: '6:10 PM', dateGroup: '15 Jun', date: '2026-06-15', amount: -140000, color: '#F97316', icon: 'truck', category: 'Transport' },
  { id: '12', note: 'Coffee with Ali', time: '2:30 PM', dateGroup: '10 Jun', date: '2026-06-10', amount: -55000, color: '#8B5CF6', icon: 'coffee', category: 'Food' },
];

export const CATEGORY_NAMES = ['All', 'Food', 'Rent', 'Bills', 'Transport'];
