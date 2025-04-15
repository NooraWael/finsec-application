import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, DollarSign, Bell, Shield, Gift, CircleCheck as CheckCircle2, Ban, CreditCard, X } from 'lucide-react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useUser } from '@/contexts/UserContext';
import { authApi } from '@/services/api';
import { formatDistanceToNow } from '@/utils/dateUtils';

interface Transaction {
  id: string;
  amount: number;
  category: string;
  date: string;
  merchant: string;
  paymentMethod: string;
  status: string;
  type: 'credit' | 'debit';
}

interface StatusMessage {
  type: 'success' | 'error' | 'warning';
  message: string;
  details?: string;
}

export default function NotificationListScreen() {
  const { accessToken } = useUser();
  const [notifications, setNotifications] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, [accessToken]);

  const fetchNotifications = async () => {
    if (!accessToken) {
      setError('Authentication required');
      setIsLoading(false);
      return;
    }

    try {
      const response = await authApi.getTransactions(accessToken, 1, 10);
      setNotifications(response.transactions);
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
      setIsLoading(false);
    }
  };

  const handleClearAll = () => {
    if (Platform.OS === 'web') {
      setNotifications([]);
    } else {
      setShowClearConfirm(true);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'shopping':
        return DollarSign;
      case 'electronics':
        return CreditCard;
      case 'income':
        return Gift;
      case 'food & dining':
        return Bell;
      case 'transportation':
        return Shield;
      default:
        return Bell;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'shopping':
        return '#007AFF';
      case 'electronics':
        return '#5856D6';
      case 'income':
        return '#34C759';
      case 'food & dining':
        return '#FF9500';
      case 'transportation':
        return '#FF3B30';
      default:
        return '#8E8E93';
    }
  };

  const renderClearConfirmation = () => {
    if (!showClearConfirm) return null;

    return (
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Clear All Notifications</Text>
          <Text style={styles.modalMessage}>
            Are you sure you want to clear all notifications? This action cannot be undone.
          </Text>
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowClearConfirm(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.clearButton]}
              onPress={() => {
                setNotifications([]);
                setShowClearConfirm(false);
              }}
            >
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
          <Text style={styles.title}>Notifications</Text>
          <TouchableOpacity 
            onPress={() => router.push('/notifications')}
            style={styles.settingsButton}
          >
            <Bell size={24} color="#1A1A1A" />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading notifications...</Text>
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
          <Text style={styles.title}>Notifications</Text>
          <TouchableOpacity 
            onPress={() => router.push('/notifications')}
            style={styles.settingsButton}
          >
            <Bell size={24} color="#1A1A1A" />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchNotifications}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (notifications.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.title}>Notifications</Text>
          <TouchableOpacity 
            onPress={() => router.push('/notifications')}
            style={styles.settingsButton}
          >
            <Bell size={24} color="#1A1A1A" />
          </TouchableOpacity>
        </View>
        <View style={styles.emptyState}>
          <Bell size={48} color="#8E8E93" />
          <Text style={styles.emptyStateTitle}>No Notifications</Text>
          <Text style={styles.emptyStateMessage}>
            You're all caught up! Check back later for new notifications.
          </Text>
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
        <Text style={styles.title}>Notifications</Text>
        <TouchableOpacity 
          onPress={() => router.push('/notifications')}
          style={styles.settingsButton}
        >
          <Bell size={24} color="#1A1A1A" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.notificationList}>
          {notifications.map((notification, index) => {
            const Icon = getCategoryIcon(notification.category);
            const color = getCategoryColor(notification.category);
            
            return (
              <Animated.View
                key={notification.id}
                entering={FadeInDown.delay(index * 100).duration(400).springify()}
              >
                <TouchableOpacity 
                  style={[
                    styles.notificationItem,
                    notification.status === 'pending' && styles.unreadNotification
                  ]}
                  onPress={() => {
                    router.push({
                      pathname: '/transaction-details',
                      params: {
                        id: notification.id,
                        amount: notification.amount.toString(),
                        type: notification.type,
                        category: notification.category,
                        date: notification.date,
                        merchant: notification.merchant,
                        paymentMethod: notification.paymentMethod,
                      },
                    });
                  }}
                >
                  <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
                    <Icon size={24} color={color} />
                  </View>
                  <View style={styles.notificationContent}>
                    <View style={styles.notificationHeader}>
                      <Text style={styles.notificationTitle}>{notification.merchant}</Text>
                      <Text style={styles.timestamp}>
                        {formatDistanceToNow(new Date(notification.date))}
                      </Text>
                    </View>
                    <Text style={styles.message}>
                      {notification.type === 'credit' ? 'Received ' : 'Paid '}
                      ${Math.abs(notification.amount).toFixed(2)} - {notification.category}
                    </Text>
                    <View style={styles.statusContainer}>
                      <View style={[
                        styles.statusBadge,
                        { backgroundColor: notification.status === 'completed' ? '#34C75915' : '#FF950015' }
                      ]}>
                        <Text style={[
                          styles.statusText,
                          { color: notification.status === 'completed' ? '#34C759' : '#FF9500' }
                        ]}>
                          {notification.status.charAt(0).toUpperCase() + notification.status.slice(1)}
                        </Text>
                      </View>
                      <Text style={styles.paymentMethod}>{notification.paymentMethod}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        <TouchableOpacity 
          style={styles.clearAllButton}
          onPress={handleClearAll}
        >
          <Ban size={20} color="#FF3B30" />
          <Text style={styles.clearAllButtonText}>Clear All Notifications</Text>
        </TouchableOpacity>
      </ScrollView>

      {renderClearConfirmation()}
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
  settingsButton: {
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
  notificationList: {
    paddingVertical: 20,
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 1,
  },
  unreadNotification: {
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#1A1A1A',
    flex: 1,
    marginRight: 8,
  },
  timestamp: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#8E8E93',
  },
  message: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },
  paymentMethod: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#8E8E93',
  },
  clearAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    marginTop: 20,
    marginBottom: 40,
  },
  clearAllButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#FF3B30',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    color: '#1A1A1A',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateMessage: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#8E8E93',
    textAlign: 'center',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#8E8E93',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F2F2F7',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#8E8E93',
  },
  clearButton: {
    backgroundColor: '#FF3B30',
  },
  clearButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
  },
});