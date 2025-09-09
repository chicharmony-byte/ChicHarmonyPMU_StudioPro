import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import { format } from 'date-fns';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

interface AppointmentWithClient {
  id: string;
  client_id: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  service_type: string;
  appointment_date: string;
  duration_minutes: number;
  status: string;
  notes?: string;
  price?: number;
  deposit?: number;
  recurrence_type: string;
  send_reminders: boolean;
  reminder_sent: boolean;
  created_at: string;
  updated_at: string;
}

const statusOptions = [
  { value: 'scheduled', label: 'Scheduled', color: '#3B82F6' },
  { value: 'confirmed', label: 'Confirmed', color: '#10B981' },
  { value: 'in_progress', label: 'In Progress', color: '#F59E0B' },
  { value: 'completed', label: 'Completed', color: '#8B5CF6' },
  { value: 'cancelled', label: 'Cancelled', color: '#EF4444' },
  { value: 'no_show', label: 'No Show', color: '#6B7280' },
];

export default function AppointmentDetailPage() {
  const { id } = useLocalSearchParams();
  const [appointment, setAppointment] = useState<AppointmentWithClient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchAppointment();
    }
  }, [id]);

  const fetchAppointment = async () => {
    try {
      setLoading(true);
      console.log('Fetching appointment:', `${BACKEND_URL}/api/appointments/${id}`);
      const response = await axios.get(`${BACKEND_URL}/api/appointments/${id}`);
      setAppointment(response.data);
    } catch (error) {
      console.error('Error fetching appointment:', error);
      Alert.alert('Error', 'Failed to fetch appointment details.');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!appointment) return;

    try {
      const response = await axios.put(`${BACKEND_URL}/api/appointments/${appointment.id}`, {
        status: newStatus,
      });

      setAppointment({ ...appointment, status: newStatus });
      Alert.alert('Success', 'Appointment status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Error', 'Failed to update appointment status');
    }
  };

  const handleDeleteAppointment = () => {
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment? This action cannot be undone.',
      [
        { text: 'Keep', style: 'cancel' },
        {
          text: 'Cancel Appointment',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`${BACKEND_URL}/api/appointments/${appointment?.id}`);
              Alert.alert('Success', 'Appointment cancelled successfully');
              router.back();
            } catch (error) {
              console.error('Error cancelling appointment:', error);
              Alert.alert('Error', 'Failed to cancel appointment');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    const statusOption = statusOptions.find(s => s.value === status);
    return statusOption?.color || '#6B7280';
  };

  const formatServiceName = (service: string) => {
    return service.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getServiceIcon = (service: string) => {
    const serviceType = service.toLowerCase();
    if (serviceType.includes('eyebrow')) return 'eye-outline';
    if (serviceType.includes('lip')) return 'happy-outline';
    if (serviceType.includes('eyeliner')) return 'remove-outline';
    if (serviceType.includes('consultation')) return 'chatbubble-outline';
    return 'brush-outline';
  };

  const renderStatusSelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Status</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.statusScroll}
      >
        {statusOptions.map((status) => (
          <TouchableOpacity
            key={status.value}
            style={[
              styles.statusOption,
              { borderColor: status.color },
              appointment?.status === status.value && { backgroundColor: status.color },
            ]}
            onPress={() => handleStatusChange(status.value)}
          >
            <Text style={[
              styles.statusText,
              appointment?.status === status.value && styles.statusTextSelected,
            ]}>
              {status.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderInfoSection = (title: string, items: { icon: string; label: string; value: string }[]) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.infoContainer}>
        {items.map((item, index) => (
          <View key={index} style={styles.infoRow}>
            <Ionicons name={item.icon as any} size={20} color="#8B5CF6" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{item.label}</Text>
              <Text style={styles.infoValue}>{item.value}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading appointment...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!appointment) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Appointment not found</Text>
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
        <Text style={styles.headerTitle}>Appointment Details</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => router.push(`/appointments/${appointment.id}/edit`)}
        >
          <Ionicons name="create-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Service Header */}
        <View style={styles.serviceHeader}>
          <View style={styles.serviceIcon}>
            <Ionicons 
              name={getServiceIcon(appointment.service_type)} 
              size={32} 
              color="#8B5CF6" 
            />
          </View>
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceName}>
              {formatServiceName(appointment.service_type)}
            </Text>
            <Text style={styles.clientName}>{appointment.client_name}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(appointment.status) }]}>
            <Text style={styles.statusBadgeText}>{appointment.status.toUpperCase()}</Text>
          </View>
        </View>

        {renderStatusSelector()}

        {/* Appointment Details */}
        {renderInfoSection('Appointment Details', [
          {
            icon: 'calendar-outline',
            label: 'Date',
            value: format(new Date(appointment.appointment_date), 'EEEE, MMMM d, yyyy'),
          },
          {
            icon: 'time-outline',
            label: 'Time',
            value: format(new Date(appointment.appointment_date), 'h:mm a'),
          },
          {
            icon: 'hourglass-outline',
            label: 'Duration',
            value: `${appointment.duration_minutes} minutes`,
          },
        ])}

        {/* Client Information */}
        {renderInfoSection('Client Information', [
          {
            icon: 'person-outline',
            label: 'Name',
            value: appointment.client_name,
          },
          {
            icon: 'mail-outline',
            label: 'Email',
            value: appointment.client_email,
          },
          {
            icon: 'call-outline',
            label: 'Phone',
            value: appointment.client_phone,
          },
        ])}

        {/* Financial Information */}
        {(appointment.price || appointment.deposit) && renderInfoSection('Financial Details', [
          ...(appointment.price ? [{
            icon: 'card-outline',
            label: 'Service Price',
            value: `$${appointment.price}`,
          }] : []),
          ...(appointment.deposit ? [{
            icon: 'wallet-outline',
            label: 'Deposit',
            value: `$${appointment.deposit}`,
          }] : []),
        ])}

        {/* Notes */}
        {appointment.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <View style={styles.notesContainer}>
              <Text style={styles.notesText}>{appointment.notes}</Text>
            </View>
          </View>
        )}

        {/* Reminders */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reminders</Text>
          <View style={styles.reminderContainer}>
            <Ionicons 
              name={appointment.send_reminders ? 'notifications' : 'notifications-off'} 
              size={20} 
              color={appointment.send_reminders ? '#10B981' : '#6B7280'} 
            />
            <Text style={styles.reminderText}>
              {appointment.send_reminders 
                ? 'Reminders enabled' 
                : 'Reminders disabled'
              }
            </Text>
            {appointment.reminder_sent && (
              <View style={styles.reminderSent}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <Text style={styles.reminderSentText}>Sent</Text>
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push(`/clients/${appointment.client_id}`)}
          >
            <Ionicons name="person-outline" size={20} color="#8B5CF6" />
            <Text style={styles.actionButtonText}>View Client</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.dangerButton]}
            onPress={handleDeleteAppointment}
          >
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
            <Text style={[styles.actionButtonText, styles.dangerButtonText]}>
              Cancel Appointment
            </Text>
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
  editButton: {
    padding: 4,
  },
  scrollContainer: {
    flex: 1,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1F1F1F',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
  },
  serviceIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  clientName: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  statusScroll: {
    flexGrow: 0,
  },
  statusOption: {
    borderRadius: 8,
    borderWidth: 2,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    backgroundColor: 'transparent',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#D1D5DB',
  },
  statusTextSelected: {
    color: '#FFFFFF',
  },
  infoContainer: {
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  notesContainer: {
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
    padding: 16,
  },
  notesText: {
    fontSize: 14,
    color: '#D1D5DB',
    lineHeight: 20,
  },
  reminderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
    padding: 16,
  },
  reminderText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 12,
    flex: 1,
  },
  reminderSent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reminderSentText: {
    fontSize: 12,
    color: '#10B981',
    marginLeft: 4,
  },
  actionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B5CF6',
    marginLeft: 8,
  },
  dangerButton: {
    borderColor: '#EF4444',
  },
  dangerButtonText: {
    color: '#EF4444',
  },
});