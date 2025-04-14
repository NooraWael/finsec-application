import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ArrowDown, ArrowUp, Calendar, Clock, CreditCard, Receipt, Tag, FileText } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function TransactionDetailsScreen() {
  const params = useLocalSearchParams<{
    id: string;
    name: string;
    amount: string;
    type: string;
    category: string;
    date: string;
    description?: string;
    reference?: string;
    paymentMethod?: string;
  }>();

  const isCredit = params.type === 'credit';

  const renderDetailItem = (icon: any, label: string, value: string, index: number) => (
    <Animated.View
      entering={FadeInDown.delay(index * 100).duration(400).springify()}
      style={styles.detailItem}
    >
      <View style={[styles.iconContainer, { backgroundColor: isCredit ? '#34C75915' : '#FF3B3015' }]}>
        {icon}
      </View>
      <View style={styles.detailContent}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.title}>Transaction Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        <Animated.View 
          entering={FadeInDown.duration(400).springify()}
          style={styles.amountCard}
        >
          <Text style={styles.amountLabel}>
            {isCredit ? 'Amount Received' : 'Amount Sent'}
          </Text>
          <View style={styles.amountRow}>
            {isCredit ? (
              <ArrowDown size={24} color="#34C759" />
            ) : (
              <ArrowUp size={24} color="#FF3B30" />
            )}
            <Text style={[
              styles.amount,
              { color: isCredit ? '#34C759' : '#FF3B30' }
            ]}>
              ${Math.abs(parseFloat(params.amount)).toFixed(2)}
            </Text>
          </View>
          <View style={[
            styles.statusBadge,
            { backgroundColor: isCredit ? '#34C75915' : '#FF3B3015' }
          ]}>
            <Text style={[
              styles.statusText,
              { color: isCredit ? '#34C759' : '#FF3B30' }
            ]}>
              {isCredit ? 'Completed' : 'Sent'}
            </Text>
          </View>
        </Animated.View>

        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Transaction Details</Text>
          {renderDetailItem(
            <Calendar size={24} color="#1A1A1A" />,
            'Date',
            params.date,
            0
          )}
          {renderDetailItem(
            <Clock size={24} color="#1A1A1A" />,
            'Time',
            new Date().toLocaleTimeString(),
            1
          )}
          {renderDetailItem(
            <Tag size={24} color="#1A1A1A" />,
            'Category',
            params.category,
            2
          )}
          {params.paymentMethod && renderDetailItem(
            <CreditCard size={24} color="#1A1A1A" />,
            'Payment Method',
            params.paymentMethod,
            3
          )}
          {params.reference && renderDetailItem(
            <Receipt size={24} color="#1A1A1A" />,
            'Reference',
            params.reference,
            4
          )}
          {params.description && renderDetailItem(
            <FileText size={24} color="#1A1A1A" />,
            'Description',
            params.description,
            5
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#1A1A1A',
  },
  content: {
    flex: 1,
  },
  amountCard: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 14,
    color: '#8E8E93',
    fontFamily: 'Inter_500Medium',
    marginBottom: 8,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  amount: {
    fontSize: 32,
    fontFamily: 'Inter_700Bold',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  detailsSection: {
    backgroundColor: '#FFFFFF',
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#8E8E93',
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 8,
    marginHorizontal: 20,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#8E8E93',
    fontFamily: 'Inter_500Medium',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#1A1A1A',
    fontFamily: 'Inter_400Regular',
  },
});