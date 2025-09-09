import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface UserProfile {
  email: string;
  username: string;
  role: 'standard' | 'premium' | 'executive';
  subscription_plan: string;
  subscription_status: string;
}

export default function Settings() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [language, setLanguage] = useState('es');
  const [accentColor, setAccentColor] = useState('#E879F9');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Cargar configuraciones guardadas
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('app_language') || 'es';
      const savedAccentColor = localStorage.getItem('app_accent_color') || '#E879F9';
      
      setLanguage(savedLanguage);
      setAccentColor(savedAccentColor);
    }

    // Simular datos del usuario - en producción sería desde una API
    setUser({
      email: 'executive@test.com',
      username: 'Executive User',
      role: 'executive',
      subscription_plan: 'Executive Monthly',
      subscription_status: 'active'
    });
  }, []);

  // Auto-guardar cuando cambia el idioma
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('app_language', language);
      
      // Mostrar feedback visual
      setLoading(true);
      setTimeout(() => setLoading(false), 500);
    }
  }, [language]);

  // Auto-guardar cuando cambia el color
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('app_accent_color', accentColor);
      
      // Aplicar el color inmediatamente al documento
      document.documentElement.style.setProperty('--accent-color', accentColor);
      
      // Mostrar feedback visual
      setLoading(true);
      setTimeout(() => setLoading(false), 500);
    }
  }, [accentColor]);

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Cerrar Sesión', 
          style: 'destructive',
          onPress: () => {
            // Limpiar datos locales
            if (typeof window !== 'undefined') {
              localStorage.clear();
              // Forzar recarga completa al login
              window.location.replace(window.location.origin + '/login.html');
            } else {
              // Fallback para móvil
              router.replace('/');
            }
          }
        }
      ]
    );
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      'Cancelar Suscripción',
      '¿Estás seguro que deseas cancelar tu suscripción? Perderás acceso a las funciones premium.',
      [
        { text: 'No, mantener', style: 'cancel' },
        { 
          text: 'Sí, cancelar', 
          style: 'destructive',
          onPress: () => {
            // En producción: llamar API de Stripe para cancelar
            Alert.alert('Éxito', 'Tu suscripción ha sido cancelada. Tendrás acceso hasta el final del período actual.');
          }
        }
      ]
    );
  };

  const handleChangeSubscription = () => {
    router.push('/subscribe');
  };

  const languages = [
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'pt', name: 'Português', flag: '🇧🇷' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' }
  ];

  const accentColors = [
    { name: 'Rosa PMU', color: '#E879F9' },
    { name: 'Verde Esmeralda', color: '#10B981' },
    { name: 'Azul Cielo', color: '#3B82F6' },
    { name: 'Púrpura', color: '#8B5CF6' },
    { name: 'Coral', color: '#F97316' }
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'executive': return '#DC2626';
      case 'premium': return '#7C3AED';
      case 'standard': return '#059669';
      default: return '#6B7280';
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'executive': return 'Executive';
      case 'premium': return 'Premium';
      case 'standard': return 'Standard';
      default: return 'Standard';
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando configuración...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mi Cuenta</Text>
        <View style={styles.headerRight}>
          {loading && (
            <View style={styles.savingIndicator}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.savingText}>Guardado</Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Profile Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-outline" size={24} color={accentColor} />
            <Text style={styles.sectionTitle}>Perfil</Text>
          </View>
          
          <View style={styles.profileCard}>
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{user.username}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              <View style={[styles.roleBadge, { backgroundColor: getRoleColor(user.role) }]}>
                <Text style={styles.roleText}>{getRoleName(user.role)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Subscription Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="card-outline" size={24} color={accentColor} />
            <Text style={styles.sectionTitle}>Suscripción</Text>
          </View>
          
          <View style={styles.card}>
            <View style={styles.subscriptionInfo}>
              <Text style={styles.subscriptionPlan}>{user.subscription_plan}</Text>
              <Text style={styles.subscriptionStatus}>
                Estado: <Text style={styles.activeStatus}>Activa</Text>
              </Text>
            </View>
            
            <View style={styles.subscriptionActions}>
              <TouchableOpacity style={styles.actionButton} onPress={handleChangeSubscription}>
                <Ionicons name="refresh-outline" size={20} color={accentColor} />
                <Text style={styles.actionButtonText}>Cambiar Plan</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.dangerButton]} 
                onPress={handleCancelSubscription}
              >
                <Ionicons name="close-outline" size={20} color="#DC2626" />
                <Text style={[styles.actionButtonText, styles.dangerText]}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Language Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="language-outline" size={24} color={accentColor} />
            <Text style={styles.sectionTitle}>Idioma</Text>
          </View>
          
          <View style={styles.card}>
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.languageOption,
                  language === lang.code && styles.selectedOption
                ]}
                onPress={() => setLanguage(lang.code)}
              >
                <Text style={styles.languageFlag}>{lang.flag}</Text>
                <Text style={styles.languageName}>{lang.name}</Text>
                {language === lang.code && (
                  <Ionicons name="checkmark" size={20} color={accentColor} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Accent Color Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="color-palette-outline" size={24} color={accentColor} />
            <Text style={styles.sectionTitle}>Color de Acento</Text>
          </View>
          
          <View style={styles.card}>
            <View style={styles.colorGrid}>
              {accentColors.map((colorOption) => (
                <TouchableOpacity
                  key={colorOption.color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: colorOption.color },
                    accentColor === colorOption.color && styles.selectedColor
                  ]}
                  onPress={() => setAccentColor(colorOption.color)}
                >
                  {accentColor === colorOption.color && (
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.colorName}>
              {accentColors.find(c => c.color === accentColor)?.name}
            </Text>
          </View>
        </View>

        {/* Logout Section */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#DC2626" />
            <Text style={styles.logoutText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <View style={styles.appInfo}>
            <Text style={styles.appName}>PMU Studio</Text>
            <Text style={styles.appVersion}>Versión 2.0.0</Text>
            <Text style={styles.appSlogan}>Professional Micropigmentation</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F23',
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#1E1B4B',
    borderBottomWidth: 1,
    borderBottomColor: '#312E81',
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  headerRight: {
    width: 100,
    alignItems: 'flex-end',
  },
  savingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  savingText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#1E1B4B',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#312E81',
  },
  profileCard: {
    backgroundColor: '#1E1B4B',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#312E81',
  },
  profileInfo: {
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  userEmail: {
    color: '#9CA3AF',
    fontSize: 16,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginTop: 8,
  },
  roleText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  subscriptionInfo: {
    marginBottom: 16,
  },
  subscriptionPlan: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  subscriptionStatus: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  activeStatus: {
    color: '#10B981',
    fontWeight: '600',
  },
  subscriptionActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    gap: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  dangerButton: {
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
  },
  dangerText: {
    color: '#DC2626',
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    gap: 12,
  },
  selectedOption: {
    backgroundColor: 'rgba(232, 121, 249, 0.1)',
  },
  languageFlag: {
    fontSize: 20,
  },
  languageName: {
    color: '#FFFFFF',
    fontSize: 16,
    flex: 1,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedColor: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  colorName: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    borderWidth: 1,
    borderColor: '#DC2626',
    gap: 12,
  },
  logoutText: {
    color: '#DC2626',
    fontSize: 16,
    fontWeight: '600',
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 4,
  },
  appName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  appVersion: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  appSlogan: {
    color: '#E879F9',
    fontSize: 12,
    fontStyle: 'italic',
  },
});