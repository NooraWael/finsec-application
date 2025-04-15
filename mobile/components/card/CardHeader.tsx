import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  Easing
} from 'react-native-reanimated';

interface CardHeaderProps {
  cardType: string;
  showDetails: boolean;
  onToggleDetails: () => void;
}

export function CardHeader({ cardType, showDetails, onToggleDetails }: CardHeaderProps) {
  const iconRotation = useAnimatedStyle(() => ({
    transform: [
      { 
        rotateY: withTiming(showDetails ? '180deg' : '0deg', {
          duration: 300,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        })
      }
    ],
  }));

  const scaleAnimation = useAnimatedStyle(() => ({
    transform: [
      { 
        scale: withSpring(1, {
          damping: 15,
          stiffness: 150,
        })
      }
    ],
  }));

  return (
    <View style={styles.header}>
      <Animated.Text style={[styles.cardType, scaleAnimation]}>
        {cardType}
      </Animated.Text>
      <TouchableOpacity 
        onPress={onToggleDetails} 
        style={styles.eyeButton}
        activeOpacity={0.7}
      >
        <Animated.View style={iconRotation}>
          {showDetails ? (
            <Eye size={20} color="#FFFFFF" />
          ) : (
            <EyeOff size={20} color="#FFFFFF" />
          )}
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16, // Reduced from 24
  },
  cardType: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    textShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  },
  eyeButton: {
    padding: 8,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
});