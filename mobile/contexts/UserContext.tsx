import React, { createContext, useContext, useState, useEffect } from 'react';
import { router } from 'expo-router';
import { authApi } from '@/services/api';

interface UserContextType {
  user: UserProfile;
  accessToken: string | null;
  updateUser: (user: Partial<UserProfile>) => void;
  setAccessToken: (token: string | null) => void;
  signOut: () => void;
  updateCardBalance: (cardId: string, newBalance: number) => void;
  refreshProfile: () => Promise<void>;
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  address: string | null;
  avatar?: string;
  preferredName?: string;
  memberSince: string;
  status: string;
  lastLogin: Date;
  notificationCount: number;
  preferences: {
    theme: 'light' | 'dark';
    currency: string;
    language: string;
  };
  cards?: {
    id: string;
    balance: number;
  }[];
}

const defaultUser: UserProfile = {
  id: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: null,
  address: null,
  lastLogin: new Date(),
  notificationCount: 0,
  memberSince: new Date().toISOString(),
  status: 'active',
  preferences: {
    theme: 'light',
    currency: 'USD',
    language: 'en',
  },
  cards: [],
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile>(defaultUser);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const updateUser = (newUserData: Partial<UserProfile>) => {
    setUser(currentUser => ({
      ...currentUser,
      ...newUserData,
    }));
  };

  const updateCardBalance = (cardId: string, newBalance: number) => {
    setUser(currentUser => ({
      ...currentUser,
      cards: currentUser.cards?.map(card =>
        card.id === cardId ? { ...card, balance: newBalance } : card
      ) || [],
    }));
  };

  const refreshProfile = async () => {
    if (!accessToken) return;

    try {
      const profile = await authApi.getProfile(accessToken);
      updateUser({
        id: profile.id.toString(),
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phone: profile.phone,
        address: profile.address,
        preferredName: profile.preferredName,
        memberSince: profile.memberSince,
        status: profile.status,
      });
    } catch (error) {
      console.error('Failed to refresh profile:', error);
    }
  };

  useEffect(() => {
    if (accessToken) {
      refreshProfile();
    }
  }, [accessToken]);

  const signOut = () => {
    setUser(defaultUser);
    setAccessToken(null);
    router.replace('/login');
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      accessToken, 
      updateUser, 
      setAccessToken, 
      signOut,
      updateCardBalance,
      refreshProfile
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}