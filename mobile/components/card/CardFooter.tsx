import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Gift } from 'lucide-react-native';

interface CardFooterProps {
  cardHolder: string;
  expiryDate: string;
  rewardsPoints?: number;
}

export function CardFooter({ cardHolder, expiryDate, rewardsPoints }: CardFooterProps) {
  return (
    <View style={styles.container}>
      <View style={styles.mainInfo}>
        <View style={styles.holderSection}>
          <Text style={styles.label}>CARD HOLDER</Text>
          <Text style={styles.value}>{cardHolder}</Text>
        </View>
        <View style={styles.expirySection}>
          <Text style={styles.label}>EXPIRES</Text>
          <Text style={styles.value}>{expiryDate}</Text>
        </View>
      </View>
      
      {rewardsPoints !== undefined && (
        <View style={styles.rewardsSection}>
          <Gift size={14} color="#FFFFFF" style={styles.rewardsIcon} />
          <Text style={styles.rewardsText}>
            {rewardsPoints.toLocaleString()} Points
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 'auto',
  },
  mainInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6, // Reduced from 8
  },
  holderSection: {
    flex: 1,
  },
  expirySection: {
    marginLeft: 20,
  },
  label: {
    fontSize: 8,
    color: '#FFFFFF',
    opacity: 0.8,
    fontFamily: 'Inter_400Regular',
    letterSpacing: 1,
    marginBottom: 2,
  },
  value: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: 'Inter_500Medium',
  },
  rewardsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  rewardsIcon: {
    marginRight: 4,
    opacity: 0.9,
  },
  rewardsText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontFamily: 'Inter_500Medium',
  },
});