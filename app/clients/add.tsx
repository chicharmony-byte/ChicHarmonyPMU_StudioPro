import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import axios from 'axios';
import { useForm, Controller } from 'react-hook-form';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

interface ClientFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth?: string;
  skin_tone?: string;
  hair_color?: string;
  eye_color?: string;
  allergies?: string;
  medical_conditions?: string;
  notes?: string;
}

export default function AddClientPage() {
  const [loading, setLoading] = useState(false);
  
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientFormData>({
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      date_of_birth: '',
      skin_tone: '',
      hair_color: '',
      eye_color: '',
      allergies: '',
      medical_conditions: '',
      notes: '',
    },
  });

  const onSubmit = async (data: ClientFormData) => {
    try {
      setLoading(true);
      console.log('Creating client:', data);
      
      const response = await axios.post(`${BACKEND_URL}/api/clients`, data);
      
      Alert.alert(
        'Success',
        'Client added successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error creating client:', error);
      Alert.alert(
        'Error',
        error.response?.data?.detail || 'Failed to create client. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (
    name: keyof ClientFormData,
    label: string,
    placeholder: string,
    options: {
      required?: boolean;
      multiline?: boolean;
      keyboardType?: 'default' | 'email-address' | 'phone-pad';
      autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    } = {}
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>
        {label}
        {options.required && <Text style={styles.required}> *</Text>}
      </Text>
      <Controller
        control={control}
        name={name}
        rules={{
          required: options.required ? `${label} is required` : false,
          ...(name === 'email' && {
            pattern: {
              value: /^\S+@\S+$/i,
              message: 'Invalid email address',
            },
          }),
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={[
              styles.textInput,
              options.multiline && styles.textArea,
              errors[name] && styles.inputError,
            ]}
            placeholder={placeholder}
            placeholderTextColor="#6B7280"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            multiline={options.multiline}
            numberOfLines={options.multiline ? 4 : 1}
            keyboardType={options.keyboardType || 'default'}
            autoCapitalize={options.autoCapitalize || 'sentences'}
            textAlignVertical={options.multiline ? 'top' : 'center'}
          />
        )}
      />
      {errors[name] && (
        <Text style={styles.errorText}>{errors[name]?.message}</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add New Client</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formContainer}>
            {/* Basic Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Basic Information</Text>
              
              {renderInput('first_name', 'First Name', 'Enter first name', {
                required: true,
                autoCapitalize: 'words',
              })}
              
              {renderInput('last_name', 'Last Name', 'Enter last name', {
                required: true,
                autoCapitalize: 'words',
              })}
              
              {renderInput('email', 'Email', 'Enter email address', {
                required: true,
                keyboardType: 'email-address',
                autoCapitalize: 'none',
              })}
              
              {renderInput('phone', 'Phone', 'Enter phone number', {
                required: true,
                keyboardType: 'phone-pad',
              })}
              
              {renderInput('date_of_birth', 'Date of Birth', 'YYYY-MM-DD (optional)')}
            </View>

            {/* Physical Characteristics */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Physical Characteristics</Text>
              
              {renderInput('skin_tone', 'Skin Tone', 'e.g., Fair, Medium, Dark')}
              {renderInput('hair_color', 'Hair Color', 'e.g., Brown, Blonde, Black')}
              {renderInput('eye_color', 'Eye Color', 'e.g., Brown, Blue, Green')}
            </View>

            {/* Medical Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Medical Information</Text>
              
              {renderInput('allergies', 'Allergies', 'List any known allergies', {
                multiline: true,
              })}
              
              {renderInput('medical_conditions', 'Medical Conditions', 'List any relevant medical conditions', {
                multiline: true,
              })}
            </View>

            {/* Notes */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Additional Notes</Text>
              
              {renderInput('notes', 'Notes', 'Any additional notes about the client', {
                multiline: true,
              })}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit(onSubmit)}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>
                {loading ? 'Creating Client...' : 'Create Client'}
              </Text>
            </TouchableOpacity>
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
  headerSpacer: {
    width: 32,
  },
  scrollContainer: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#D1D5DB',
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  textInput: {
    backgroundColor: '#1F1F1F',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#FFFFFF',
    minHeight: 50,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  submitButtonDisabled: {
    backgroundColor: '#6B7280',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});