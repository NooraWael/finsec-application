import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  withSequence,
  withTiming 
} from 'react-native-reanimated';

interface CardBalanceProps {
  balance: number;
  currency: string;
  showDetails: boolean;
  formatCurrency: (amount: number, currency: string) => string;
}

export function CardBalance({ balance, currency, showDetails, formatCurrency }: CardBalanceProps) {
  const maskBalance = (amount: number) => {
    return showDetails ? formatCurrency(amount, currency) : "••••••";
  };

  const balanceAnimation = useAnimatedStyle(() => ({
    transform: [
      { 
        scale: withSequence(
          withTiming(0.95, { duration: 100 }),
          withSpring(1)
        )
      }
    ],
    opacity: withTiming(1, { duration: 300 }),
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Available Balance</Text>
      <View style={styles.row}>
        <Animated.Text style={[styles.amount, balanceAnimation]}>
          {maskBalance(balance)}
        </Animated.Text>
        <ChevronDown size={16} color="#FFFFFF" style={styles.icon} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16, // Reduced from 24
  },
  label: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
    fontFamily: 'Inter_400Regular',
    marginBottom: 2, // Reduced from 4
    textShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  amount: {
    fontSize: 20,
    color: '#FFFFFF',
    fontFamily: 'Inter_700Bold',
    textShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  },
  icon: {
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
});