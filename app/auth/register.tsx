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

interface RegisterForm {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  role: 'standard' | 'premium' | 'executive';
}

export default function RegisterScreen() {
  const [form, setForm] = useState<RegisterForm>({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: 'standard'
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showRolePicker, setShowRolePicker] = useState(false);

  const handleRegister = async () => {
    if (!form.email || !form.username || !form.password || !form.confirmPassword) {
      Alert.alert('Error', 'Por favor, completa todos los campos');
      return;
    }

    if (form.password !== form.confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    if (form.password.length < 8) {
      Alert.alert('Error', 'La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: form.email,
          username: form.username,
          password: form.password,
          confirm_password: form.confirmPassword,
          role: form.role
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert(
          '¡Registro Exitoso!', 
          `Cuenta creada como ${data.role}. Ahora puedes iniciar sesión.`, 
          [
            {
              text: 'Ir a Login',
              onPress: () => router.replace('/auth/login')
            }
          ]
        );
      } else {
        Alert.alert('Error', data.detail || 'Error en el registro');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const navigateToLogin = () => {
    router.push('/auth/login');
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'standard':
        return 'Acceso básico: Clientes, Citas, Notificaciones ($35/mes)';
      case 'premium':
        return 'Acceso extendido: + Finanzas e Inventario ($65/mes)';
      case 'executive':
        return 'Acceso completo: + Herramientas AI ($120/mes)';
      default:
        return '';
    }
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

          {/* Register Form */}
          <View style={styles.formContainer}>
            <Text style={styles.title}>Crear Cuenta</Text>
            <Text style={styles.subtitle}>Únete a la comunidad profesional</Text>

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

            {/* Username Input */}
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nombre de usuario"
                placeholderTextColor="#6B7280"
                value={form.username}
                onChangeText={(text) => setForm({ ...form, username: text })}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Contraseña (mín. 8 caracteres)"
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

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirmar contraseña"
                placeholderTextColor="#6B7280"
                value={form.confirmPassword}
                onChangeText={(text) => setForm({ ...form, confirmPassword: text })}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons 
                  name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
                  size={20} 
                  color="#9CA3AF" 
                />
              </TouchableOpacity>
            </View>

            {/* Role Selection */}
            <View style={styles.roleContainer}>
              <Text style={styles.roleLabel}>Tipo de Plan:</Text>
              <TouchableOpacity 
                style={styles.rolePicker}
                onPress={() => setShowRolePicker(!showRolePicker)}
              >
                <Text style={styles.roleText}>
                  {form.role.charAt(0).toUpperCase() + form.role.slice(1)}
                </Text>
                <Ionicons 
                  name={showRolePicker ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color="#9CA3AF" 
                />
              </TouchableOpacity>
              <Text style={styles.roleDescription}>
                {getRoleDescription(form.role)}
              </Text>

              {showRolePicker && (
                <View style={styles.roleOptions}>
                  {['standard', 'premium', 'executive'].map((role) => (
                    <TouchableOpacity
                      key={role}
                      style={[
                        styles.roleOption,
                        form.role === role && styles.roleOptionSelected
                      ]}
                      onPress={() => {
                        setForm({ ...form, role: role as any });
                        setShowRolePicker(false);
                      }}
                    >
                      <Text style={[
                        styles.roleOptionText,
                        form.role === role && styles.roleOptionTextSelected
                      ]}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </Text>
                      <Text style={[
                        styles.roleOptionDescription,
                        form.role === role && styles.roleOptionDescriptionSelected
                      ]}>
                        {getRoleDescription(role)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Register Button */}
            <TouchableOpacity 
              style={[styles.registerButton, loading && styles.registerButtonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.registerButtonText}>Crear Cuenta</Text>
                  <Ionicons name="person-add" size={20} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
              <TouchableOpacity onPress={navigateToLogin}>
                <Text style={styles.loginLink}>Inicia sesión</Text>
              </TouchableOpacity>
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
    paddingBottom: 30,
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
  roleContainer: {
    marginBottom: 24,
  },
  roleLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  rolePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  roleText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  roleDescription: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  roleOptions: {
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  roleOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  roleOptionSelected: {
    backgroundColor: '#E879F9',
  },
  roleOptionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  roleOptionTextSelected: {
    color: '#FFFFFF',
  },
  roleOptionDescription: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 2,
  },
  roleOptionDescriptionSelected: {
    color: '#FFFFFF',
    opacity: 0.9,
  },
  registerButton: {
    backgroundColor: '#E879F9',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  registerButtonDisabled: {
    opacity: 0.7,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  loginText: {
    color: '#9CA3AF',
    fontSize: 16,
  },
  loginLink: {
    color: '#E879F9',
    fontSize: 16,
    fontWeight: '600',
  },
});