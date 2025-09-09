import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import { format, addDays, startOfDay } from 'date-fns';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

interface AppointmentFormData {
  client_id: string;
  service_type: string;
  appointment_date: Date;
  appointment_time: string;
  duration_minutes: number;
  notes: string;
  price: number;
  deposit: number;
  recurrence_type: string;
  send_reminders: boolean;
}

const serviceTypes = [
  { value: 'eyebrow_microblading', label: 'Eyebrow Microblading', duration: 180, price: 450 },
  { value: 'eyebrow_powder_brows', label: 'Eyebrow Powder Brows', duration: 150, price: 400 },
  { value: 'eyebrow_touch_up', label: 'Eyebrow Touch-up', duration: 90, price: 150 },
  { value: 'lip_blush', label: 'Lip Blush', duration: 120, price: 500 },
  { value: 'lip_neutralization', label: 'Lip Neutralization', duration: 90, price: 300 },
  { value: 'eyeliner', label: 'Eyeliner', duration: 120, price: 350 },
  { value: 'consultation', label: 'Consultation', duration: 60, price: 50 },
  { value: 'removal', label: 'Removal', duration: 90, price: 200 },
];

const recurrenceTypes = [
  { value: 'none', label: 'No Recurrence' },
  { value: 'touch_up', label: 'Touch-up (6 weeks)' },
];

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00'
];

