import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight, ArrowUp, ArrowDown, Building2, ShoppingBag, Coffee, Film, Car, Plane, Smartphone, Gift, Dumbbell, Book, Wallet, X } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useUser } from '@/contexts/UserContext';
import { authApi } from '@/services/api';

interface Category {
  name: string;
  amount: number;
  percentage: number;
  monthlyChange: number;
  transactions: number;
}

export default function AnalyticsScreen() {
  const { accessToken } = useUser();
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [accessToken]);

  const fetchAnalytics = async () => {
    if (!accessToken) {
      setError('Authentication required');
      setIsLoading(false);
      return;
    }

    try {
      const response = await authApi.getAnalytics(accessToken);
      setCategories(response.categories);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'shopping':
        return ShoppingBag;
      case 'dining':
        return Coffee;
      case 'entertainment':
        return Film;
      case 'travel':
        return Plane;
      case 'transportation':
        return Car;
      case 'utilities':
        return Building2;
      case 'healthcare':
        return Gift;
      case 'groceries':
        return ShoppingBag;
      case 'electronics':
        return Smartphone;
      case 'fitness':
        return Dumbbell;
      case 'education':
        return Book;
      default:
        return Wallet;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'shopping':
        return '#007AFF';
      case 'dining':
        return '#FF3B30';
      case 'entertainment':
        return '#5856D6';
      case 'travel':
        return '#007AFF';
      case 'transportation':
        return '#FF9500';
      case 'utilities':
        return '#FF9500';
      case 'healthcare':
        return '#34C759';
      case 'groceries':
        return '#34C759';
      case 'electronics':
        return '#5856D6';
      case 'fitness':
        return '#FF3B30';
      case 'education':
        return '#007AFF';
      default:
        return '#8E8E93';
    }
  };

  const handleCategoryPress = (category: Category) => {
    setSelectedCategory(category);
  };

  const renderCategoryModal = () => {
    if (!selectedCategory) return null;

    return (
      <Modal
        visible={!!selectedCategory}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedCategory(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedCategory.name} Details</Text>
              <TouchableOpacity 
                onPress={() => setSelectedCategory(null)}
                style={styles.closeButton}
              >
                <X size={24} color="#1A1A1A" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={[styles.categoryIcon, { backgroundColor: `${getCategoryColor(selectedCategory.name)}15` }]}>
                {React.createElement(getCategoryIcon(selectedCategory.name), {
                  size: 32,
                  color: getCategoryColor(selectedCategory.name)
                })}
              </View>

              <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Total Spent</Text>
                  <Text style={styles.detailValue}>${selectedCategory.amount.toFixed(2)}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Percentage</Text>
                  <Text style={styles.detailValue}>{selectedCategory.percentage}%</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Transactions</Text>
                  <Text style={styles.detailValue}>{selectedCategory.transactions}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Monthly Change</Text>
                  <View style={styles.changeContainer}>
                    {selectedCategory.monthlyChange > 0 ? (
                      <ArrowUp size={16} color="#34C759" />
                    ) : (
                      <ArrowDown size={16} color="#FF3B30" />
                    )}
                    <Text style={[
                      styles.changeText,
                      { color: selectedCategory.monthlyChange > 0 ? '#34C759' : '#FF3B30' }
                    ]}>
                      {Math.abs(selectedCategory.monthlyChange)}%
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const renderAllCategoriesModal = () => {
    return (
      <Modal
        visible={showAllCategories}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAllCategories(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>All Categories</Text>
              <TouchableOpacity 
                onPress={() => setShowAllCategories(false)}
                style={styles.closeButton}
              >
                <X size={24} color="#1A1A1A" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {categories.map((category, index) => {
                const color = getCategoryColor(category.name);
                const Icon = getCategoryIcon(category.name);
                
                return (
                  <TouchableOpacity
                    key={index}
                    style={styles.modalCategoryItem}
                    onPress={() => {
                      setShowAllCategories(false);
                      handleCategoryPress(category);
                    }}
                  >
                    <View style={styles.modalCategoryHeader}>
                      <View style={[styles.categoryIcon, { backgroundColor: `${color}15` }]}>
                        <Icon size={24} color={color} />
                      </View>
                      <View style={styles.modalCategoryInfo}>
                        <Text style={styles.modalCategoryName}>{category.name}</Text>
                        <Text style={styles.modalCategoryAmount}>${category.amount.toFixed(2)}</Text>
                      </View>
                      <View style={styles.modalCategoryPercentage}>
                        <Text style={styles.percentageText}>{category.percentage}%</Text>
                        <View style={styles.changeContainer}>
                          {category.monthlyChange > 0 ? (
                            <ArrowUp size={16} color="#34C759" />
                          ) : (
                            <ArrowDown size={16} color="#FF3B30" />
                          )}
                          <Text style={[
                            styles.changeText,
                            { color: category.monthlyChange > 0 ? '#34C759' : '#FF3B30' }
                          ]}>
                            {Math.abs(category.monthlyChange)}%
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.progressBarContainer}>
                      <View 
                        style={[
                          styles.progressBar,
                          { width: `${category.percentage}%`, backgroundColor: color }
                        ]} 
                      />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Analytics</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading analytics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Analytics</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchAnalytics}
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
        <Text style={styles.title}>Analytics</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Animated.View 
          entering={FadeInDown.duration(400).springify()}
          style={styles.overviewCard}
        >
          <Text style={styles.overviewTitle}>Monthly Overview</Text>
          <Text style={styles.overviewAmount}>
            ${categories.reduce((sum, cat) => sum + cat.amount, 0).toFixed(2)}
          </Text>
          <Text style={styles.overviewDate}>March 2024</Text>
        </Animated.View>

        <View style={styles.categoriesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Spending by Category</Text>
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={() => setShowAllCategories(true)}
            >
              <Text style={styles.viewAllText}>View All</Text>
              <ChevronRight size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.categoriesList} showsVerticalScrollIndicator={false}>
            {categories.map((category, index) => {
              const Icon = getCategoryIcon(category.name);
              const color = getCategoryColor(category.name);
              
              return (
                <Animated.View
                  key={category.name}
                  entering={FadeInDown.delay(index * 100).duration(400).springify()}
                >
                  <TouchableOpacity 
                    style={styles.categoryItem}
                    onPress={() => setSelectedCategory(category)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.categoryHeader}>
                      <View style={styles.categoryTitleSection}>
                        <View style={[styles.categoryIcon, { backgroundColor: `${color}15` }]}>
                          <Icon size={20} color={color} />
                        </View>
                        <View style={styles.categoryTitleContent}>
                          <Text style={styles.categoryName}>{category.name}</Text>
                          <Text style={styles.categoryAmount}>${category.amount.toFixed(2)}</Text>
                        </View>
                      </View>
                      <ChevronRight size={20} color="#8E8E93" />
                    </View>
                    <View style={styles.progressBarContainer}>
                      <View 
                        style={[
                          styles.progressBar,
                          { width: `${category.percentage}%`, backgroundColor: color }
                        ]} 
                      />
                    </View>
                    <Text style={styles.categoryPercentage}>{category.percentage}% of total spending</Text>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.statsGrid}>
          <Animated.View 
            entering={FadeInDown.delay(300).duration(400).springify()}
            style={styles.statCard}
          >
            <Text style={styles.statLabel}>Income</Text>
            <Text style={styles.statAmount}>$5,850.00</Text>
            <View style={styles.statChange}>
              <ArrowUp size={16} color="#34C759" />
              <Text style={[styles.statChangeText, styles.positiveChange]}>+12.5%</Text>
            </View>
          </Animated.View>

          <Animated.View 
            entering={FadeInDown.delay(400).duration(400).springify()}
            style={styles.statCard}
          >
            <Text style={styles.statLabel}>Expenses</Text>
            <Text style={styles.statAmount}>
              ${categories.reduce((sum, cat) => sum + cat.amount, 0).toFixed(2)}
            </Text>
            <View style={styles.statChange}>
              <ArrowDown size={16} color="#FF3B30" />
              <Text style={[styles.statChangeText, styles.negativeChange]}>-8.3%</Text>
            </View>
          </Animated.View>
        </View>
      </ScrollView>

      {renderCategoryModal()}
      {renderAllCategoriesModal()}
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
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'Inter_500Medium',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  overviewCard: {
    backgroundColor: '#007AFF',
    margin: 20,
    padding: 24,
    borderRadius: 16,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  overviewTitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
    fontFamily: 'Inter_400Regular',
  },
  overviewAmount: {
    fontSize: 32,
    color: '#FFFFFF',
    marginTop: 8,
    fontFamily: 'Inter_700Bold',
  },
  overviewDate: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
    marginTop: 8,
    fontFamily: 'Inter_500Medium',
  },
  categoriesSection: {
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
    paddingVertical: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#1A1A1A',
    fontFamily: 'Inter_600SemiBold',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  viewAllText: {
    fontSize: 14,
    color: '#007AFF',
    fontFamily: 'Inter_500Medium',
  },
  categoriesList: {
    maxHeight: 400,
  },
  categoryItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryTitleContent: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    color: '#1A1A1A',
    fontFamily: 'Inter_500Medium',
    marginBottom: 4,
  },
  categoryAmount: {
    fontSize: 14,
    color: '#8E8E93',
    fontFamily: 'Inter_400Regular',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#F2F2F7',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  categoryPercentage: {
    fontSize: 12,
    color: '#8E8E93',
    fontFamily: 'Inter_400Regular',
  },
  statsGrid: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  statLabel: {
    fontSize: 14,
    color: '#8E8E93',
    fontFamily: 'Inter_400Regular',
  },
  statAmount: {
    fontSize: 20,
    color: '#1A1A1A',
    marginTop: 8,
    fontFamily: 'Inter_600SemiBold',
  },
  statChange: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  statChangeText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
  positiveChange: {
    color: '#34C759',
  },
  negativeChange: {
    color: '#FF3B30',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  modalTitle: {
    fontSize: 18,
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
  modalBody: {
    padding: 20,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 20,
    gap: 16,
  },
  detailItem: {
    width: '45%',
  },
  detailLabel: {
    fontSize: 14,
    color: '#8E8E93',
    fontFamily: 'Inter_500Medium',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 18,
    color: '#1A1A1A',
    fontFamily: 'Inter_600SemiBold',
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  changeText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
  modalCategoryItem: {
    marginBottom: 16,
  },
  modalCategoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalCategoryInfo: {
    flex: 1,
    marginLeft: 12,
  },
  modalCategoryName: {
    fontSize: 16,
    color: '#1A1A1A',
    fontFamily: 'Inter_500Medium',
    marginBottom: 4,
  },
  modalCategoryAmount: {
    fontSize: 14,
    color: '#8E8E93',
    fontFamily: 'Inter_400Regular',
  },
  modalCategoryPercentage: {
    alignItems: 'flex-end',
  },
  percentageText: {
    fontSize: 16,
    color: '#1A1A1A',
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 4,
  },
});