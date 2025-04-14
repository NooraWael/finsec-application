import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Pressable } from 'react-native';
import { ChevronDown, CreditCard as CardIcon, ChevronLeft, ChevronRight, Eye, EyeOff } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 80;

interface Card {
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

interface CardCarouselProps {
  cards: Card[];
  currency: string;
  formatCurrency: (amount: number, currency: string) => string;
}

export default function CardCarousel({ cards, currency, formatCurrency }: CardCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  const handlePrevious = () => {
    setActiveIndex((current) => (current > 0 ? current - 1 : cards.length - 1));
  };

  const handleNext = () => {
    setActiveIndex((current) => (current < cards.length - 1 ? current + 1 : 0));
  };

  const toggleDetails = () => {
    setShowDetails(prev => !prev);
  };

  const activeCard = cards[activeIndex];

  const getGradientColors = (network: 'visa' | 'mastercard' | 'amex') => {
    switch (network) {
      case 'visa':
        return ['#2563eb', '#1d4ed8'];
      case 'mastercard':
        return ['#ea580c', '#9a3412'];
      case 'amex':
        return ['#7c3aed', '#5b21b6'];
      default:
        return ['#007AFF', '#0055FF'];
    }
  };

  const maskCardNumber = (number: string) => {
    return showDetails ? number : number.replace(/\d(?=\d{4})/g, "•");
  };

  const maskBalance = (balance: number) => {
    return showDetails ? formatCurrency(balance, currency) : "••••••";
  };

  return (
    <View style={styles.container}>
      <View style={styles.cardContainer}>
        <TouchableOpacity style={styles.navButton} onPress={handlePrevious}>
          <ChevronLeft size={24} color="#1A1A1A" />
        </TouchableOpacity>

        <View style={styles.card}>
          <LinearGradient
            colors={getGradientColors(activeCard.cardNetwork)}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardContent}
          >
            <Pressable onPress={toggleDetails} style={styles.cardPressable}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardType}>{activeCard.cardType}</Text>
                <TouchableOpacity 
                  onPress={toggleDetails}
                  style={styles.eyeButton}
                >
                  {showDetails ? (
                    <Eye size={24} color="#FFFFFF" />
                  ) : (
                    <EyeOff size={24} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.balanceSection}>
                <Text style={styles.balanceLabel}>Available Balance</Text>
                <View style={styles.balanceRow}>
                  <Text style={styles.balanceAmount}>
                    {maskBalance(activeCard.balance)}
                  </Text>
                  <ChevronDown size={20} color="#FFFFFF" />
                </View>
              </View>

              <View style={styles.cardNumberSection}>
                <CardIcon size={24} color="#FFFFFF" style={styles.cardIcon} />
                <Text style={styles.cardNumber}>
                  {maskCardNumber(activeCard.cardNumber)}
                </Text>
              </View>

              <View style={styles.cardFooter}>
                <View style={styles.cardHolderSection}>
                  <Text style={styles.cardLabel}>CARD HOLDER</Text>
                  <Text style={styles.cardHolderName}>{activeCard.cardHolder}</Text>
                </View>
                <View style={styles.expirySection}>
                  <Text style={styles.cardLabel}>EXPIRES</Text>
                  <Text style={styles.expiryDate}>{activeCard.expiryDate}</Text>
                </View>
              </View>
            </Pressable>
          </LinearGradient>
        </View>

        <TouchableOpacity style={styles.navButton} onPress={handleNext}>
          <ChevronRight size={24} color="#1A1A1A" />
        </TouchableOpacity>
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
    marginVertical: 20,
  },
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 12,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  card: {
    width: CARD_WIDTH,
    aspectRatio: 1.586,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardPressable: {
    flex: 1,
  },
  cardContent: {
    flex: 1,
    padding: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  eyeButton: {
    padding: 8,
  },
  cardType: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
  },
  balanceSection: {
    marginBottom: 32,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    fontFamily: 'Inter_400Regular',
    marginBottom: 8,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  balanceAmount: {
    fontSize: 28,
    color: '#FFFFFF',
    fontFamily: 'Inter_700Bold',
  },
  cardNumberSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    gap: 12,
  },
  cardIcon: {
    opacity: 0.9,
  },
  cardNumber: {
    fontSize: 18,
    color: '#FFFFFF',
    letterSpacing: 2,
    fontFamily: 'Inter_500Medium',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  cardHolderSection: {
    flex: 1,
  },
  expirySection: {
    marginLeft: 20,
  },
  cardLabel: {
    fontSize: 10,
    color: '#FFFFFF',
    opacity: 0.8,
    fontFamily: 'Inter_400Regular',
    letterSpacing: 1,
    marginBottom: 4,
  },
  cardHolderName: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Inter_500Medium',
  },
  expiryDate: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Inter_500Medium',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 122, 255, 0.3)',
  },
  paginationDotActive: {
    backgroundColor: '#007AFF',
    width: 24,
  },
});