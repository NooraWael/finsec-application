import { Video as LucideIcon } from 'lucide-react-native';

export interface Transaction {
  id: number;
  name: string;
  description: string;
  amount: number;
  date: string;
  icon: LucideIcon;
  color: string;
  type: 'credit' | 'debit';
}