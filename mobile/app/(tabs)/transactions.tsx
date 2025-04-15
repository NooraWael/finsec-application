import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Filter, X, ArrowDown, ArrowUp, Building2, ShoppingBag, Coffee, Film, Car, Chrome as Home, Utensils, Plane, Smartphone, Gift, Dumbbell, Book } from 'lucide-react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useUser } from '@/contexts/UserContext';
import { authApi } from '@/services/api';
import { formatDistanceToNow } from '@/utils/dateUtils';

interface FilterOptions {
  dateRange: 'all' | 'today' | 'week' | 'month' | 'custom';
  type: 'all' | 'credit' | 'debit';
  amountRange: {
    min: string;
    max: string;
  };
}

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'travel':
      return Plane;
    case 'utilities':
      return Building2;
    case 'entertainment':
      return Film;
    case 'groceries':
      return ShoppingBag;
    case 'dining':
      return Coffee;
    case 'transportation':
      return Car;
    case 'healthcare':
      return Gift;
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
    case 'transportation':
      return '#FF9500';
    case 'healthcare':
      return '#5856D6';
    default:
      return '#8E8E93';
  }
};

export default function TransactionsScreen() {
  const { accessToken } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    dateRange: 'all',
    type: 'all',
    amountRange: {
      min: '',
      max: '',
    },
  });

  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, [accessToken]);

  const fetchTransactions = async (page = 1) => {
    if (!accessToken) return;

    try {
      setIsLoading(page === 1);
      setIsLoadingMore(page > 1);

      const response = await authApi.getTransactions(accessToken, page, 10);
      
      setTransactions(prev => 
        page === 1 ? response.transactions : [...prev, ...response.transactions]
      );
      setTotalPages(response.pagination.pages);
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const loadMoreTransactions = () => {
    if (currentPage < totalPages && !isLoadingMore) {
      fetchTransactions(currentPage + 1);
    }
  };

  const handleTransactionPress = (transaction: any) => {
    router.push({
      pathname: '/transaction-details',
      params: {
        id: transaction.id,
        name: transaction.merchant,
        amount: transaction.amount.toString(),
        type: transaction.type,
        category: transaction.category,
        date: transaction.date,
        description: transaction.merchant,
        reference: transaction.id,
        paymentMethod: transaction.paymentMethod,
      },
    });
  };

  const filterTransactions = (transactions: any[]) => {
    return transactions.filter(transaction => {
      // Search query filter
      if (searchQuery && !transaction.merchant.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !transaction.category.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Transaction type filter
      if (filterOptions.type !== 'all' && transaction.type !== filterOptions.type) {
        return false;
      }

      // Amount range filter
      const minAmount = filterOptions.amountRange.min ? parseFloat(filterOptions.amountRange.min) : null;
      const maxAmount = filterOptions.amountRange.max ? parseFloat(filterOptions.amountRange.max) : null;
      const absAmount = Math.abs(transaction.amount);

      if (minAmount !== null && absAmount < minAmount) return false;
      if (maxAmount !== null && absAmount > maxAmount) return false;

      return true;
    });
  };

  const filteredTransactions = filterTransactions(transactions);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Transactions</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading transactions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Transactions</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => fetchTransactions(1)}
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
        <Text style={styles.title}>Transactions</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#8E8E93" />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search transactions"
            placeholderTextColor="#8E8E93"
          />
        </View>
        <TouchableOpacity 
          style={[
            styles.filterButton,
            (filterOptions.dateRange !== 'all' || 
             filterOptions.type !== 'all' || 
             filterOptions.amountRange.min !== '' || 
             filterOptions.amountRange.max !== '') && styles.filterButtonActive
          ]}
          onPress={() => setIsFilterModalVisible(true)}
        >
          <Filter size={20} color={
            filterOptions.dateRange !== 'all' || 
            filterOptions.type !== 'all' || 
            filterOptions.amountRange.min !== '' || 
            filterOptions.amountRange.max !== '' 
              ? '#FFFFFF' 
              : '#007AFF'
          } />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.transactionList}
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
          
          if (isCloseToBottom) {
            loadMoreTransactions();
          }
        }}
        scrollEventThrottle={400}
      >
        {filteredTransactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No transactions found</Text>
            <Text style={styles.emptyStateSubtext}>Try adjusting your filters</Text>
          </View>
        ) : (
          <>
            {filteredTransactions.map((transaction, index) => {
              const Icon = getCategoryIcon(transaction.category);
              const color = getCategoryColor(transaction.category);
              
              return (
                <Animated.View
                  key={transaction.id}
                  entering={FadeInDown.delay(index * 100).duration(400).springify()}
                >
                  <TouchableOpacity 
                    style={styles.transactionItem}
                    onPress={() => handleTransactionPress(transaction)}
                  >
                    <View style={styles.transactionContent}>
                      <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
                        <Icon size={24} color={color} />
                      </View>
                      <View style={styles.transactionInfo}>
                        <Text style={styles.transactionName}>{transaction.merchant}</Text>
                        <Text style={styles.transactionDescription}>{transaction.category}</Text>
                        <Text style={styles.transactionDate}>
                          {formatDistanceToNow(new Date(transaction.date))}
                        </Text>
                      </View>
                      <View style={styles.amountContainer}>
                        <Text style={[
                          styles.transactionAmount,
                          { color: transaction.type === 'credit' ? '#34C759' : '#FF3B30' }
                        ]}>
                          {transaction.type === 'credit' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}

            {isLoadingMore && (
              <View style={styles.loadingMoreContainer}>
                <ActivityIndicator size="small" color="#007AFF" />
                <Text style={styles.loadingMoreText}>Loading more...</Text>
              </View>
            )}
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
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter_600SemiBold',
    color: '#1A1A1A',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
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
    fontFamily: 'Inter_400Regular',
    color: '#1A1A1A',
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  transactionList: {
    flex: 1,
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
    color: '#FF3B30',
    fontFamily: 'Inter_500Medium',
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
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#8E8E93',
  },
  transactionItem: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 1,
  },
  transactionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
    marginRight: 12,
  },
  transactionName: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  transactionDescription: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#8E8E93',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#8E8E93',
  },
  amountContainer: {
    alignItems: 'flex-end',
    minWidth: 100,
  },
  transactionAmount: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'right',
  },
  loadingMoreContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  loadingMoreText: {
    fontSize: 14,
    color: '#8E8E93',
    fontFamily: 'Inter_500Medium',
  },
});