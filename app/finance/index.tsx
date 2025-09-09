import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import axios from 'axios';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths } from 'date-fns';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';
const { width: screenWidth } = Dimensions.get('window');

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  date: string;
  appointment_id?: string;
  client_name?: string;
  created_at: string;
}

interface FinanceStats {
  daily_income: number;
  weekly_income: number;
  monthly_income: number;
  daily_expenses: number;
  weekly_expenses: number;
  monthly_expenses: number;
  net_profit_week: number;
  net_profit_month: number;
  top_services: Array<{
    service: string;
    count: number;
    revenue: number;
  }>;
  expense_categories: Array<{
    category: string;
    total: number;
    percentage: number;
  }>;
}

const expenseCategories = [
  { value: 'supplies', label: 'Supplies & Materials', icon: 'cube-outline', color: '#E879F9' },
  { value: 'rent', label: 'Rent & Utilities', icon: 'home-outline', color: '#2DD4BF' },
  { value: 'marketing', label: 'Marketing', icon: 'megaphone-outline', color: '#A855F7' },
  { value: 'equipment', label: 'Equipment', icon: 'hardware-chip-outline', color: '#F59E0B' },
  { value: 'training', label: 'Training & Education', icon: 'school-outline', color: '#10B981' },
  { value: 'insurance', label: 'Insurance', icon: 'shield-outline', color: '#EF4444' },
  { value: 'other', label: 'Other', icon: 'ellipsis-horizontal-outline', color: '#6B7280' },
];

