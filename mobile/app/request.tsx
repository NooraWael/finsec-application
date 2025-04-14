import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Search, Users, Receipt, ChevronRight, CircleAlert as AlertCircle, CircleCheck as CheckCircle2, Circle as XCircle, Ban } from 'lucide-react-native';
import { router, useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface Contact {
  id: string;
  name: string;
  avatar?: string;
  accountNumber: string;
  recentRequest?: number;
  status: 'active' | 'inactive' | 'blocked';
  requestLimit?: {
    daily: number;
    current: number;
  };
  lastRequestDate?: string;
}

interface StatusMessage {
  type: 'success' | 'error' | 'warning';
  message: string;
  details?: string;
}

export default function RequestScreen() {
  const navigation = useRouter();
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const contacts: Contact[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      accountNumber: '**** 4321',
      recentRequest: 75,
      status: 'active',
      requestLimit: {
        daily: 1000,
        current: 200,
      },
      lastRequestDate: '2024-03-20',
    },
    {
      id: '2',
      name: 'Michael Chen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      accountNumber: '**** 8765',
      recentRequest: 120,
      status: 'inactive',
      requestLimit: {
        daily: 1000,
        current: 0,
      },
    },
    {
      id: '3',
      name: 'Jessica Williams',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      accountNumber: '**** 9876',
      recentRequest: 45,
      status: 'blocked',
      requestLimit: {
        daily: 1000,
        current: 1000,
      },
    },
  ];

  const quickAmounts = [25, 50, 100, 200, 500];

  const validateRequest = (contact: Contact, amount: number): StatusMessage | null => {
    if (contact.status === 'blocked') {
      return {
        type: 'error',
        message: 'Account is blocked',
        details: 'This account cannot receive requests at this time. Please contact support.',
      };
    }

    if (contact.status === 'inactive') {
      return {
        type: 'error',
        message: 'Account is inactive',
        details: 'This account is currently inactive. Please select another recipient.',
      };
    }

    if (contact.requestLimit) {
      const remainingLimit = contact.requestLimit.daily - contact.requestLimit.current;
      if (amount > remainingLimit) {
        return {
          type: 'error',
          message: 'Daily request limit exceeded',
          details: `Remaining limit for today: $${remainingLimit}`,
        };
      }
    }

    if (amount > 2000) {
      return {
        type: 'warning',
        message: 'Large request amount',
        details: 'Requests over $2,000 may require additional verification.',
      };
    }

    if (contact.lastRequestDate === new Date().toISOString().split('T')[0]) {
      return {
        type: 'warning',
        message: 'Multiple requests today',
        details: 'You have already requested money from this contact today.',
      };
    }

    return null;
  };

  const handleRequest = () => {
    // Clear any existing status message
    setStatusMessage(null);

    if (!amount) {
      setStatusMessage({
        type: 'error',
        message: 'Amount required',
        details: 'Please enter an amount to request.',
      });
      return;
    }

    if (!selectedContact) {
      setStatusMessage({
        type: 'error',
        message: 'Contact required',
        details: 'Please select a contact to request money from.',
      });
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setStatusMessage({
        type: 'error',
        message: 'Invalid amount',
        details: 'Please enter a valid amount greater than 0.',
      });
      return;
    }

    if (numAmount < 1) {
      setStatusMessage({
        type: 'error',
        message: 'Minimum amount not met',
        details: 'The minimum request amount is $1.',
      });
      return;
    }

    const validationMessage = validateRequest(selectedContact, numAmount);
    if (validationMessage?.type === 'error') {
      setStatusMessage(validationMessage);
      return;
    }

    // Show success message and proceed
    setStatusMessage({
      type: 'success',
      message: 'Request sent successfully',
      details: `$${amount} requested from ${selectedContact.name}`,
    });

    // Navigate back after success
    setTimeout(() => {
      setAmount('');
      setNote('');
      setStatusMessage(null);
      setSelectedContact(null);
      router.back();
    }, 2000);
  };

  const handleQuickAmount = (quickAmount: number) => {
    setAmount(quickAmount.toString());
    // Remove immediate validation
    setStatusMessage(null);
  };

  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact);
    // Remove immediate validation
    setStatusMessage(null);
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

  const renderContactStatus = (contact: Contact) => {
    return null;
  };

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.back();
    } else {
      // Fallback to the home tab if we can't go back
      router.replace('/(tabs)');
    }
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
        <Text style={styles.title}>Request Money</Text>
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
                // Remove immediate validation
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

        <View style={styles.noteSection}>
          <Text style={styles.noteLabel}>Add a Note</Text>
          <TextInput
            style={styles.noteInput}
            value={note}
            onChangeText={setNote}
            placeholder="What's this request for?"
            placeholderTextColor="#8E8E93"
            multiline
            maxLength={100}
          />
        </View>

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
            <Users size={20} color="#34C759" />
          </TouchableOpacity>
        </View>

        <View style={styles.contactsSection}>
          <Text style={styles.sectionTitle}>Select Contact</Text>
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
                {contact.recentRequest && (
                  <View style={styles.recentRequest}>
                    <Text style={styles.recentRequestText}>
                      Last: ${contact.recentRequest}
                    </Text>
                  </View>
                )}
                {renderContactStatus(contact)}
                <ChevronRight size={20} color="#8E8E93" />
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[
            styles.requestButton,
            (!amount || !selectedContact) && styles.requestButtonDisabled
          ]}
          disabled={!amount || !selectedContact}
          onPress={handleRequest}
        >
          <Receipt size={20} color="#FFFFFF" />
          <Text style={styles.requestButtonText}>Request Money</Text>
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
    backgroundColor: '#34C759',
  },
  quickAmountText: {
    fontSize: 14,
    color: '#1A1A1A',
    fontFamily: 'Inter_500Medium',
  },
  quickAmountTextActive: {
    color: '#FFFFFF',
  },
  noteSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 20,
  },
  noteLabel: {
    fontSize: 14,
    color: '#8E8E93',
    fontFamily: 'Inter_500Medium',
    marginBottom: 8,
  },
  noteInput: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
    height: 80,
    textAlignVertical: 'top',
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#1A1A1A',
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
    backgroundColor: '#34C75915',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    backgroundColor: '#34C759',
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
  recentRequest: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 12,
  },
  recentRequestText: {
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
  requestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#34C759',
    height: 56,
    borderRadius: 12,
    gap: 8,
  },
  requestButtonDisabled: {
    backgroundColor: '#34C75980',
  },
  requestButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Inter_600SemiBold',
  },
  statusContent: {
    flex: 1,
  },
  statusDetails: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginTop: 4,
  }
});