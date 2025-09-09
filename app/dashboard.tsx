import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface UserData {
  role: 'standard' | 'premium' | 'executive';
  subscription_plan?: string;
  username?: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<UserData | null>(null);
  
  // Get user role from URL params or storage
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const userRole = urlParams.get('role') as 'standard' | 'premium' | 'executive';
    
    if (userRole) {
      setUser({ role: userRole });
    } else {
      // Default to standard if no role specified
      setUser({ role: 'standard' });
    }
  }, []);

  const getAvailableModules = (role: string) => {
    const allModules = [
      {
        id: 'clients',
        title: 'Client Management',
        description: 'Gestión completa de clientes',
        icon: 'people',
        color: '#E879F9',
        route: 'clients',
        requiredRole: 'standard'
      },
      {
        id: 'appointments',
        title: 'Appointments',
        description: 'Calendario y citas',
        icon: 'calendar',
        color: '#10B981',
        route: 'appointments',
        requiredRole: 'standard'
      },
      {
        id: 'notifications',
        title: 'Notifications',
        description: 'Notificaciones y recordatorios',
        icon: 'notifications',
        color: '#F59E0B',
        route: 'notifications',
        requiredRole: 'standard'
      },
      {
        id: 'finance',
        title: 'Finance Dashboard',
        description: 'Ingresos, gastos y análisis',
        icon: 'analytics',
        color: '#8B5CF6',
        route: 'finance',
        requiredRole: 'premium'
      },
      {
        id: 'inventory',
        title: 'Inventory Management',
        description: 'Control de productos y stock',
        icon: 'cube',
        color: '#06B6D4',
        route: 'inventory',
        requiredRole: 'premium'
      },
      {
        id: 'ai-design',
        title: 'AI Design Tools',
        description: 'Análisis de simetría y color con IA',
        icon: 'sparkles',
        color: '#EC4899',
        route: 'ai-design',
        requiredRole: 'executive'
      }
    ];

    const roleHierarchy = {
      'standard': ['standard'],
      'premium': ['standard', 'premium'],
      'executive': ['standard', 'premium', 'executive']
    };

    return allModules.filter(module => 
      roleHierarchy[role]?.includes(module.requiredRole)
    );
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'standard': return 'Standard';
      case 'premium': return 'Premium';
      case 'executive': return 'Executive';
      default: return 'Standard';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'standard': return '#10B981';
      case 'premium': return '#8B5CF6';
      case 'executive': return '#EC4899';
      default: return '#10B981';
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const availableModules = getAvailableModules(user.role);

  const navigateToModule = (route: string) => {
    router.push(`/${route}` as const);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header with Logo and Role Badge */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image
            source={{ uri: 'https://customer-assets.emergentagent.com/job_beauty-tech-3/artifacts/h8yumqj0_20190719_015613816_iOS-03%20%281%29.png' }}
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={styles.brandInfo}>
            <Text style={styles.appName}>PMU STUDIO PRO</Text>
            <Text style={styles.slogan}>Professional Micropigmentation</Text>
          </View>
        </View>
        
        {/* Header Actions */}
        <View style={styles.headerActions}>
          <View style={[styles.roleBadge, { backgroundColor: getRoleColor(user.role) }]}>
            <Text style={styles.roleText}>{getRoleName(user.role)}</Text>
          </View>
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={() => router.push('/settings')}
          >
            <Ionicons name="settings-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="people" size={24} color="#E879F9" />
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Clients</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="calendar" size={24} color="#2DD4BF" />
            <Text style={styles.statNumber}>5</Text>
            <Text style={styles.statLabel}>Today</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="trending-up" size={24} color="#A855F7" />
            <Text style={styles.statNumber}>$2,450</Text>
            <Text style={styles.statLabel}>This Week</Text>
          </View>
        </View>

        {/* Main Modules */}
        <View style={styles.modulesContainer}>
          <Text style={styles.sectionTitle}>
            Available Modules - {getRoleName(user.role)} Plan
          </Text>
          
          {availableModules.map((module, index) => (
            <TouchableOpacity 
              key={module.id}
              style={[
                styles.moduleCard, 
                index === 0 ? styles.primaryModule : styles.secondaryModule
              ]}
              onPress={() => navigateToModule(module.route)}
            >
              <View style={styles.moduleHeader}>
                <Ionicons 
                  name={module.icon as any} 
                  size={32} 
                  color={index === 0 ? "#FFFFFF" : module.color} 
                />
                <View style={styles.moduleInfo}>
                  <Text style={[
                    styles.moduleTitle, 
                    index === 0 ? {} : styles.darkText
                  ]}>
                    {module.title}
                  </Text>
                  <Text style={[
                    styles.moduleDescription, 
                    index === 0 ? {} : styles.darkText
                  ]}>
                    {module.description}
                  </Text>
                </View>
                <Ionicons 
                  name="chevron-forward" 
                  size={20} 
                  color={index === 0 ? "#FFFFFF" : module.color} 
                />
              </View>
            </TouchableOpacity>
          ))}

          {/* Role Information */}
          <View style={styles.roleInfoContainer}>
            <View style={styles.roleInfoCard}>
              <Ionicons name="information-circle" size={24} color={getRoleColor(user.role)} />
              <Text style={styles.roleInfoTitle}>Plan: {getRoleName(user.role)}</Text>
              <Text style={styles.roleInfoDescription}>
                {user.role === 'standard' && 'Acceso a funciones básicas de gestión'}
                {user.role === 'premium' && 'Incluye análisis financiero e inventario'}
                {user.role === 'executive' && 'Acceso completo con herramientas de IA'}
              </Text>
              {user.role !== 'executive' && (
                <TouchableOpacity style={styles.upgradeButton}>
                  <Text style={styles.upgradeButtonText}>
                    Upgrade to {user.role === 'standard' ? 'Premium' : 'Executive'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerLogoContainer}>
          <Image
            source={{ uri: 'https://customer-assets.emergentagent.com/job_beauty-tech-3/artifacts/lcnktjq9_20190719_015613816_iOS-03%20%282%29.png' }}
            style={styles.footerMainLogo}
            resizeMode="contain"
          />
        </View>
        <View style={styles.footerContent}>
          <Text style={styles.copyright}>© 2025 Chic Harmony – v1.0</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
  header: {
    padding: 24,
    paddingTop: 16,
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  logo: {
    width: 200,
    height: 80,
    marginRight: 16,
  },
  brandInfo: {
    alignItems: 'center',
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
    letterSpacing: 2,
  },
  subBrand: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E879F9',
    marginBottom: 4,
    textAlign: 'center',
    letterSpacing: 1,
  },
  slogan: {
    fontSize: 14,
    color: '#FFFFFF',
    fontStyle: 'italic',
    textAlign: 'center',
    opacity: 0.9,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  statCard: {
    backgroundColor: '#1F1F1F',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  modulesContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  moduleCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  primaryModule: {
    background: 'linear-gradient(135deg, #E879F9 0%, #A855F7 100%)',
    backgroundColor: '#A855F7',
  },
  secondaryModule: {
    backgroundColor: '#1F1F1F',
    borderWidth: 1,
    borderColor: '#374151',
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moduleInfo: {
    flex: 1,
    marginLeft: 16,
  },
  moduleTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  moduleDescription: {
    fontSize: 14,
    color: '#D1D5DB',
  },
  darkText: {
    color: '#FFFFFF',
  },
  completionContainer: {
    marginTop: 24,
  },
  completionCard: {
    backgroundColor: '#1F1F1F',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#10B981',
  },
  completionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#10B981',
    marginTop: 16,
    marginBottom: 8,
  },
  completionDescription: {
    fontSize: 14,
    color: '#D1D5DB',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  featureHighlights: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111111',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 4,
  },
  highlightText: {
    fontSize: 12,
    color: '#D1D5DB',
    marginLeft: 6,
    fontWeight: '500',
  },

  footer: {
    backgroundColor: '#1F1F1F',
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  footerLogoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  footerMainLogo: {
    width: 150,
    height: 40,
    marginBottom: 8,
  },
  footerBrandText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E879F9',
    fontStyle: 'italic',
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyright: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
    marginRight: 12,
  },
  footerAccentLogo: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  
  // New styles for role-based dashboard
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
  },
  roleText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  roleInfoContainer: {
    marginTop: 24,
  },
  roleInfoCard: {
    backgroundColor: '#1F1F1F',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  roleInfoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 12,
    marginBottom: 8,
  },
  roleInfoDescription: {
    fontSize: 14,
    color: '#D1D5DB',
    textAlign: 'center',
    marginBottom: 16,
  },
  upgradeButton: {
    backgroundColor: '#E879F9',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  upgradeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});