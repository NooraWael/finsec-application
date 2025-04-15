import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Pressable, Platform } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  useSharedValue,
  withTiming,
  Easing
} from 'react-native-reanimated';
import { Card, cardGradients } from '@/types/card';
import { CardHeader } from './CardHeader';
import { CardBalance } from './CardBalance';
import { CardNumber } from './CardNumber';
import { CardFooter } from './CardFooter';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HORIZONTAL_PADDING = 8;
const CARD_WIDTH = Math.min(SCREEN_WIDTH - (HORIZONTAL_PADDING * 2 + 64), 380);
const CARD_HEIGHT = CARD_WIDTH * 0.7;

interface CardCarouselProps {
  cards: Card[];
  currency: string;
  formatCurrency: (amount: number, currency: string) => string;
}

export default function CardCarousel({ cards, currency, formatCurrency }: CardCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);

  const handlePrevious = useCallback(() => {
    if (!cards || cards.length === 0) return;
    
    setActiveIndex((current) => {
      const newIndex = current > 0 ? current - 1 : cards.length - 1;
      animateCardTransition('left');
      return newIndex;
    });
  }, [cards]);

  const handleNext = useCallback(() => {
    if (!cards || cards.length === 0) return;
    
    setActiveIndex((current) => {
      const newIndex = current < cards.length - 1 ? current + 1 : 0;
      animateCardTransition('right');
      return newIndex;
    });
  }, [cards]);

  const animateCardTransition = (direction: 'left' | 'right') => {
    const rotationMultiplier = direction === 'left' ? -1 : 1;
    
    rotation.value = withTiming(5 * rotationMultiplier, {
      duration: 200,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
    
    scale.value = withTiming(0.95, {
      duration: 150,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
    
    translateY.value = withTiming(10, {
      duration: 150,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });

    setTimeout(() => {
      rotation.value = withTiming(0, {
        duration: 200,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
      scale.value = withTiming(1, {
        duration: 150,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
      translateY.value = withTiming(0, {
        duration: 150,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
    }, 200);
  };

  const toggleDetails = useCallback(() => {
    setShowDetails(prev => !prev);
    scale.value = withSpring(0.98, {
      damping: 15,
      stiffness: 150,
    });

    setTimeout(() => {
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 150,
      });
    }, 100);
  }, []);

  if (!cards || cards.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No cards available</Text>
      </View>
    );
  }

  const activeCard = cards[activeIndex];

  if (!activeCard || !activeCard.cardNetwork) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Invalid card data</Text>
      </View>
    );
  }

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotateZ: `${rotation.value}deg` },
      { translateY: translateY.value }
    ]
  }));

  return (
    <View style={styles.container}>
      <View style={styles.cardContainer}>
        <View style={styles.navButtonContainer}>
          <TouchableOpacity 
            style={styles.navButton} 
            onPress={handlePrevious}
            activeOpacity={0.7}
          >
            <ChevronLeft size={20} color="#1A1A1A" />
          </TouchableOpacity>
        </View>

        <Animated.View style={[styles.card, cardAnimatedStyle]}>
          <LinearGradient
            colors={cardGradients[activeCard.cardNetwork]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardContent}
          >
            <Pressable 
              onPress={toggleDetails}
              style={({ pressed }) => [
                styles.cardPressable,
                pressed && styles.cardPressed
              ]}
            >
              <CardHeader
                cardType={activeCard.cardType}
                showDetails={showDetails}
                onToggleDetails={toggleDetails}
              />
              <CardBalance
                balance={activeCard.balance}
                currency={currency}
                showDetails={showDetails}
                formatCurrency={formatCurrency}
              />
              <CardNumber
                cardNumber={activeCard.cardNumber}
                showDetails={showDetails}
              />
              <CardFooter
                cardHolder={activeCard.cardHolder}
                expiryDate={activeCard.expiryDate}
                rewardsPoints={activeCard.rewardsPoints}
              />
            </Pressable>
          </LinearGradient>
        </Animated.View>

        <View style={styles.navButtonContainer}>
          <TouchableOpacity 
            style={styles.navButton} 
            onPress={handleNext}
            activeOpacity={0.7}
          >
            <ChevronRight size={20} color="#1A1A1A" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.pagination}>
        {cards.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              index === activeIndex && styles.paginationDotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  navButtonContainer: {
    width: 32,
    height: CARD_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardContent: {
    flex: 1,
    padding: 12,
  },
  cardPressable: {
    flex: 1,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  cardPressed: {
    opacity: 0.9,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    gap: 4,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0, 122, 255, 0.3)',
  },
  paginationDotActive: {
    backgroundColor: '#007AFF',
    width: 16,
  },
  emptyContainer: {
    height: CARD_HEIGHT,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#8E8E93',
    fontFamily: 'Inter_500Medium',
  },
});