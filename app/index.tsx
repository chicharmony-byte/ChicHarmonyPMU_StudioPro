import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  Pressable, 
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface LoginForm {
  email: string;
  password: string;
}

export default function WelcomeScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState<LoginForm>({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    // For immediate testing/demo, skip actual login and go directly to dashboard
    window.location.href = '/dashboard';
    return;

    // Original login code (working backend, will be re-enabled):
    /*
    if (!form.email || !form.password) {
      Alert.alert('Error', 'Por favor, completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://pmu-dashboard.preview.emergentagent.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `username=${encodeURIComponent(form.email)}&password=${encodeURIComponent(form.password)}`
      });

      const data = await response.json();
      
      if (response.ok) {
        window.location.href = '/dashboard';
      } else {
        Alert.alert('Error de Login', `Status: ${response.status}\nError: ${data.detail || 'Credenciales inválidas'}`);
      }
    } catch (error) {
      Alert.alert('Error de Conexión', `Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
    */
  };

  const navigateToRegister = () => {
    router.push('/auth/register');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Image
              source={{ uri: 'https://customer-assets.emergentagent.com/job_artistry-suite/artifacts/ffakmkmk_flor%20sola.png' }}
              style={styles.logo}
            />
            <Text style={styles.appName}>PMU STUDIO</Text>
            <Text style={styles.slogan}>Professional Micropigmentation</Text>
            <Text style={styles.welcome}>Gestiona tu negocio de micropigmentación</Text>
          </View>

          {/* Server-Side Login Form */}
          <View style={styles.formContainer}>
            <Text style={styles.title}>Bienvenido</Text>
            <Text style={styles.subtitle}>Inicia sesión para acceder a tu cuenta</Text>

            <form 
              action="https://pmu-dashboard.preview.emergentagent.com/api/auth/login" 
              method="POST"
              style={{ width: '100%' }}
            >
              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                <input
                  name="username"
                  type="email"
                  placeholder="Email"
                  required
                  style={{
                    flex: 1,
                    color: '#FFFFFF',
                    fontSize: '16px',
                    paddingTop: '16px',
                    paddingBottom: '16px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    outline: 'none'
                  }}
                />
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                <input
                  name="password"
                  type="password"
                  placeholder="Contraseña"
                  required
                  style={{
                    flex: 1,
                    color: '#FFFFFF',
                    fontSize: '16px',
                    paddingTop: '16px',
                    paddingBottom: '16px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    outline: 'none'
                  }}
                />
              </View>

              {/* Login Button - HTML Submit */}
              <button 
                type="submit"
                style={{
                  width: '100%',
                  backgroundColor: '#E879F9',
                  border: 'none',
                  borderRadius: '12px',
                  paddingTop: '16px',
                  paddingBottom: '16px',
                  paddingLeft: '20px',
                  paddingRight: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  marginTop: '8px',
                  marginBottom: '24px',
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#FFFFFF'
                }}
              >
                Iniciar Sesión →
              </button>
            </form>

            {/* Register Link */}
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>¿No tienes cuenta? </Text>
              <TouchableOpacity onPress={navigateToRegister}>
                <Text style={styles.registerLink}>Regístrate aquí</Text>
              </TouchableOpacity>
            </View>

            {/* Subscription Plans Preview */}
            <View style={styles.plansContainer}>
              <Text style={styles.plansTitle}>Planes Disponibles:</Text>
              
              <View style={styles.planCard}>
                <View style={styles.planHeader}>
                  <Text style={styles.planName}>Standard</Text>
                  <Text style={styles.planPrice}>$35/mes</Text>
                </View>
                <Text style={styles.planFeatures}>✓ Gestión de clientes • ✓ Citas • ✓ Notificaciones</Text>
              </View>

              <View style={styles.planCard}>
                <View style={styles.planHeader}>
                  <Text style={styles.planName}>Premium</Text>
                  <Text style={styles.planPrice}>$65/mes</Text>
                </View>
                <Text style={styles.planFeatures}>Standard + ✓ Finanzas • ✓ Inventario</Text>
              </View>

              <View style={[styles.planCard, styles.planCardPopular]}>
                <View style={styles.planHeader}>
                  <Text style={styles.planName}>Executive</Text>
                  <Text style={styles.planPrice}>$120/mes</Text>
                </View>
                <Text style={styles.planFeatures}>Todo + ✓ Herramientas IA • ✓ Análisis avanzado</Text>
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>MÁS POPULAR</Text>
                </View>
              </View>
            </View>

            {/* Test Accounts Info */}
            <View style={styles.testAccountsContainer}>
              <Text style={styles.testAccountsTitle}>Cuentas de Prueba:</Text>
              <View style={styles.testAccount}>
                <Text style={styles.testAccountRole}>Standard:</Text>
                <Text style={styles.testAccountEmail}>standard@test.com | pass123</Text>
              </View>
              <View style={styles.testAccount}>
                <Text style={styles.testAccountRole}>Premium:</Text>
                <Text style={styles.testAccountEmail}>premium@test.com | pass123</Text>
              </View>
              <View style={styles.testAccount}>
                <Text style={styles.testAccountRole}>Executive:</Text>
                <Text style={styles.testAccountEmail}>executive@test.com | pass123</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerLogoContainer}>
          <Image
            source={{ uri: 'https://customer-assets.emergentagent.com/job_artistry-suite/artifacts/ffakmkmk_flor%20sola.png' }}
            style={styles.footerMainLogo}
          />
          <Text style={styles.footerBrandText}>Chic Harmony</Text>
        </View>
        <View style={styles.footerContent}>
          <Text style={styles.copyright}>© 2025 Chic Harmony – v1.0</Text>
          <Image
            source={{ uri: 'https://customer-assets.emergentagent.com/job_artistry-suite/artifacts/ffakmkmk_flor%20sola.png' }}
            style={styles.footerAccentLogo}
          />
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
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: 3,
  },
  slogan: {
    fontSize: 18,
    color: '#FFFFFF',
    fontStyle: 'italic',
    opacity: 0.9,
    marginBottom: 8,
  },
  welcome: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
  },
  formContainer: {
    flex: 1,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    paddingVertical: 16,
  },
  eyeIcon: {
    padding: 4,
  },
  loginButton: {
    backgroundColor: '#E879F9',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  registerText: {
    color: '#9CA3AF',
    fontSize: 16,
  },
  registerLink: {
    color: '#E879F9',
    fontSize: 16,
    fontWeight: '600',
  },
  plansContainer: {
    backgroundColor: '#1F1F1F',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#374151',
  },
  plansTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  planCard: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#374151',
    position: 'relative',
  },
  planCardPopular: {
    borderColor: '#E879F9',
    borderWidth: 2,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  planPrice: {
    color: '#E879F9',
    fontSize: 16,
    fontWeight: 'bold',
  },
  planFeatures: {
    color: '#9CA3AF',
    fontSize: 12,
    lineHeight: 16,
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    right: 12,
    backgroundColor: '#E879F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  popularText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  testAccountsContainer: {
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#374151',
    marginBottom: 20,
  },
  testAccountsTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  testAccount: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  testAccountRole: {
    color: '#E879F9',
    fontSize: 12,
    fontWeight: '600',
    width: 70,
  },
  testAccountEmail: {
    color: '#9CA3AF',
    fontSize: 12,
    flex: 1,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
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
  loginButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});