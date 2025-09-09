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
import { FlashList } from '@shopify/flash-list';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';
const { width: screenWidth } = Dimensions.get('window');

interface Product {
  id: string;
  name: string;
  brand?: string;
  category: string;
  sku?: string;
  unit: string;
  current_stock: number;
  min_stock_level: number;
  max_stock_level: number;
  cost_per_unit?: number;
  supplier?: string;
  notes?: string;
  total_purchased: number;
  total_used: number;
  last_restocked?: string;
  created_at: string;
  updated_at: string;
}

interface InventoryStats {
  total_products: number;
  total_inventory_value: number;
  low_stock_alerts: number;
  category_breakdown: Array<{
    _id: string;
    count: number;
    total_stock: number;
    avg_stock: number;
  }>;
  most_used_products: Array<{
    name: string;
    category: string;
    total_used: number;
    current_stock: number;
  }>;
}

interface InventoryAlerts {
  low_stock_count: number;
  out_of_stock_count: number;
  needs_restock_count: number;
  low_stock_products: Product[];
  out_of_stock_products: Product[];
  needs_restock_products: Product[];
}

const categoryIcons: Record<string, string> = {
  pigments: 'color-palette',
  needles: 'medical',
  machines: 'hardware-chip',
  anesthetics: 'medical-outline',
  aftercare: 'heart',
  disposables: 'trash',
  equipment: 'construct',
  other: 'ellipsis-horizontal',
};

