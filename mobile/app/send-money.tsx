import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Search, Users, Send, ChevronRight, CircleAlert as AlertCircle, CircleCheck as CheckCircle2, Circle as XCircle } from 'lucide-react-native';
import { router, useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface Contact {
  id: string;
  name: string;
  avatar?: string;
  accountNumber: string;
  recentAmount?: number;
  status?: 'active' | 'inactive';
  dailyLimit?: number;
  currentDailySpent?: number;
}

interface StatusMessage {
  type: 'success' | 'error' | 'warning';
  message: string;
}

export default function SendMoneyScreen() {
  const navigation = useRouter();
  const [amount, setAmount] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const contacts: Contact[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      accountNumber: '**** 4321',
      recentAmount: 50,
      status: 'active',
      dailyLimit: 1000,
      currentDailySpent: 800,
    },
    {
      id: '2',
      name: 'Michael Chen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      accountNumber: '**** 8765',
      recentAmount: 25,
      status: 'inactive',
      dailyLimit: 1000,
      currentDailySpent: 0,
    },
    {
      id: '3',
      name: 'Jessica Williams',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      accountNumber: '**** 9876',
      recentAmount: 100,
      status: 'active',
      dailyLimit: 1000,
      currentDailySpent: 200,
    },
  ];

  const quickAmounts = [25, 50, 100, 200, 500];

  const validateTransaction = (contact: Contact, amount: number): StatusMessage | null => {
    if (contact.status === 'inactive') {
      return {
        type: 'error',
        message: 'This account is currently inactive. Please select another recipient.',
      };
    }

    const remainingDailyLimit = contact.dailyLimit! - contact.currentDailySpent!;
    if (amount > remainingDailyLimit) {
      return {
        type: 'error',
        message: `Daily limit exceeded. Remaining limit: $${remainingDailyLimit}`,
      };
    }

    if (amount > 1000) {
      return {
        type: 'warning',
        message: 'Amount exceeds recommended limit. Additional verification may be required.',
      };
    }

    return null;
  };

  const handleSend = (contact: Contact) => {
    if (!amount) {
      setStatusMessage({
        type: 'error',
        message: 'Please enter an amount',
      });
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setStatusMessage({
        type: 'error',
        message: 'Please enter a valid amount',
      });
      return;
    }

    const validationMessage = validateTransaction(contact, numAmount);
    if (validationMessage) {
      setStatusMessage(validationMessage);
      return;
    }

    setStatusMessage({
      type: 'success',
      message: `Successfully sent $${amount} to ${contact.name}`,
    });

    setTimeout(() => {
      setAmount('');
      setStatusMessage(null);
      setSelectedContact(null);
      router.back();
    }, 2000);
  };

  const handleQuickAmount = (quickAmount: number) => {
    setAmount(quickAmount.toString());
    if (selectedContact) {
      const validationMessage = validateTransaction(selectedContact, quickAmount);
      setStatusMessage(validationMessage);
    }
  };

  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact);
    setStatusMessage(null);
  };

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderStatusMessage = () => {
    if (!statusMessage) return null;

    const icons = {
      success: <CheckCircle2 size={20} color="#34C759" />,
      error: <XCircle size={20} color="#FF3B30" />,
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
        <Text style={[styles.statusText, { color: textColors[statusMessage.type] }]}>
          {statusMessage.message}
        </Text>
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
        <Text style={styles.title}>Send Money</Text>
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
                if (selectedContact && text) {
                  const validationMessage = validateTransaction(selectedContact, parseFloat(text));
                  setStatusMessage(validationMessage);
                }
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

        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Search size={20} color="#8E8E93" />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search contacts"
              placeholderTextColor="#8E8E93"
            />
          </View>
          <TouchableOpacity style={styles.addContactButton}>
            <Users size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.contactsSection}>
          <Text style={styles.sectionTitle}>Select Recipient</Text>
          {filteredContacts.map((contact, index) => (
            <Animated.View
              key={contact.id}
              entering={FadeInDown.delay(index * 100).duration(400).springify()}
            >
              <TouchableOpacity 
                style={[
                  styles.contactItem,
                  selectedContact?.id === contact.id && styles.contactItemSelected
                ]}
                onPress={() => handleContactSelect(contact)}
              >
                {contact.avatar ? (
                  <Image 
                    source={{ uri: contact.avatar }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={[styles.avatar, styles.avatarPlaceholder]}>
                    <Text style={styles.avatarText}>{contact.name[0]}</Text>
                  </View>
                )}
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{contact.name}</Text>
                  <Text style={styles.accountNumber}>{contact.accountNumber}</Text>
                </View>
                {contact.recentAmount && (
                  <View style={styles.recentAmount}>
                    <Text style={styles.recentAmountText}>
                      Last: ${contact.recentAmount}
                    </Text>
                  </View>
                )}
                <ChevronRight size={20} color="#8E8E93" />
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[
            styles.sendButton,
            (!amount || !selectedContact || statusMessage?.type === 'error') && styles.sendButtonDisabled
          ]}
          disabled={!amount || !selectedContact || statusMessage?.type === 'error'}
          onPress={() => selectedContact && handleSend(selectedContact)}
        >
          <Send size={20} color="#FFFFFF" />
          <Text style={styles.sendButtonText}>Send Money</Text>
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
  statusMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    gap: 12,
  },
  statusText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
  content: {
    flex: 1,
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
    backgroundColor: '#007AFF',
  },
  quickAmountText: {
    fontSize: 14,
    color: '#1A1A1A',
    fontFamily: 'Inter_500Medium',
  },
  quickAmountTextActive: {
    color: '#FFFFFF',
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  searchBar: {
    flex: 1,
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
  addContactButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactsSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#8E8E93',
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 8,
    marginHorizontal: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 1,
  },
  contactItemSelected: {
    backgroundColor: '#007AFF15',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontFamily: 'Inter_600SemiBold',
  },
  contactInfo: {
    flex: 1,
    marginLeft: 12,
  },
  contactName: {
    fontSize: 16,
    color: '#1A1A1A',
    fontFamily: 'Inter_500Medium',
    marginBottom: 4,
  },
  accountNumber: {
    fontSize: 14,
    color: '#8E8E93',
    fontFamily: 'Inter_400Regular',
  },
  inactiveText: {
    fontSize: 12,
    color: '#FF3B30',
    fontFamily: 'Inter_500Medium',
    marginTop: 4,
  },
  recentAmount: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 12,
  },
  recentAmountText: {
    fontSize: 12,
    color: '#8E8E93',
    fontFamily: 'Inter_500Medium',
  },
  footer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    height: 56,
    borderRadius: 12,
    gap: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#007AFF80',
  },
  sendButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Inter_600SemiBold',
  },
});