export default function AddAppointmentPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedService, setSelectedService] = useState(serviceTypes[0]);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AppointmentFormData>({
    defaultValues: {
      client_id: '',
      service_type: 'eyebrow_microblading',
      appointment_date: addDays(startOfDay(new Date()), 1),
      appointment_time: '10:00',
      duration_minutes: 180,
      notes: '',
      price: 450,
      deposit: 0,
      recurrence_type: 'none',
      send_reminders: true,
    },
  });

  const watchedServiceType = watch('service_type');
  const watchedDate = watch('appointment_date');

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    const service = serviceTypes.find(s => s.value === watchedServiceType);
    if (service) {
      setSelectedService(service);
      setValue('duration_minutes', service.duration);
      setValue('price', service.price);
    }
  }, [watchedServiceType, setValue]);

  useEffect(() => {
    if (watchedDate) {
      checkAvailability(watchedDate);
    }
  }, [watchedDate]);

  const fetchClients = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/clients`);
      setClients(response.data);
    } catch (error) {
      console.error('Error fetching clients:', error);
      Alert.alert('Error', 'Failed to fetch clients');
    }
  };

  const checkAvailability = async (date: Date) => {
    try {
      const dateString = format(date, 'yyyy-MM-dd');
      const response = await axios.get(`${BACKEND_URL}/api/availability/${dateString}`);
      setAvailableSlots(response.data.available_slots || []);
    } catch (error) {
      console.error('Error checking availability:', error);
      setAvailableSlots(timeSlots); // Fallback to all slots
    }
  };

  const onSubmit = async (data: AppointmentFormData) => {
    try {
      setLoading(true);
      
      // Combine date and time
      const [hours, minutes] = data.appointment_time.split(':').map(Number);
      const appointmentDateTime = new Date(data.appointment_date);
      appointmentDateTime.setHours(hours, minutes, 0, 0);

      const appointmentData = {
        client_id: data.client_id,
        service_type: data.service_type,
        appointment_date: appointmentDateTime.toISOString(),
        duration_minutes: data.duration_minutes,
        notes: data.notes,
        price: data.price,
        deposit: data.deposit,
        recurrence_type: data.recurrence_type,
        send_reminders: data.send_reminders,
      };

      console.log('Creating appointment:', appointmentData);
      
      const response = await axios.post(`${BACKEND_URL}/api/appointments`, appointmentData);
      
      Alert.alert(
        'Success',
        'Appointment scheduled successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error creating appointment:', error);
      Alert.alert(
        'Error',
        error.response?.data?.detail || 'Failed to create appointment. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const renderClientPicker = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Select Client</Text>
      <Controller
        control={control}
        name="client_id"
        rules={{ required: 'Please select a client' }}
        render={({ field: { onChange, value } }) => (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.clientScrollView}
          >
            {clients.map((client) => (
              <TouchableOpacity
                key={client.id}
                style={[
                  styles.clientCard,
                  value === client.id && styles.clientCardSelected,
                ]}
                onPress={() => onChange(client.id)}
              >
                <View style={styles.clientAvatar}>
                  <Text style={styles.clientAvatarText}>
                    {client.first_name[0]}{client.last_name[0]}
                  </Text>
                </View>
                <Text style={[
                  styles.clientName,
                  value === client.id && styles.clientNameSelected,
                ]}>
                  {client.first_name} {client.last_name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      />
      {errors.client_id && (
        <Text style={styles.errorText}>{errors.client_id.message}</Text>
      )}
    </View>
  );

  const renderServicePicker = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Service Type</Text>
      <Controller
        control={control}
        name="service_type"
        render={({ field: { onChange, value } }) => (
          <View style={styles.serviceGrid}>
            {serviceTypes.map((service) => (
              <TouchableOpacity
                key={service.value}
                style={[
                  styles.serviceCard,
                  value === service.value && styles.serviceCardSelected,
                ]}
                onPress={() => onChange(service.value)}
              >
                <Text style={[
                  styles.serviceLabel,
                  value === service.value && styles.serviceLabelSelected,
                ]}>
                  {service.label}
                </Text>
                <Text style={styles.serviceDetails}>
                  {service.duration}min • ${service.price}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      />
    </View>
  );

  const renderDateTimePicker = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Date & Time</Text>
      
      <Controller
        control={control}
        name="appointment_date"
        render={({ field: { onChange, value } }) => (
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color="#8B5CF6" />
            <Text style={styles.dateButtonText}>
              {format(value, 'EEEE, MMMM d, yyyy')}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      />

      {showDatePicker && (
        <DateTimePicker
          value={watch('appointment_date')}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setValue('appointment_date', selectedDate);
            }
          }}
        />
      )}

      <Controller
        control={control}
        name="appointment_time"
        render={({ field: { onChange, value } }) => (
          <View style={styles.timeSlots}>
            <Text style={styles.timeLabel}>Available Times:</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.timeSlotsScroll}
            >
              {timeSlots.map((time) => {
                const isAvailable = availableSlots.includes(time);
                return (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.timeSlot,
                      value === time && styles.timeSlotSelected,
                      !isAvailable && styles.timeSlotDisabled,
                    ]}
                    onPress={() => isAvailable && onChange(time)}
                    disabled={!isAvailable}
                  >
                    <Text style={[
                      styles.timeSlotText,
                      value === time && styles.timeSlotTextSelected,
                      !isAvailable && styles.timeSlotTextDisabled,
                    ]}>
                      {time}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}
      />
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
          <Text style={styles.headerTitle}>Schedule Appointment</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {renderClientPicker()}
          {renderServicePicker()}
          {renderDateTimePicker()}

          {/* Additional Options */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Options</Text>
            
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Text style={styles.inputLabel}>Price ($)</Text>
                <Controller
                  control={control}
                  name="price"
                  render={({ field: { onChange, value } }) => (
                    <TouchableOpacity style={styles.priceInput}>
                      <Text style={styles.priceText}>${value}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
              
              <View style={styles.halfWidth}>
                <Text style={styles.inputLabel}>Duration (min)</Text>
                <View style={styles.durationInput}>
                  <Text style={styles.durationText}>{selectedService.duration}</Text>
                </View>
              </View>
            </View>

            <Controller
              control={control}
              name="recurrence_type"
              render={({ field: { onChange, value } }) => (
                <View style={styles.recurrenceContainer}>
                  <Text style={styles.inputLabel}>Recurrence</Text>
                  <View style={styles.recurrenceOptions}>
                    {recurrenceTypes.map((type) => (
                      <TouchableOpacity
                        key={type.value}
                        style={[
                          styles.recurrenceOption,
                          value === type.value && styles.recurrenceOptionSelected,
                        ]}
                        onPress={() => onChange(type.value)}
                      >
                        <Text style={[
                          styles.recurrenceText,
                          value === type.value && styles.recurrenceTextSelected,
                        ]}>
                          {type.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
          >
            <Ionicons name="calendar" size={20} color="#FFFFFF" />
            <Text style={styles.submitButtonText}>
              {loading ? 'Scheduling...' : 'Schedule Appointment'}
            </Text>
          </TouchableOpacity>
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
  section: {
    padding: 20,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  clientScrollView: {
    flexGrow: 0,
  },
  clientCard: {
    alignItems: 'center',
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 100,
  },
  clientCardSelected: {
    borderColor: '#8B5CF6',
    backgroundColor: '#8B5CF6',
  },
  clientAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  clientAvatarText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  clientName: {
    fontSize: 12,
    color: '#D1D5DB',
    textAlign: 'center',
  },
  clientNameSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  serviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  serviceCard: {
    width: '48%',
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: '1%',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  serviceCardSelected: {
    borderColor: '#8B5CF6',
    backgroundColor: '#8B5CF6',
  },
  serviceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  serviceLabelSelected: {
    color: '#FFFFFF',
  },
  serviceDetails: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    flex: 1,
    marginLeft: 12,
  },
  timeSlots: {
    marginTop: 8,
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#D1D5DB',
    marginBottom: 12,
  },
  timeSlotsScroll: {
    flexGrow: 0,
  },
  timeSlot: {
    backgroundColor: '#1F1F1F',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  timeSlotSelected: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  timeSlotDisabled: {
    backgroundColor: '#111111',
    borderColor: '#374151',
  },
  timeSlotText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  timeSlotTextSelected: {
    color: '#FFFFFF',
  },
  timeSlotTextDisabled: {
    color: '#6B7280',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  halfWidth: {
    flex: 0.48,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#D1D5DB',
    marginBottom: 8,
  },
  priceInput: {
    backgroundColor: '#1F1F1F',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  priceText: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: '600',
    textAlign: 'center',
  },
  durationInput: {
    backgroundColor: '#1F1F1F',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  durationText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  recurrenceContainer: {
    marginTop: 16,
  },
  recurrenceOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  recurrenceOption: {
    backgroundColor: '#1F1F1F',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  recurrenceOptionSelected: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  recurrenceText: {
    fontSize: 14,
    color: '#D1D5DB',
  },
  recurrenceTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingVertical: 16,
    marginHorizontal: 20,
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
    marginLeft: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
});