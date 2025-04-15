import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Search, Plus, Zap, Wifi, Phone, Chrome as Home, Car, CreditCard, Calendar, CircleCheck as CheckCircle2, CircleAlert as AlertCircle, Building2, Dumbbell, Laptop, Book } from 'lucide-react-native';
import { router, useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useUser } from '@/contexts/UserContext';
import { authApi } from '@/services/api';

interface Bill {
  id: string;
  name: string;
  amount: number;
  category: string;
  due_date: string;
  status: string;
  autopay: boolean;
}

interface StatusMessage {
  type: 'success' | 'error' | 'warning';
  message: string;
  details?: string;
}

interface PaymentMethod {
  id: string;
  type: string;
  name: string;
  number: string;
}

export default function BillsScreen() {
  const { accessToken, updateCardBalance } = useUser();
  const navigation = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    fetchBills();
    fetchPaymentMethods();
  }, [accessToken]);

  const fetchBills = async () => {
    if (!accessToken) {
      setError('Authentication required');
      setIsLoading(false);
      return;
    }

    try {
      const response = await authApi.getBills(accessToken);
      setBills(response.bills);
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bills');
      setIsLoading(false);
    }
  };

  const fetchPaymentMethods = async () => {
    if (!accessToken) return;

    try {
      const response = await authApi.getCards(accessToken);
      setPaymentMethods(response.cards);
    } catch (err) {
      console.error('Error fetching payment methods:', err);
    }
  };

  const handlePayBill = async (bill: Bill) => {
    if (bill.status === 'paid') {
      setStatusMessage({
        type: 'warning',
        message: 'Bill already paid',
        details: 'This bill has already been paid and cannot be paid again.',
      });
      return;
    }

    if (!accessToken || !selectedPaymentMethod) {
      setStatusMessage({
        type: 'error',
        message: 'Payment method required',
        details: 'Please select a payment method to proceed.',
      });
      return;
    }

    setIsProcessingPayment(true);
    setStatusMessage(null);

    try {
      const response = await authApi.payBill(accessToken, {
        billId: bill.id,
        amount: bill.amount,
        paymentMethodId: selectedPaymentMethod.id,
      });

      // Update the card balance in the UserContext
      updateCardBalance(selectedPaymentMethod.id, response.card_balance);

      // Update the payment methods list with the new balance
      setPaymentMethods(prevMethods =>
        prevMethods.map(method =>
          method.id === selectedPaymentMethod.id
            ? { ...method, balance: response.card_balance }
            : method
        )
      );

      // Update the local bill status
      setBills(prevBills =>
        prevBills.map(b =>
          b.id === bill.id
            ? { ...b, status: response.status }
            : b
        )
      );

      setStatusMessage({
        type: 'success',
        message: 'Payment successful',
        details: `$${bill.amount.toFixed(2)} paid for ${bill.name}`,
      });

      // Reset selection and navigate back
      setTimeout(() => {
        setSelectedBill(null);
        setSelectedPaymentMethod(null);
        setStatusMessage(null);
        router.back();
      }, 2000);
    } catch (error) {
      setStatusMessage({
        type: 'error',
        message: 'Payment failed',
        details: error instanceof Error ? error.message : 'Failed to process payment',
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'utilities':
        return Zap;
      case 'internet':
        return Wifi;
      case 'phone':
        return Phone;
      case 'housing':
        return Home;
      case 'insurance':
        return Car;
      case 'entertainment':
        return Laptop;
      case 'health & fitness':
        return Dumbbell;
      case 'loans':
        return Book;
      case 'credit cards':
        return CreditCard;
      case 'telecommunications':
        return Phone;
      default:
        return Building2;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'utilities':
        return '#FF9500';
      case 'internet':
        return '#007AFF';
      case 'phone':
        return '#32C759';
      case 'housing':
        return '#5856D6';
      case 'insurance':
        return '#FF3B30';
      case 'entertainment':
        return '#AF52DE';
      case 'health & fitness':
        return '#32C759';
      case 'loans':
        return '#FF9500';
      case 'credit cards':
        return '#007AFF';
      case 'telecommunications':
        return '#5856D6';
      default:
        return '#8E8E93';
    }
  };

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  const filteredBills = bills.filter(bill =>
    bill.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDueDateColor = (dueDate: string, status: string) => {
    if (status === 'paid') return '#8E8E93';
    const today = new Date();
    const due = new Date(dueDate);
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return '#FF3B30';
    if (diffDays <= 3) return '#FF9500';
    return '#34C759';
  };

  const formatDueDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const calculateUpcomingTotal = () => {
    return bills
      .filter(bill => bill.status === 'upcoming')
      .reduce((total, bill) => total + bill.amount, 0);
  };

  const renderStatusMessage = () => {
    if (!statusMessage) return null;

    const icons = {
      success: <CheckCircle2 size={20} color="#34C759" />,
      error: <AlertCircle size={20} color="#FF3B30" />,
      warning: <AlertCircle size={20} color="#FF9500" />,
    };

    const colors = {
      success: '#34C75915',
      error: '#FF3B3015',
      warning: '#FF950015',
    };

    const textColors = {
      success: '#34C759',
      error: '#FF3B30',
      warning: '#FF9500',
    };

    return (
      <Animated.View 
        entering={FadeInDown.duration(400).springify()}
        style={[styles.statusMessage, { backgroundColor: colors[statusMessage.type] }]}
      >
        {icons[statusMessage.type]}
        <View style={styles.statusContent}>
          <Text style={[styles.statusText, { color: textColors[statusMessage.type] }]}>
            {statusMessage.message}
          </Text>
          {statusMessage.details && (
            <Text style={[styles.statusDetails, { color: textColors[statusMessage.type] }]}>
              {statusMessage.details}
            </Text>
          )}
        </View>
      </Animated.View>
    );
  };

  const renderBillItem = (bill: Bill, index: number) => {
    const Icon = getCategoryIcon(bill.category);
    const color = getCategoryColor(bill.category);
    const isPaid = bill.status === 'paid';
    
    return (
      <Animated.View
        key={bill.id}
        entering={FadeInDown.delay(index * 100).duration(400).springify()}
      >
        <TouchableOpacity 
          style={[
            styles.billItem,
            selectedBill?.id === bill.id && styles.billItemSelected,
            isPaid && styles.billItemPaid
          ]}
          onPress={() => !isPaid && setSelectedBill(bill)}
          disabled={isPaid}
        >
          <View style={[styles.billIcon, { backgroundColor: `${color}15` }]}>
            <Icon size={24} color={color} />
          </View>
          <View style={styles.billInfo}>
            <Text style={styles.billName}>{bill.name}</Text>
            <Text style={styles.billAmount}>${bill.amount.toFixed(2)}</Text>
          </View>
          <View style={styles.billStatus}>
            <Text style={[
              styles.dueDate,
              { color: getDueDateColor(bill.due_date, bill.status) }
            ]}>
              {formatDueDate(bill.due_date)}
            </Text>
            {bill.autopay && !isPaid && (
              <View style={styles.autopayBadge}>
                <CreditCard size={12} color="#34C759" />
                <Text style={styles.autopayText}>Auto-pay</Text>
              </View>
            )}
            {isPaid && (
              <View style={styles.paidBadge}>
                <CheckCircle2 size={12} color="#34C759" />
                <Text style={styles.paidText}>Paid</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={handleBack}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.title}>Bills</Text>
          <TouchableOpacity style={styles.addButton}>
            <Plus size={24} color="#1A1A1A" />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading bills...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={handleBack}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.title}>Bills</Text>
          <TouchableOpacity style={styles.addButton}>
            <Plus size={24} color="#1A1A1A" />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchBills}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={handleBack}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.title}>Bills</Text>
        <TouchableOpacity style={styles.addButton}>
          <Plus size={24} color="#1A1A1A" />
        </TouchableOpacity>
      </View>

      {renderStatusMessage()}

      <ScrollView style={styles.content}>
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Search size={20} color="#8E8E93" />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search bills"
              placeholderTextColor="#8E8E93"
            />
          </View>
        </View>

        <View style={styles.summarySection}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Calendar size={24} color="#007AFF" />
              <Text style={styles.summaryTitle}>Upcoming Bills</Text>
            </View>
            <Text style={styles.summaryAmount}>${calculateUpcomingTotal().toFixed(2)}</Text>
            <Text style={styles.summarySubtitle}>Next 30 days</Text>
          </View>
        </View>

        <View style={styles.billsSection}>
          <Text style={styles.sectionTitle}>Your Bills</Text>
          {filteredBills.map((bill, index) => renderBillItem(bill, index))}
        </View>
      </ScrollView>

      {selectedBill && (
        <View style={styles.footer}>
          {selectedBill.status === 'paid' ? (
            <View style={styles.paidNotice}>
              <CheckCircle2 size={24} color="#34C759" />
              <Text style={styles.paidNoticeText}>
                This bill has already been paid
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.paymentMethodSelector}>
                <Text style={styles.paymentMethodLabel}>Select Payment Method:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {paymentMethods.map((method) => (
                    <TouchableOpacity
                      key={method.id}
                      style={[
                        styles.paymentMethodOption,
                        selectedPaymentMethod?.id === method.id && styles.paymentMethodSelected,
                      ]}
                      onPress={() => setSelectedPaymentMethod(method)}
                    >
                      <CreditCard
                        size={20}
                        color={selectedPaymentMethod?.id === method.id ? '#FFFFFF' : '#1A1A1A'}
                      />
                      <Text
                        style={[
                          styles.paymentMethodText,
                          selectedPaymentMethod?.id === method.id && styles.paymentMethodTextSelected,
                        ]}
                      >
                        {method.number}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              <TouchableOpacity
                style={[
                  styles.payButton,
                  (!selectedPaymentMethod || isProcessingPayment) && styles.payButtonDisabled,
                ]}
                disabled={!selectedPaymentMethod || isProcessingPayment}
                onPress={() => selectedBill && handlePayBill(selectedBill)}
              >
                {isProcessingPayment ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.payButtonText}>
                    Pay ${selectedBill.amount.toFixed(2)}
                  </Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      )}
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
  addButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
  },
  content: {
    flex: 1,
  },
  searchSection: {
    padding: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
    fontFamily: 'Inter_400Regular',
  },
  summarySection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 16,
    color: '#1A1A1A',
    fontFamily: 'Inter_600SemiBold',
  },
  summaryAmount: {
    fontSize: 32,
    color: '#1A1A1A',
    fontFamily: 'Inter_700Bold',
    marginBottom: 4,
  },
  summarySubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    fontFamily: 'Inter_400Regular',
  },
  billsSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#8E8E93',
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 8,
    marginHorizontal: 20,
  },
  billItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 1,
  },
  billItemSelected: {
    backgroundColor: '#007AFF15',
  },
  billItemPaid: {
    opacity: 0.7,
    backgroundColor: '#F2F2F7',
  },
  billIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  billInfo: {
    flex: 1,
  },
  billName: {
    fontSize: 16,
    color: '#1A1A1A',
    fontFamily: 'Inter_500Medium',
    marginBottom: 4,
  },
  billAmount: {
    fontSize: 14,
    color: '#1A1A1A',
    fontFamily: 'Inter_600SemiBold',
  },
  billStatus: {
    alignItems: 'flex-end',
  },
  dueDate: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    marginBottom: 4,
  },
  autopayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#34C75915',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  autopayText: {
    fontSize: 12,
    color: '#34C759',
    fontFamily: 'Inter_500Medium',
  },
  paidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#34C75915',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  paidText: {
    fontSize: 12,
    color: '#34C759',
    fontFamily: 'Inter_500Medium',
  },
  footer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  payButton: {
    backgroundColor: '#007AFF',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  payButtonDisabled: {
    backgroundColor: '#007AFF80',
  },
  payButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Inter_600SemiBold',
  },
  statusMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    gap: 12,
  },
  statusContent: {
    flex: 1,
  },
  statusText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
  statusDetails: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#8E8E93',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
  },
  paymentMethodSelector: {
    marginBottom: 16,
  },
  paymentMethodLabel: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#8E8E93',
    marginBottom: 8,
    marginLeft: 4,
  },
  paymentMethodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginRight: 8,
    gap: 8,
  },
  paymentMethodSelected: {
    backgroundColor: '#007AFF',
  },
  paymentMethodText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#1A1A1A',
  },
  paymentMethodTextSelected: {
    color: '#FFFFFF',
  },
  paidNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: '#34C75915',
    borderRadius: 12,
  },
  paidNoticeText: {
    fontSize: 16,
    color: '#34C759',
    fontFamily: 'Inter_500Medium',
  },
});