const categoryColors: Record<string, string> = {
  pigments: '#E879F9',
  needles: '#2DD4BF',
  machines: '#A855F7',
  anesthetics: '#F59E0B',
  aftercare: '#10B981',
  disposables: '#6B7280',
  equipment: '#EF4444',
  other: '#9CA3AF',
};

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [alerts, setAlerts] = useState<InventoryAlerts | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'alerts'>('list');

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      
      // Fetch products, stats, and alerts
      const [productsResponse, statsResponse, alertsResponse] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/inventory/products`),
        axios.get(`${BACKEND_URL}/api/inventory/stats`),
        axios.get(`${BACKEND_URL}/api/inventory/alerts`),
      ]);
      
      setProducts(productsResponse.data);
      setStats(statsResponse.data);
      setAlerts(alertsResponse.data);
    } catch (error) {
      console.error('Error fetching inventory data:', error);
      // Use mock data for demo
      setProducts(generateMockProducts());
      setStats(generateMockStats());
      setAlerts(generateMockAlerts());
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchInventoryData();
    setRefreshing(false);
  };

  const generateMockProducts = (): Product[] => [
    {
      id: '1',
      name: 'Dark Brown Pigment',
      brand: 'PhiBrows',
      category: 'pigments',
      unit: 'ml',
      current_stock: 15,
      min_stock_level: 5,
      max_stock_level: 50,
      cost_per_unit: 45,
      total_purchased: 25,
      total_used: 10,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Microblading Needles 18U',
      brand: 'Tinel',
      category: 'needles',
      unit: 'piece',
      current_stock: 2,
      min_stock_level: 10,
      max_stock_level: 100,
      cost_per_unit: 3.5,
      total_purchased: 50,
      total_used: 48,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '3',
      name: 'Numbing Cream',
      brand: 'Dr. Numb',
      category: 'anesthetics',
      unit: 'tube',
      current_stock: 8,
      min_stock_level: 3,
      max_stock_level: 20,
      cost_per_unit: 25,
      total_purchased: 12,
      total_used: 4,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '4',
      name: 'Healing Balm',
      brand: 'PMU Care',
      category: 'aftercare',
      unit: 'jar',
      current_stock: 12,
      min_stock_level: 5,
      max_stock_level: 30,
      cost_per_unit: 15,
      total_purchased: 20,
      total_used: 8,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const generateMockStats = (): InventoryStats => ({
    total_products: 24,
    total_inventory_value: 1850,
    low_stock_alerts: 3,
    category_breakdown: [
      { _id: 'pigments', count: 8, total_stock: 45, avg_stock: 5.6 },
      { _id: 'needles', count: 6, total_stock: 120, avg_stock: 20 },
      { _id: 'anesthetics', count: 4, total_stock: 15, avg_stock: 3.75 },
      { _id: 'aftercare', count: 3, total_stock: 25, avg_stock: 8.3 },
      { _id: 'equipment', count: 3, total_stock: 5, avg_stock: 1.7 },
    ],
    most_used_products: [
      { name: 'Microblading Needles 18U', category: 'needles', total_used: 48, current_stock: 2 },
      { name: 'Dark Brown Pigment', category: 'pigments', total_used: 10, current_stock: 15 },
      { name: 'Healing Balm', category: 'aftercare', total_used: 8, current_stock: 12 },
    ],
  });

  const generateMockAlerts = (): InventoryAlerts => ({
    low_stock_count: 3,
    out_of_stock_count: 0,
    needs_restock_count: 2,
    low_stock_products: [
      products.find(p => p.id === '2') || generateMockProducts()[1],
    ],
    out_of_stock_products: [],
    needs_restock_products: [],
  });

  const getFilteredProducts = () => {
    if (selectedCategory === 'all') return products;
    return products.filter(product => product.category === selectedCategory);
  };

  const getStockStatus = (product: Product) => {
    if (product.current_stock <= 0) return { status: 'out', color: '#EF4444' };
    if (product.current_stock <= product.min_stock_level) return { status: 'low', color: '#F59E0B' };
    if (product.current_stock >= product.max_stock_level * 0.8) return { status: 'good', color: '#10B981' };
    return { status: 'medium', color: '#2DD4BF' };
  };

  const renderStatsCards = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statsRow}>
        <View style={[styles.statCard, styles.totalCard]}>
          <Ionicons name="cube" size={24} color="#E879F9" />
          <Text style={styles.statNumber}>{stats?.total_products || 0}</Text>
          <Text style={styles.statLabel}>Products</Text>
        </View>
        
        <View style={[styles.statCard, styles.valueCard]}>
          <Ionicons name="cash" size={24} color="#10B981" />
          <Text style={styles.statNumber}>${stats?.total_inventory_value?.toLocaleString() || 0}</Text>
          <Text style={styles.statLabel}>Total Value</Text>
        </View>
      </View>
      
      <View style={[styles.statCard, styles.alertCard]}>
        <View style={styles.alertContent}>
          <Ionicons name="warning" size={28} color="#F59E0B" />
          <View style={styles.alertInfo}>
            <Text style={styles.alertNumber}>{stats?.low_stock_alerts || 0}</Text>
            <Text style={styles.alertLabel}>Low Stock Alerts</Text>
          </View>
          <TouchableOpacity 
            style={styles.viewAlertsButton}
            onPress={() => setViewMode(viewMode === 'alerts' ? 'list' : 'alerts')}
          >
            <Text style={styles.viewAlertsText}>
              {viewMode === 'alerts' ? 'View All' : 'View Alerts'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderCategoryFilter = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.categoryFilter}
      contentContainerStyle={styles.categoryFilterContent}
    >
      <TouchableOpacity
        style={[styles.categoryChip, selectedCategory === 'all' && styles.categoryChipActive]}
        onPress={() => setSelectedCategory('all')}
      >
        <Text style={[styles.categoryChipText, selectedCategory === 'all' && styles.categoryChipTextActive]}>
          All
        </Text>
      </TouchableOpacity>
      
      {stats?.category_breakdown?.map((category) => (
        <TouchableOpacity
          key={category._id}
          style={[styles.categoryChip, selectedCategory === category._id && styles.categoryChipActive]}
          onPress={() => setSelectedCategory(category._id)}
        >
          <Ionicons 
            name={categoryIcons[category._id] as any || 'ellipsis-horizontal'} 
            size={16} 
            color={selectedCategory === category._id ? '#FFFFFF' : categoryColors[category._id]} 
          />
          <Text style={[styles.categoryChipText, selectedCategory === category._id && styles.categoryChipTextActive]}>
            {category._id} ({category.count})
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderProductCard = ({ item: product }: { item: Product }) => {
    const stockStatus = getStockStatus(product);
    
    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => router.push(`/inventory/${product.id}`)}
      >
        <View style={styles.productHeader}>
          <View style={styles.productIcon}>
            <Ionicons 
              name={categoryIcons[product.category] as any || 'cube'} 
              size={24} 
              color={categoryColors[product.category] || '#9CA3AF'} 
            />
          </View>
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{product.name}</Text>
            {product.brand && (
              <Text style={styles.productBrand}>{product.brand}</Text>
            )}
            <Text style={styles.productCategory}>{product.category}</Text>
          </View>
          <View style={styles.productMeta}>
            <View style={[styles.stockBadge, { backgroundColor: stockStatus.color }]}>
              <Text style={styles.stockText}>{product.current_stock} {product.unit}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.productFooter}>
          <View style={styles.productStat}>
            <Text style={styles.statLabel}>Min Level</Text>
            <Text style={styles.statValue}>{product.min_stock_level}</Text>
          </View>
          <View style={styles.productStat}>
            <Text style={styles.statLabel}>Used</Text>
            <Text style={styles.statValue}>{product.total_used}</Text>
          </View>
          {product.cost_per_unit && (
            <View style={styles.productStat}>
              <Text style={styles.statLabel}>Cost</Text>
              <Text style={styles.statValue}>${product.cost_per_unit}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderAlertsView = () => (
    <View style={styles.alertsContainer}>
      {alerts?.low_stock_products && alerts.low_stock_products.length > 0 && (
        <View style={styles.alertSection}>
          <Text style={styles.alertSectionTitle}>Low Stock Products</Text>
          {alerts.low_stock_products.map((product) => (
            <View key={product.id} style={[styles.alertProductCard, styles.lowStockAlert]}>
              <Ionicons name="warning" size={20} color="#F59E0B" />
              <View style={styles.alertProductInfo}>
                <Text style={styles.alertProductName}>{product.name}</Text>
                <Text style={styles.alertProductDetails}>
                  {product.current_stock} {product.unit} left (min: {product.min_stock_level})
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.restockButton}
                onPress={() => router.push(`/inventory/${product.id}/restock`)}
              >
                <Text style={styles.restockButtonText}>Restock</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
      
      {alerts?.out_of_stock_products && alerts.out_of_stock_products.length > 0 && (
        <View style={styles.alertSection}>
          <Text style={styles.alertSectionTitle}>Out of Stock</Text>
          {alerts.out_of_stock_products.map((product) => (
            <View key={product.id} style={[styles.alertProductCard, styles.outOfStockAlert]}>
              <Ionicons name="close-circle" size={20} color="#EF4444" />
              <View style={styles.alertProductInfo}>
                <Text style={styles.alertProductName}>{product.name}</Text>
                <Text style={styles.alertProductDetails}>Out of stock</Text>
              </View>
              <TouchableOpacity 
                style={[styles.restockButton, styles.urgentButton]}
                onPress={() => router.push(`/inventory/${product.id}/restock`)}
              >
                <Text style={styles.restockButtonText}>Urgent</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
      
      {(!alerts?.low_stock_products?.length && !alerts?.out_of_stock_products?.length) && (
        <View style={styles.noAlertsContainer}>
          <Ionicons name="checkmark-circle" size={64} color="#10B981" />
          <Text style={styles.noAlertsTitle}>All Good!</Text>
          <Text style={styles.noAlertsDescription}>
            No stock alerts at the moment. Your inventory levels look healthy.
          </Text>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading inventory...</Text>
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
        <Text style={styles.headerTitle}>Inventory</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/inventory/add-product')}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
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
        
        {viewMode === 'list' ? (
          <>
            {renderCategoryFilter()}
            
            <View style={styles.productsSection}>
              <Text style={styles.sectionTitle}>Products ({getFilteredProducts().length})</Text>
              
              {getFilteredProducts().length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="cube-outline" size={64} color="#374151" />
                  <Text style={styles.emptyTitle}>No products found</Text>
                  <Text style={styles.emptyDescription}>
                    Add your first product to start managing inventory
                  </Text>
                  <TouchableOpacity 
                    style={styles.emptyButton}
                    onPress={() => router.push('/inventory/add-product')}
                  >
                    <Text style={styles.emptyButtonText}>Add Product</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <FlashList
                  data={getFilteredProducts()}
                  renderItem={renderProductCard}
                  keyExtractor={(item) => item.id}
                  estimatedItemSize={120}
                  showsVerticalScrollIndicator={false}
                  scrollEnabled={false}
                />
              )}
            </View>
            
            {/* Quick Actions */}
            <View style={styles.quickActions}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => router.push('/inventory/movements')}
              >
                <Ionicons name="swap-horizontal" size={24} color="#2DD4BF" />
                <Text style={styles.actionButtonText}>Stock Movements</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => router.push('/inventory/reports')}
              >
                <Ionicons name="bar-chart" size={24} color="#A855F7" />
                <Text style={styles.actionButtonText}>Reports</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          renderAlertsView()
        )}
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
    borderWidth: 1,
    borderColor: '#374151',
  },
  totalCard: {
    flex: 0.48,
    alignItems: 'center',
  },
  valueCard: {
    flex: 0.48,
    alignItems: 'center',
  },
  alertCard: {
    marginBottom: 16,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  alertContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertInfo: {
    flex: 1,
    marginLeft: 16,
  },
  alertNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F59E0B',
  },
  alertLabel: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  viewAlertsButton: {
    backgroundColor: '#F59E0B',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  viewAlertsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  categoryFilter: {
    marginTop: 20,
    marginBottom: 16,
  },
  categoryFilterContent: {
    paddingHorizontal: 20,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F1F1F',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  categoryChipActive: {
    backgroundColor: '#E879F9',
    borderColor: '#E879F9',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginLeft: 6,
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  productsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  productCard: {
    backgroundColor: '#1F1F1F',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  productIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#111111',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  productBrand: {
    fontSize: 12,
    color: '#2DD4BF',
    marginBottom: 2,
  },
  productCategory: {
    fontSize: 12,
    color: '#9CA3AF',
    textTransform: 'capitalize',
  },
  productMeta: {
    alignItems: 'flex-end',
  },
  stockBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  stockText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  productStat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 2,
  },
  alertsContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  alertSection: {
    marginBottom: 24,
  },
  alertSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  alertProductCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
  },
  lowStockAlert: {
    borderColor: '#F59E0B',
  },
  outOfStockAlert: {
    borderColor: '#EF4444',
  },
  alertProductInfo: {
    flex: 1,
    marginLeft: 12,
  },
  alertProductName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  alertProductDetails: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  restockButton: {
    backgroundColor: '#F59E0B',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  urgentButton: {
    backgroundColor: '#EF4444',
  },
  restockButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  noAlertsContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  noAlertsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#10B981',
    marginTop: 16,
    marginBottom: 8,
  },
  noAlertsDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#E879F9',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
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