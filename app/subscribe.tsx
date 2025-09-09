import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface Plan {
  id: string;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  features: string[];
  popular?: boolean;
  color: string;
}

const plans: Plan[] = [
  {
    id: 'standard',
    name: 'Standard',
    monthlyPrice: 35,
    annualPrice: 350,
    features: [
      'Gestión completa de clientes',
      'Sistema de citas y calendario',
      'Notificaciones y recordatorios'
    ],
    color: '#10B981'
  },
  {
    id: 'premium',
    name: 'Premium',
    monthlyPrice: 65,
    annualPrice: 650,
    features: [
      'Todo lo de Standard',
      'Dashboard financiero completo',
      'Gestión de inventario',
      'Reportes y análisis'
    ],
    popular: true,
    color: '#8B5CF6'
  },
  {
    id: 'executive',
    name: 'Executive',
    monthlyPrice: 120,
    annualPrice: 1200,
    features: [
      'Todo lo de Premium',
      'Herramientas IA avanzadas',
      'Análisis de simetría facial',
      'Recomendador de pigmentos',
      'Soporte prioritario'
    ],
    color: '#EC4899'
  }
];

export default function SubscribeScreen() {
  const [selectedPlan, setSelectedPlan] = useState<string>('premium');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [loading, setLoading] = useState(false);
  const [stripeConfig, setStripeConfig] = useState<any>(null);

  useEffect(() => {
    loadStripeConfig();
  }, []);

  const loadStripeConfig = async () => {
    try {
      const response = await fetch('https://pmu-dashboard.preview.emergentagent.com/api/subscriptions/config');
      const config = await response.json();
      setStripeConfig(config);
    } catch (error) {
      console.error('Error loading Stripe config:', error);
    }
  };

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
  };

  const getCurrentPrice = (plan: Plan) => {
    return billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
  };

  const getAnnualSavings = (plan: Plan) => {
    const monthlyTotal = plan.monthlyPrice * 12;
    const annualPrice = plan.annualPrice;
    return monthlyTotal - annualPrice;
  };

  const handleSubscribe = async () => {
    if (!selectedPlan) {
      Alert.alert('Error', 'Por favor selecciona un plan');
      return;
    }

    setLoading(true);
    try {
      // Create payment form
      const plan = plans.find(p => p.id === selectedPlan);
      if (!plan) return;

      const price = getCurrentPrice(plan);
      const planName = `${plan.name} ${billingCycle === 'monthly' ? 'Mensual' : 'Anual'}`;

      Alert.alert(
        'Proceder con el pago',
        `Plan: ${planName}\nPrecio: $${price} USD\n\n¿Continuar con Stripe?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Continuar',
            onPress: () => {
              // In a real app, this would open Stripe Checkout
              Alert.alert(
                '🚧 Demo Mode',
                'En producción, aquí se abriría Stripe Checkout para procesar el pago de forma segura.',
                [
                  {
                    text: 'Simular Pago Exitoso',
                    onPress: () => {
                      Alert.alert('✅ Pago Exitoso', 'Suscripción activada correctamente. Bienvenido a PMU Studio!', [
                        {
                          text: 'Ir al Dashboard',
                          onPress: () => router.replace(`/dashboard?role=${selectedPlan}`)
                        }
                      ]);
                    }
                  },
                  { text: 'Cancelar', style: 'cancel' }
                ]
              );
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo procesar la suscripción');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Image
            source={{ uri: 'https://customer-assets.emergentagent.com/job_artistry-suite/artifacts/ffakmkmk_flor%20sola.png' }}
            style={styles.logo}
          />
          <Text style={styles.title}>Elegir Plan</Text>
          <Text style={styles.subtitle}>Selecciona el plan perfecto para tu negocio</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Billing Cycle Toggle */}
        <View style={styles.billingToggle}>
          <TouchableOpacity
            style={[styles.toggleButton, billingCycle === 'monthly' && styles.toggleActive]}
            onPress={() => setBillingCycle('monthly')}
          >
            <Text style={[styles.toggleText, billingCycle === 'monthly' && styles.toggleTextActive]}>
              Mensual
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, billingCycle === 'annual' && styles.toggleActive]}
            onPress={() => setBillingCycle('annual')}
          >
            <Text style={[styles.toggleText, billingCycle === 'annual' && styles.toggleTextActive]}>
              Anual
            </Text>
          </TouchableOpacity>
        </View>

        {billingCycle === 'annual' && (
          <Text style={styles.savingsText}>💰 Ahorra hasta $240 USD al año</Text>
        )}

        {/* Plans */}
        <View style={styles.plansContainer}>
          {plans.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.planCard,
                selectedPlan === plan.id && styles.planCardSelected,
                plan.popular && styles.planCardPopular
              ]}
              onPress={() => handleSelectPlan(plan.id)}
            >
              {plan.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>MÁS POPULAR</Text>
                </View>
              )}

              <View style={styles.planHeader}>
                <View style={[styles.planIcon, { backgroundColor: plan.color }]}>
                  <Ionicons name="business" size={24} color="#FFFFFF" />
                </View>
                <View style={styles.planInfo}>
                  <Text style={styles.planName}>{plan.name}</Text>
                  <View style={styles.priceContainer}>
                    <Text style={styles.planPrice}>
                      ${getCurrentPrice(plan)}
                    </Text>
                    <Text style={styles.pricePeriod}>
                      /{billingCycle === 'monthly' ? 'mes' : 'año'}
                    </Text>
                  </View>
                  {billingCycle === 'annual' && (
                    <Text style={styles.savingsAmount}>
                      Ahorras ${getAnnualSavings(plan)}
                    </Text>
                  )}
                </View>
                <View style={styles.selectIndicator}>
                  {selectedPlan === plan.id ? (
                    <Ionicons name="radio-button-on" size={24} color="#E879F9" />
                  ) : (
                    <Ionicons name="radio-button-off" size={24} color="#9CA3AF" />
                  )}
                </View>
              </View>

              <View style={styles.featuresContainer}>
                {plan.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={16} color={plan.color} />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Payment Security */}
        <View style={styles.securityInfo}>
          <Ionicons name="shield-checkmark" size={24} color="#10B981" />
          <View style={styles.securityText}>
            <Text style={styles.securityTitle}>Pago 100% Seguro</Text>
            <Text style={styles.securityDescription}>
              Procesado por Stripe. Tus datos están protegidos con encriptación de nivel bancario.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Subscribe Button */}
      <View style={styles.subscribeContainer}>
        <TouchableOpacity
          style={[styles.subscribeButton, loading && styles.subscribeButtonDisabled]}
          onPress={handleSubscribe}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.subscribeButtonText}>
                Suscribirse por ${getCurrentPrice(plans.find(p => p.id === selectedPlan)!)}
                {billingCycle === 'monthly' ? '/mes' : '/año'}
              </Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>
        <Text style={styles.subscribeNote}>
          Cancela en cualquier momento. Sin compromisos.
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2025 Chic Harmony – PMU Studio</Text>
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
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 24,
    top: 24,
    zIndex: 1,
  },
  headerContent: {
    alignItems: 'center',
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  billingToggle: {
    flexDirection: 'row',
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleActive: {
    backgroundColor: '#E879F9',
  },
  toggleText: {
    color: '#9CA3AF',
    fontSize: 16,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  savingsText: {
    textAlign: 'center',
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 24,
  },
  plansContainer: {
    marginBottom: 32,
  },
  planCard: {
    backgroundColor: '#1F1F1F',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#374151',
    position: 'relative',
  },
  planCardSelected: {
    borderColor: '#E879F9',
  },
  planCardPopular: {
    borderColor: '#8B5CF6',
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    right: 20,
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  planIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  planPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E879F9',
  },
  pricePeriod: {
    fontSize: 16,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  savingsAmount: {
    fontSize: 12,
    color: '#10B981',
    marginTop: 2,
  },
  selectIndicator: {
    marginLeft: 12,
  },
  featuresContainer: {
    marginTop: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  securityInfo: {
    flexDirection: 'row',
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  securityText: {
    marginLeft: 12,
    flex: 1,
  },
  securityTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  securityDescription: {
    color: '#9CA3AF',
    fontSize: 12,
    lineHeight: 16,
  },
  subscribeContainer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
  },
  subscribeButton: {
    backgroundColor: '#E879F9',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  subscribeButtonDisabled: {
    opacity: 0.7,
  },
  subscribeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  subscribeNote: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 12,
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  footerText: {
    color: '#6B7280',
    fontSize: 10,
  },
});