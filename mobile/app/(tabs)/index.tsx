import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, Send, Receipt, Wallet, CreditCard, ArrowRight, Building2, ShoppingBag, Coffee, Film } from 'lucide-react-native';
import { useUser } from '@/contexts/UserContext';
import { getGreeting, formatCurrency } from '@/utils/dateUtils';
import { router, useNavigation } from 'expo-router';
import CardCarousel from '@/components/card/CardCarousel';
import { useEffect, useState, useCallback } from 'react';
import { authApi } from '@/services/api';
import { formatDistanceToNow } from '@/utils/dateUtils';
import { useFocusEffect } from '@react-navigation/native';

const quickActions = [
  { id: 1, icon: Send, label: 'Send Money', color: '#007AFF', route: '/send-money' },
  { id: 2, icon: Receipt, label: 'Request', color: '#34C759', route: '/request' },
  { id: 3, icon: Wallet, label: 'Top Up', color: '#FF9500', route: '/top-up' },
  { id: 4, icon: CreditCard, label: 'Bills', color: '#FF3B30', route: '/bills' }
];

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'travel':
      return Film;
    case 'utilities':
      return Building2;
    case 'entertainment':
      return Film;
    case 'groceries':
      return ShoppingBag;
    case 'dining':
      return Coffee;
    default:
      return Building2;
  }
};

const getCategoryColor = (category: string) => {
  switch (category.toLowerCase()) {
    case 'travel':
      return '#007AFF';
    case 'utilities':
      return '#FF9500';
    case 'entertainment':
      return '#5856D6';
    case 'groceries':
      return '#34C759';
    case 'dining':
      return '#FF3B30';
    default:
      return '#8E8E93';
  }
};

export default function HomeScreen() {
  const { user, accessToken } = useUser();
  const [cards, setCards] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (accessToken) {
      try {
        setIsLoading(true);
        const [cardsResponse, transactionsResponse] = await Promise.all([
          authApi.getCards(accessToken),
          authApi.getTransactions(accessToken, 1, 4)
        ]);

        setCards(cardsResponse.cards);
        setTransactions(transactionsResponse.transactions);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    }
  }, [accessToken]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const handleQuickAction = (route: string) => {
    router.push(route);
  };

  const handleSeeAllTransactions = () => {
    router.push('/(tabs)/transactions');
  };

  const handleNotifications = () => {
    router.push('/notification-list');
  };

  const handleTransactionPress = (transaction: any) => {
    router.push({
      pathname: '/transaction-details',
      params: {
        id: transaction.id,
        amount: transaction.amount.toString(),
        type: transaction.type,
        category: transaction.category,
        date: transaction.date,
        merchant: transaction.merchant,
        paymentMethod: transaction.paymentMethod,
      },
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {user.avatar ? (
              <Image 
                source={{ uri: user.avatar }} 
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {user.firstName[0]}{user.lastName[0]}
                </Text>
              </View>
            )}
            <View style={styles.greetingContainer}>
              <Text style={styles.greeting}>{getGreeting()},</Text>
              <Text style={styles.name}>{user.preferredName || user.firstName}</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.notificationButton}
            activeOpacity={0.7}
            onPress={handleNotifications}
          >
            <Bell size={24} color="#1A1A1A" />
            {user.notificationCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationCount}>
                  {user.notificationCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <>
            <CardCarousel 
              cards={cards}
              currency={user.preferences.currency}
              formatCurrency={formatCurrency}
            />

            <View style={styles.quickActions}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <View style={styles.actionGrid}>
                {quickActions.map((action) => (
                  <TouchableOpacity 
                    key={action.id} 
                    style={styles.actionItem}
                    activeOpacity={0.7}
                    onPress={() => handleQuickAction(action.route)}
                  >
                    <View style={[styles.actionIcon, { backgroundColor: action.color + '15' }]}>
                      <action.icon size={24} color={action.color} />
                    </View>
                    <Text style={styles.actionText}>{action.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.recentTransactions}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Transactions</Text>
                <TouchableOpacity 
                  style={styles.seeAllButton}
                  activeOpacity={0.7}
                  onPress={handleSeeAllTransactions}
                >
                  <Text style={styles.seeAllText}>See All</Text>
                  <ArrowRight size={20} color="#007AFF" />
                </TouchableOpacity>
              </View>

              {transactions.map((transaction) => {
                const Icon = getCategoryIcon(transaction.category);
                const color = getCategoryColor(transaction.category);
                
                return (
                  <TouchableOpacity 
                    key={transaction.id} 
                    style={styles.transactionItem}
                    activeOpacity={0.7}
                    onPress={() => handleTransactionPress(transaction)}
                  >
                    <View style={[styles.transactionIcon, { backgroundColor: `${color}15` }]}>
                      <Icon size={24} color={color} />
                    </View>
                    <View style={styles.transactionDetails}>
                      <Text style={styles.transactionName}>{transaction.merchant}</Text>
                      <Text style={styles.transactionDescription}>{transaction.category}</Text>
                      <Text style={styles.transactionDate}>
                        {formatDistanceToNow(new Date(transaction.date))}
                      </Text>
                    </View>
                    <Text style={[
                      styles.transactionAmount,
                      { color: transaction.type === 'credit' ? '#34C759' : '#FF3B30' }
                    ]}>
                      {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount), user.preferences.currency)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  greetingContainer: {
    justifyContent: 'center',
  },
  greeting: {
    fontSize: 14,
    color: '#8E8E93',
    fontFamily: 'Inter_400Regular',
  },
  name: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    color: '#1A1A1A',
    marginTop: 4,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  notificationCount: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  loadingText: {
    fontSize: 16,
    color: '#8E8E93',
    fontFamily: 'Inter_500Medium',
  },
  errorContainer: {
    margin: 20,
    padding: 16,
    backgroundColor: '#FFE5E5',
    borderRadius: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
    fontFamily: 'Inter_500Medium',
  },
  quickActions: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#1A1A1A',
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  actionItem: {
    alignItems: 'center',
    width: '23%',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    color: '#1A1A1A',
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
  },
  recentTransactions: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 14,
    color: '#007AFF',
    marginRight: 4,
    fontFamily: 'Inter_500Medium',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionName: {
    fontSize: 16,
    color: '#1A1A1A',
    fontFamily: 'Inter_500Medium',
  },
  transactionDescription: {
    fontSize: 14,
    color: '#8E8E93',
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
    fontFamily: 'Inter_400Regular',
  },
  transactionAmount: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
});