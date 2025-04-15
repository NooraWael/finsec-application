export interface Card {
  id: string;
  cardHolder: string;
  cardNumber: string;
  expiryDate: string;
  cardType: string;
  balance: number;
  bankName: string;
  rewardsPoints: number;
  background: string;
  cardNetwork: 'visa' | 'mastercard' | 'amex';
}

export const cardGradients = {
  visa: ['#2563eb', '#1d4ed8'],
  mastercard: ['#ea580c', '#9a3412'],
  amex: ['#7c3aed', '#5b21b6'],
} as const;

export type CardNetwork = keyof typeof cardGradients;