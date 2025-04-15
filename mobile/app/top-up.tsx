import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, CreditCard, Ban as Bank, Wallet, Plus, CircleCheck as CheckCircle2, CircleAlert as AlertCircle } from 'lucide-react-native';
import { router, useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank';
  name: string;
  number: string;
  icon: any;
  color: string;
}

interface StatusMessage {
  type: 'success' | 'error' | 'warning';
  message: string;
  details?: string;
}

export default function TopUpScreen() {
  const navigation = useRouter();
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null);

  const paymentMethods: PaymentMethod[] = [
    {
      id: '1',
      type: 'card',
      name: 'Visa Platinum',
      number: '**** 4562',
      icon: CreditCard,
      color: '#007AFF',
    },
    {
      id: '2',
      type: 'bank',
      name: 'Chase Bank',
      number: '**** 7890',
      icon: Bank,
      color: '#34C759',
    },
  ];

  const quickAmounts = [100, 200, 500, 1000, 2000];

  const handleQuickAmount = (quickAmount: number) => {
    setAmount(quickAmount.toString());
    setStatusMessage(null);
  };

  const validateTopUp = (amount: number): StatusMessage | null => {
    if (amount < 10) {
      return {
        type: 'error',
        message: 'Minimum amount not met',
        details: 'The minimum top-up amount is $10.',
      };
    }

    if (amount > 10000) {
      return {
        type: 'warning',
        message: 'Large top-up amount',
        details: 'Amounts over $10,000 may require additional verification.',
      };
    }

    return null;
  };

  const handleTopUp = () => {
    setStatusMessage(null);

    if (!amount) {
      setStatusMessage({
        type: 'error',
        message: 'Amount required',
        details: 'Please enter an amount to top up.',
      });
      return;
    }

    if (!selectedMethod) {
      setStatusMessage({
        type: 'error',
        message: 'Payment method required',
        details: 'Please select a payment method.',
      });
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setStatusMessage({
        type: 'error',
        message: 'Invalid amount',
        details: 'Please enter a valid amount.',
      });
      return;
    }

    const validationMessage = validateTopUp(numAmount);
    if (validationMessage?.type === 'error') {
      setStatusMessage(validationMessage);
      return;
    }

    // Show success message and proceed
    setStatusMessage({
      type: 'success',
      message: 'Top-up successful',
      details: `$${amount} has been added to your account.`,
    });

    // Navigate back after success
    setTimeout(() => {
      setAmount('');
      setStatusMessage(null);
      setSelectedMethod(null);
      router.back();
    }, 2000);
  };

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.back();
    } else {
      router.replace('/(tabs)');
    }
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={handleBack}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.title}>Top Up</Text>
        <View style={{ width: 40 }} />
      </View>

      {renderStatusMessage()}

      <ScrollView style={styles.content}>
        <Animated.View 
          entering={FadeInDown.duration(400).springify()}
          style={styles.amountSection}
        >
          <Text style={styles.amountLabel}>Enter Amount</Text>
          <View style={styles.amountInputContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={(text) => {
                setAmount(text);
                setStatusMessage(null);
              }}
              placeholder="0.00"
              keyboardType="decimal-pad"
              placeholderTextColor="#8E8E93"
            />
          </View>

          <View style={styles.quickAmounts}>
            {quickAmounts.map((quickAmount) => (
              <TouchableOpacity
                key={quickAmount}
                style={[
                  styles.quickAmountButton,
                  amount === quickAmount.toString() && styles.quickAmountButtonActive
                ]}
                onPress={() => handleQuickAmount(quickAmount)}
              >
                <Text style={[
                  styles.quickAmountText,
                  amount === quickAmount.toString() && styles.quickAmountTextActive
                ]}>
                  ${quickAmount}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        <View style={styles.methodsSection}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          {paymentMethods.map((method, index) => (
            <Animated.View
              key={method.id}
              entering={FadeInDown.delay(index * 100).duration(400).springify()}
            >
              <TouchableOpacity 
                style={[
                  styles.methodItem,
                  selectedMethod?.id === method.id && styles.methodItemSelected
                ]}
                onPress={() => setSelectedMethod(method)}
              >
                <View style={[styles.methodIcon, { backgroundColor: `${method.color}15` }]}>
                  <method.icon size={24} color={method.color} />
                </View>
                <View style={styles.methodInfo}>
                  <Text style={styles.methodName}>{method.name}</Text>
                  <Text style={styles.methodNumber}>{method.number}</Text>
                </View>
                <View style={[
                  styles.checkmark,
                  selectedMethod?.id === method.id && styles.checkmarkSelected
                ]}>
                  <CheckCircle2 
                    size={20} 
                    color={selectedMethod?.id === method.id ? '#FFFFFF' : '#8E8E93'} 
                  />
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}

          <TouchableOpacity 
            style={styles.addMethodButton}
            onPress={() => router.push('/payment-methods')}
          >
            <Plus size={20} color="#007AFF" />
            <Text style={styles.addMethodText}>Add Payment Method</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <Wallet size={20} color="#8E8E93" />
            <Text style={styles.infoText}>
              Top-ups are usually instant but may take up to 24 hours to process depending on your payment method.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[
            styles.topUpButton,
            (!amount || !selectedMethod) && styles.topUpButtonDisabled
          ]}
          disabled={!amount || !selectedMethod}
          onPress={handleTopUp}
        >
          <Text style={styles.topUpButtonText}>Top Up Account</Text>
        </TouchableOpacity>
      </View>
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
  amountSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 20,
  },
  amountLabel: {
    fontSize: 14,
    color: '#8E8E93',
    fontFamily: 'Inter_500Medium',
    marginBottom: 8,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  currencySymbol: {
    fontSize: 32,
    color: '#1A1A1A',
    fontFamily: 'Inter_600SemiBold',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    color: '#1A1A1A',
    fontFamily: 'Inter_600SemiBold',
    padding: Platform.OS === 'ios' ? 0 : 8,
  },
  quickAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickAmountButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
  },
  quickAmountButtonActive: {
    backgroundColor: '#FF9500',
  },
  quickAmountText: {
    fontSize: 14,
    color: '#1A1A1A',
    fontFamily: 'Inter_500Medium',
  },
  quickAmountTextActive: {
    color: '#FFFFFF',
  },
  methodsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#8E8E93',
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 8,
    marginHorizontal: 20,
  },
  methodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 1,
  },
  methodItemSelected: {
    backgroundColor: '#FF950015',
  },
  methodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: 16,
    color: '#1A1A1A',
    fontFamily: 'Inter_500Medium',
    marginBottom: 4,
  },
  methodNumber: {
    fontSize: 14,
    color: '#8E8E93',
    fontFamily: 'Inter_400Regular',
  },
  checkmark: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkSelected: {
    backgroundColor: '#FF9500',
  },
  addMethodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    gap: 8,
    marginTop: 12,
  },
  addMethodText: {
    fontSize: 16,
    color: '#007AFF',
    fontFamily: 'Inter_600SemiBold',
  },
  infoSection: {
    padding: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#8E8E93',
    fontFamily: 'Inter_400Regular',
    lineHeight: 20,
  },
  footer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  topUpButton: {
    backgroundColor: '#FF9500',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topUpButtonDisabled: {
    backgroundColor: '#FF950080',
  },
  topUpButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Inter_600SemiBold',
  },
});