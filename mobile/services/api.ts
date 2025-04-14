import { API_CONFIG } from '@/config/api';

interface LoginRequest {
  email: string;
  password: string;
}

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
  is_active: boolean;
  mfa_enabled: boolean;
  phone_number: string | null;
}

interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  address: string | null;
  preferredName: string | null;
  memberSince: string;
  status: string;
}

interface LoginResponse {
  access_token: string;
  message: string;
  session_id: string;
  user: User;
}

interface MfaRequiredResponse {
  message: string;
  requireMfa: boolean;
  userId: number;
}

interface VerifyMfaRequest {
  userId: string;
  otpCode: string;
  email: string;
  password: string;
}

interface Card {
  id: string;
  balance: number;
  bankName: string;
  cardHolder: string;
  cardNetwork: 'visa' | 'mastercard' | 'amex';
  cardNumber: string;
  cardType: string;
  expiryDate: string;
  rewardsPoints: number;
}

interface CardsResponse {
  cards: Card[];
}

interface Transaction {
  id: string;
  amount: number;
  category: string;
  date: string;
  merchant: string;
  paymentMethod: string;
  status: string;
  type: 'credit' | 'debit';
}

interface TransactionsResponse {
  pagination: {
    limit: number;
    page: number;
    pages: number;
    total: number;
  };
  transactions: Transaction[];
}

interface Bill {
  id: string;
  name: string;
  amount: number;
  category: string;
  due_date: string;
  status: string;
  autopay: boolean;
}

interface BillsResponse {
  bills: Bill[];
}

interface PayBillRequest {
  billId: string;
  amount: number;
  paymentMethodId: string;
}

interface PayBillResponse {
  billId: string;
  card_balance: number;
  message: string;
  status: string;
  transaction_id: string;
}

interface SpendingCategory {
  name: string;
  amount: number;
  percentage: number;
  monthlyChange: number;
  transactions: number;
}

interface AnalyticsResponse {
  categories: SpendingCategory[];
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

const createAuthHeaders = (accessToken?: string) => {
  const headers = { ...API_CONFIG.HEADERS };
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  return headers;
};

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse | MfaRequiredResponse> => {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`, {
      method: 'POST',
      headers: API_CONFIG.HEADERS,
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(response.status, error.message || 'Login failed');
    }

    return response.json();
  },

  verifyMfa: async (verificationData: VerifyMfaRequest): Promise<LoginResponse> => {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.VERIFY_MFA}`, {
      method: 'POST',
      headers: API_CONFIG.HEADERS,
      body: JSON.stringify(verificationData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(response.status, error.message || 'MFA verification failed');
    }

    return response.json();
  },

  getProfile: async (accessToken: string): Promise<UserProfile> => {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROFILE}`, {
      method: 'GET',
      headers: createAuthHeaders(accessToken),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(response.status, error.message || 'Failed to fetch user profile');
    }

    return response.json();
  },

  updateProfile: async (accessToken: string, profileData: Partial<UserProfile>): Promise<UserProfile> => {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROFILE}`, {
      method: 'PUT',
      headers: createAuthHeaders(accessToken),
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(response.status, error.message || 'Failed to update user profile');
    }

    return response.json();
  },

  getCards: async (accessToken: string): Promise<CardsResponse> => {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CARDS}`, {
      method: 'GET',
      headers: createAuthHeaders(accessToken),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(response.status, error.message || 'Failed to fetch cards');
    }

    return response.json();
  },

  getTransactions: async (accessToken: string, page: number = 1, limit: number = 10): Promise<TransactionsResponse> => {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TRANSACTIONS}?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: createAuthHeaders(accessToken),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(response.status, error.message || 'Failed to fetch transactions');
    }

    return response.json();
  },

  getBills: async (accessToken: string): Promise<BillsResponse> => {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.BILLS}`, {
      method: 'GET',
      headers: createAuthHeaders(accessToken),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(response.status, error.message || 'Failed to fetch bills');
    }

    return response.json();
  },

  payBill: async (accessToken: string, paymentData: PayBillRequest): Promise<PayBillResponse> => {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PAY_BILL}`, {
      method: 'POST',
      headers: createAuthHeaders(accessToken),
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(response.status, error.message || 'Failed to process bill payment');
    }

    return response.json();
  },

  getAnalytics: async (accessToken: string, period: string = 'month'): Promise<AnalyticsResponse> => {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ANALYTICS}?period=${period}`, {
      method: 'GET',
      headers: createAuthHeaders(accessToken),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(response.status, error.message || 'Failed to fetch analytics data');
    }

    return response.json();
  },
};