export default function FinancePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<FinanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('week');

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const fetchFinanceData = async () => {
    try {
      setLoading(true);
      
      // Fetch recent transactions
      const transactionsResponse = await axios.get(`${BACKEND_URL}/api/finance/transactions`, {
        params: {
          limit: 50,
        },
      });
      
      // Fetch finance statistics
      const statsResponse = await axios.get(`${BACKEND_URL}/api/finance/stats`);
      
      setTransactions(transactionsResponse.data);
      setStats(statsResponse.data);
    } catch (error) {
      console.error('Error fetching finance data:', error);
      // For demo purposes, use mock data
      setTransactions(generateMockTransactions());
      setStats(generateMockStats());
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFinanceData();
    setRefreshing(false);
  };

  const generateMockTransactions = (): Transaction[] => [
    {
      id: '1',
      type: 'income',
      amount: 450,
      description: 'Eyebrow Microblading',
      category: 'service',
      date: new Date().toISOString(),
      client_name: 'Maria Rodriguez',
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      type: 'expense',
      amount: 85,
      description: 'Pigments - Brown Set',
      category: 'supplies',
      date: new Date(Date.now() - 86400000).toISOString(),
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: '3',
      type: 'income',
      amount: 500,
      description: 'Lip Blush',
      category: 'service',
      date: new Date(Date.now() - 172800000).toISOString(),
      client_name: 'Sarah Johnson',
      created_at: new Date(Date.now() - 172800000).toISOString(),
    },
    {
      id: '4',
      type: 'expense',
      amount: 45,
      description: 'Disposable needles',
      category: 'supplies',
      date: new Date(Date.now() - 259200000).toISOString(),
      created_at: new Date(Date.now() - 259200000).toISOString(),
    },
    {
      id: '5',
      type: 'income',
      amount: 150,
      description: 'Touch-up Session',
      category: 'service',
      date: new Date(Date.now() - 345600000).toISOString(),
      client_name: 'Anna Chen',
      created_at: new Date(Date.now() - 345600000).toISOString(),
    },
  ];

  const generateMockStats = (): FinanceStats => ({
    daily_income: 450,
    weekly_income: 2450,
    monthly_income: 8950,
    daily_expenses: 45,
    weekly_expenses: 285,
    monthly_expenses: 1240,
    net_profit_week: 2165,
    net_profit_month: 7710,
    top_services: [
      { service: 'Eyebrow Microblading', count: 8, revenue: 3600 },
      { service: 'Lip Blush', count: 5, revenue: 2500 },
      { service: 'Touch-up Sessions', count: 12, revenue: 1800 },
    ],
    expense_categories: [
      { category: 'supplies', total: 680, percentage: 55 },
      { category: 'rent', total: 350, percentage: 28 },
      { category: 'marketing', total: 120, percentage: 10 },
      { category: 'other', total: 90, percentage: 7 },
    ],
  });

  const renderStatsCards = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statsRow}>
        <View style={[styles.statCard, styles.incomeCard]}>
          <View style={styles.statHeader}>
            <Ionicons name="trending-up" size={24} color="#10B981" />
            <Text style={styles.statTitle}>Income</Text>
          </View>
          <Text style={styles.statAmount}>
            ${selectedPeriod === 'week' ? stats?.weekly_income?.toLocaleString() : stats?.monthly_income?.toLocaleString()}
          </Text>
          <Text style={styles.statPeriod}>This {selectedPeriod}</Text>
        </View>
        
        <View style={[styles.statCard, styles.expenseCard]}>
          <View style={styles.statHeader}>
            <Ionicons name="trending-down" size={24} color="#EF4444" />
            <Text style={styles.statTitle}>Expenses</Text>
          </View>
          <Text style={styles.statAmount}>
            ${selectedPeriod === 'week' ? stats?.weekly_expenses?.toLocaleString() : stats?.monthly_expenses?.toLocaleString()}
          </Text>
          <Text style={styles.statPeriod}>This {selectedPeriod}</Text>
        </View>
      </View>
      
      <View style={[styles.statCard, styles.profitCard]}>
        <View style={styles.statHeader}>
          <Ionicons name="cash" size={28} color="#E879F9" />
          <Text style={styles.profitTitle}>Net Profit</Text>
        </View>
        <Text style={styles.profitAmount}>
          ${selectedPeriod === 'week' ? stats?.net_profit_week?.toLocaleString() : stats?.net_profit_month?.toLocaleString()}
        </Text>
        <Text style={styles.profitPeriod}>This {selectedPeriod}</Text>
      </View>
    </View>
  );

  const renderTopServices = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Top Services</Text>
      <View style={styles.servicesContainer}>
        {stats?.top_services?.map((service, index) => (
          <View key={index} style={styles.serviceCard}>
            <View style={styles.serviceRank}>
              <Text style={styles.rankNumber}>{index + 1}</Text>
            </View>
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceName}>{service.service}</Text>
              <Text style={styles.serviceDetails}>
                {service.count} sessions • ${service.revenue.toLocaleString()}
              </Text>
            </View>
            <View style={styles.serviceRevenue}>
              <Text style={styles.revenueAmount}>${service.revenue.toLocaleString()}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderExpenseBreakdown = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Expense Categories</Text>
      <View style={styles.expensesContainer}>
        {stats?.expense_categories?.map((category, index) => {
          const categoryInfo = expenseCategories.find(c => c.value === category.category);
          return (
            <View key={index} style={styles.expenseCategory}>
              <View style={styles.categoryHeader}>
                <Ionicons 
                  name={categoryInfo?.icon as any || 'ellipsis-horizontal-outline'} 
                  size={20} 
                  color={categoryInfo?.color || '#6B7280'} 
                />
                <Text style={styles.categoryName}>
                  {categoryInfo?.label || category.category}
                </Text>
                <Text style={styles.categoryAmount}>${category.total}</Text>
              </View>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${category.percentage}%`,
                      backgroundColor: categoryInfo?.color || '#6B7280'
                    }
                  ]} 
                />
              </View>
              <Text style={styles.categoryPercentage}>{category.percentage}%</Text>
            </View>
          );
        })}
      </View>
    </View>
  );

  const renderRecentTransactions = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        <TouchableOpacity 
          style={styles.viewAllButton}
          onPress={() => router.push('/finance/transactions')}
        >
          <Text style={styles.viewAllText}>View All</Text>
          <Ionicons name="chevron-forward" size={16} color="#E879F9" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.transactionsContainer}>
        {transactions.slice(0, 5).map((transaction) => (
          <View key={transaction.id} style={styles.transactionCard}>
            <View style={[
              styles.transactionIcon,
              { backgroundColor: transaction.type === 'income' ? '#10B981' : '#EF4444' }
            ]}>
              <Ionicons 
                name={transaction.type === 'income' ? 'add' : 'remove'} 
                size={16} 
                color="#FFFFFF" 
              />
            </View>
            
            <View style={styles.transactionInfo}>
              <Text style={styles.transactionDescription}>{transaction.description}</Text>
              {transaction.client_name && (
                <Text style={styles.clientName}>{transaction.client_name}</Text>
              )}
              <Text style={styles.transactionDate}>
                {format(new Date(transaction.date), 'MMM d, yyyy')}
              </Text>
            </View>
            
            <Text style={[
              styles.transactionAmount,
              { color: transaction.type === 'income' ? '#10B981' : '#EF4444' }
            ]}>
              {transaction.type === 'income' ? '+' : '-'}${transaction.amount}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading finance data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Finance Dashboard</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/finance/add-transaction')}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Period Toggle */}
      <View style={styles.periodToggle}>
        <TouchableOpacity
          style={[styles.toggleButton, selectedPeriod === 'week' && styles.toggleButtonActive]}
          onPress={() => setSelectedPeriod('week')}
        >
          <Text style={[styles.toggleText, selectedPeriod === 'week' && styles.toggleTextActive]}>
            Week
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, selectedPeriod === 'month' && styles.toggleButtonActive]}
          onPress={() => setSelectedPeriod('month')}
        >
          <Text style={[styles.toggleText, selectedPeriod === 'month' && styles.toggleTextActive]}>
            Month
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderStatsCards()}
        {renderTopServices()}
        {renderExpenseBreakdown()}
        {renderRecentTransactions()}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/finance/add-transaction')}
          >
            <Ionicons name="add-circle-outline" size={24} color="#E879F9" />
            <Text style={styles.actionButtonText}>Add Transaction</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/finance/reports')}
          >
            <Ionicons name="document-text-outline" size={24} color="#2DD4BF" />
            <Text style={styles.actionButtonText}>Generate Report</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#9CA3AF',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    flex: 1,
  },
  addButton: {
    backgroundColor: '#E879F9',
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  periodToggle: {
    flexDirection: 'row',
    backgroundColor: '#1F1F1F',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleButtonActive: {
    backgroundColor: '#E879F9',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: '#1F1F1F',
    borderRadius: 16,
    padding: 20,
    flex: 0.48,
    borderWidth: 1,
  },
  incomeCard: {
    borderColor: '#10B981',
  },
  expenseCard: {
    borderColor: '#EF4444',
  },
  profitCard: {
    borderColor: '#E879F9',
    backgroundColor: '#1F1F1F',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statTitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginLeft: 8,
    fontWeight: '500',
  },
  statAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statPeriod: {
    fontSize: 12,
    color: '#6B7280',
  },
  profitTitle: {
    fontSize: 16,
    color: '#E879F9',
    marginLeft: 12,
    fontWeight: '600',
  },
  profitAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#E879F9',
    marginBottom: 4,
  },
  profitPeriod: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    color: '#E879F9',
    marginRight: 4,
  },
  servicesContainer: {
    backgroundColor: '#1F1F1F',
    borderRadius: 16,
    padding: 16,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  serviceRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#A855F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  serviceDetails: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  serviceRevenue: {
    alignItems: 'flex-end',
  },
  revenueAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
  },
  expensesContainer: {
    backgroundColor: '#1F1F1F',
    borderRadius: 16,
    padding: 16,
  },
  expenseCategory: {
    marginBottom: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    color: '#FFFFFF',
    flex: 1,
    marginLeft: 12,
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#374151',
    borderRadius: 3,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  categoryPercentage: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
  },
  transactionsContainer: {
    backgroundColor: '#1F1F1F',
    borderRadius: 16,
    padding: 16,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  transactionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  clientName: {
    fontSize: 12,
    color: '#2DD4BF',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 32,
    marginBottom: 32,
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 0.48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});