import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CreditCard as CardIcon } from 'lucide-react-native';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  withSequence,
  withTiming 
} from 'react-native-reanimated';

interface CardNumberProps {
  cardNumber: string;
  showDetails: boolean;
}

export function CardNumber({ cardNumber, showDetails }: CardNumberProps) {
  const formatCardNumber = (number: string) => {
    // Split the card number into groups of 4
    const groups = number.match(/.{1,4}/g) || [];
    return groups.join(' ');
  };

  const maskCardNumber = (number: string) => {
    if (showDetails) {
      return formatCardNumber(number);
    }
    // Keep the last 4 digits visible, mask the rest
    const lastFour = number.slice(-4);
    const maskedPart = '•••• •••• ••••';
    return `${maskedPart} ${lastFour}`;
  };

  const numberAnimation = useAnimatedStyle(() => ({
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
      <CardIcon size={20} color="#FFFFFF" style={styles.icon} />
      <Animated.Text style={[styles.number, numberAnimation]}>
        {maskCardNumber(cardNumber)}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  icon: {
    opacity: 0.9,
  },
  number: {
    fontSize: 16,
    color: '#FFFFFF',
    letterSpacing: 1.5,
    fontFamily: 'Inter_500Medium',
    textShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)',
  },
});