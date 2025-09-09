import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
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

export default function LoginScreen() {
  const [form, setForm] = useState<LoginForm>({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      Alert.alert('Error', 'Por favor, completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('username', form.email);
      formData.append('password', form.password);

      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        // Store tokens securely (in a real app, use SecureStore)
        // For now, we'll just navigate to the main app
        Alert.alert('¡Éxito!', `Bienvenido ${data.user.username}`, [
          {
            text: 'Continuar',
            onPress: () => router.replace('/dashboard')
          }
        ]);
      } else {
        Alert.alert('Error', data.detail || 'Credenciales inválidas');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo conectar con el servidor');
    } finally {
      setLoading(false);
    }
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
          </View>

          {/* Login Form */}
          <View style={styles.formContainer}>
            <Text style={styles.title}>Inicia Sesión</Text>
            <Text style={styles.subtitle}>Accede a tu cuenta profesional</Text>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#6B7280"
                value={form.email}
                onChangeText={(text) => setForm({ ...form, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Contraseña"
                placeholderTextColor="#6B7280"
                value={form.password}
                onChangeText={(text) => setForm({ ...form, password: text })}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons 
                  name={showPassword ? "eye-outline" : "eye-off-outline"} 
                  size={20} 
                  color="#9CA3AF" 
                />
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity 
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
                  <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>

            {/* Register Link */}
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>¿No tienes cuenta? </Text>
              <TouchableOpacity onPress={navigateToRegister}>
                <Text style={styles.registerLink}>Regístrate aquí</Text>
              </TouchableOpacity>
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
    paddingTop: 40,
    paddingBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: 2,
  },
  slogan: {
    fontSize: 16,
    color: '#FFFFFF',
    fontStyle: 'italic',
    opacity: 0.9,
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
  testAccountsContainer: {
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#374151',
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
});