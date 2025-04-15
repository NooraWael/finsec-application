import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal, TextInput, Alert, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Plus, CreditCard, Ban as Bank, Trash2, X } from 'lucide-react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useUser } from '@/contexts/UserContext';
import { authApi } from '@/services/api';

interface PaymentMethod {
  id: string;
  cardHolder: string;
  cardNumber: string;
  expiryDate: string;
  cardType: string;
  cardNetwork: 'visa' | 'mastercard' | 'amex';
  balance: number;
  bankName: string;
  rewardsPoints: number;
}

interface NewPaymentMethod {
  type: 'card' | 'bank';
  name: string;
  number: string;
  expiryDate?: string;
}

export default function PaymentMethodsScreen() {
  const { accessToken } = useUser();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newMethod, setNewMethod] = useState<NewPaymentMethod>({
    type: 'card',
    name: '',
    number: '',
    expiryDate: '',
  });

  useEffect(() => {
    fetchPaymentMethods();
  }, [accessToken]);

  const fetchPaymentMethods = async () => {
    if (!accessToken) {
      setError('Authentication required');
      setIsLoading(false);
      return;
    }

    try {
      const response = await authApi.getCards(accessToken);
      setPaymentMethods(response.cards);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch payment methods');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMethod = () => {
    setError(null);

    // Basic validation
    if (!newMethod.name.trim()) {
      setError('Please enter a name for the payment method');
      return;
    }

    if (!newMethod.number.trim()) {
      setError('Please enter a number');
      return;
    }

    if (newMethod.type === 'card' && !newMethod.expiryDate?.trim()) {
      setError('Please enter an expiry date');
      return;
    }

    // Close modal and reset form
    setIsModalVisible(false);
    setNewMethod({ type: 'card', name: '', number: '', expiryDate: '' });
  };

  const handleRemove = (id: string) => {
    const methodToRemove = paymentMethods.find(method => method.id === id);
    
    if (!methodToRemove) return;

    if (paymentMethods.length === 1) {
      Alert.alert(
        'Cannot Remove Payment Method',
        'You must have at least one payment method.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Remove the payment method
    setPaymentMethods(prev => prev.filter(method => method.id !== id));
  };

  const handleMakeDefault = (id: string) => {
    setPaymentMethods(prev =>
      prev.map(method => ({
        ...method,
        isDefault: method.id === id,
      }))
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.title}>Payment Methods</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading payment methods...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.title}>Payment Methods</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchPaymentMethods}
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
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.title}>Payment Methods</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        <TouchableOpacity 
          style={styles.addMethodButton}
          onPress={() => setIsModalVisible(true)}
        >
          <View style={styles.addMethodIcon}>
            <Plus size={24} color="#007AFF" />
          </View>
          <View style={styles.addMethodText}>
            <Text style={styles.addMethodTitle}>Add Payment Method</Text>
            <Text style={styles.addMethodDescription}>
              Add a new card or bank account
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.paymentMethodsSection}>
          <Text style={styles.sectionTitle}>Your Payment Methods</Text>
          {paymentMethods.map((method, index) => (
            <Animated.View
              key={method.id}
              entering={FadeInDown.delay(index * 100).duration(400).springify()}
              style={styles.paymentMethodItem}
            >
              <View style={styles.paymentMethodContent}>
                <View style={[
                  styles.iconContainer,
                  { backgroundColor: method.cardNetwork === 'visa' ? '#007AFF15' : '#34C75915' }
                ]}>
                  {method.cardNetwork === 'visa' ? (
                    <CreditCard size={24} color="#007AFF" />
                  ) : (
                    <Bank size={24} color="#34C759" />
                  )}
                </View>
                <View style={styles.paymentMethodInfo}>
                  <Text style={styles.paymentMethodName}>{method.cardType}</Text>
                  <Text style={styles.paymentMethodNumber}>{method.cardNumber}</Text>
                  <Text style={styles.expiryDate}>Expires {method.expiryDate}</Text>
                </View>
                <Image
                  source={{ uri: `https://images.unsplash.com/photo-1670469365293-6c9bca09899d?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3` }}
                  style={styles.cardLogo}
                />
              </View>
              <View style={styles.paymentMethodActions}>
                {method.isDefault ? (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultText}>Default</Text>
                  </View>
                ) : (
                  <TouchableOpacity 
                    style={styles.makeDefaultButton}
                    onPress={() => handleMakeDefault(method.id)}
                  >
                    <Text style={styles.makeDefaultText}>Make Default</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => handleRemove(method.id)}
                >
                  <Trash2 size={20} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            </Animated.View>
          ))}
        </View>

        <Text style={styles.footer}>
          Your payment information is securely stored and encrypted. We never store complete card numbers.
        </Text>
      </ScrollView>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Payment Method</Text>
              <TouchableOpacity 
                onPress={() => setIsModalVisible(false)}
                style={styles.closeButton}
              >
                <X size={24} color="#1A1A1A" />
              </TouchableOpacity>
            </View>

            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  newMethod.type === 'card' && styles.typeButtonActive
                ]}
                onPress={() => setNewMethod(prev => ({ ...prev, type: 'card' }))}
              >
                <CreditCard 
                  size={24} 
                  color={newMethod.type === 'card' ? '#FFFFFF' : '#1A1A1A'} 
                />
                <Text style={[
                  styles.typeButtonText,
                  newMethod.type === 'card' && styles.typeButtonTextActive
                ]}>Card</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  newMethod.type === 'bank' && styles.typeButtonActive
                ]}
                onPress={() => setNewMethod(prev => ({ ...prev, type: 'bank' }))}
              >
                <Bank 
                  size={24} 
                  color={newMethod.type === 'bank' ? '#FFFFFF' : '#1A1A1A'} 
                />
                <Text style={[
                  styles.typeButtonText,
                  newMethod.type === 'bank' && styles.typeButtonTextActive
                ]}>Bank</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                {newMethod.type === 'card' ? 'Card Name' : 'Bank Name'}
              </Text>
              <TextInput
                style={styles.input}
                value={newMethod.name}
                onChangeText={(text) => setNewMethod(prev => ({ ...prev, name: text }))}
                placeholder={newMethod.type === 'card' ? 'Enter card name' : 'Enter bank name'}
                placeholderTextColor="#8E8E93"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                {newMethod.type === 'card' ? 'Card Number' : 'Account Number'}
              </Text>
              <TextInput
                style={styles.input}
                value={newMethod.number}
                onChangeText={(text) => setNewMethod(prev => ({ ...prev, number: text }))}
                placeholder={newMethod.type === 'card' ? 'Enter card number' : 'Enter account number'}
                placeholderTextColor="#8E8E93"
                keyboardType="numeric"
                maxLength={newMethod.type === 'card' ? 16 : 10}
              />
            </View>

            {newMethod.type === 'card' && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Expiry Date</Text>
                <TextInput
                  style={styles.input}
                  value={newMethod.expiryDate}
                  onChangeText={(text) => setNewMethod(prev => ({ ...prev, expiryDate: text }))}
                  placeholder="MM/YY"
                  placeholderTextColor="#8E8E93"
                  maxLength={5}
                />
              </View>
            )}

            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}

            <TouchableOpacity 
              style={styles.addButton}
              onPress={handleAddMethod}
            >
              <Text style={styles.addButtonText}>Add Payment Method</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  addMethodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    gap: 16,
  },
  addMethodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#007AFF15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addMethodText: {
    flex: 1,
  },
  addMethodTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  addMethodDescription: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#8E8E93',
  },
  paymentMethodsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#8E8E93',
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 8,
    marginHorizontal: 20,
  },
  paymentMethodItem: {
    backgroundColor: '#FFFFFF',
    marginBottom: 1,
    padding: 20,
  },
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  paymentMethodNumber: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#8E8E93',
    marginBottom: 2,
  },
  expiryDate: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#8E8E93',
  },
  cardLogo: {
    width: 40,
    height: 24,
    resizeMode: 'contain',
  },
  bankLogo: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  paymentMethodActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  defaultBadge: {
    backgroundColor: '#34C75915',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  defaultText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: '#34C759',
  },
  makeDefaultButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  makeDefaultText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#007AFF',
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FF3B3015',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#8E8E93',
    textAlign: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    ...Platform.select({
      ios: {
        paddingBottom: 40,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    color: '#1A1A1A',
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
  },
  typeButtonActive: {
    backgroundColor: '#007AFF',
  },
  typeButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#1A1A1A',
  },
  typeButtonTextActive: {
    color: '#FFFFFF',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#8E8E93',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#1A1A1A',
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#FF3B30',
    marginBottom: 16,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#8E8E93',
    fontFamily: 'Inter_500Medium',
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
});