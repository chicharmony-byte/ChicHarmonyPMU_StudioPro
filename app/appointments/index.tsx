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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Calendar } from 'react-native-calendars';
import axios from 'axios';
import { format, startOfWeek, endOfWeek, addDays } from 'date-fns';

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
  created_at: string;
  updated_at: string;
}

interface CalendarData {
  [key: string]: {
    id: string;
    client_name: string;
    service_type: string;
    time: string;
    duration: number;
    status: string;
  }[];
}

export default function AppointmentsPage() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [appointments, setAppointments] = useState<AppointmentWithClient[]>([]);
  const [calendarData, setCalendarData] = useState<CalendarData>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [stats, setStats] = useState({
    today: 0,
    week: 0,
    month: 0,
  });

  useEffect(() => {
    fetchAppointments();
    fetchStats();
  }, []);

  useEffect(() => {
    if (viewMode === 'calendar') {
      fetchCalendarData();
    }
  }, [selectedDate, viewMode]);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/stats/dashboard`);
      setStats({
        today: response.data.today_appointments,
        week: response.data.week_appointments,
        month: response.data.week_appointments * 4, // Rough estimate
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const today = new Date();
      const weekStart = startOfWeek(today);
      const weekEnd = endOfWeek(today);
      
      const response = await axios.get(`${BACKEND_URL}/api/appointments`, {
        params: {
          start_date: weekStart.toISOString(),
          end_date: weekEnd.toISOString(),
        },
      });
      
      setAppointments(response.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      Alert.alert('Error', 'Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const fetchCalendarData = async () => {
    try {
      const date = new Date(selectedDate);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      
      const response = await axios.get(`${BACKEND_URL}/api/calendar/${year}/${month}`);
      setCalendarData(response.data.appointments || {});
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAppointments();
    await fetchStats();
    if (viewMode === 'calendar') {
      await fetchCalendarData();
    }
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return '#10B981';
      case 'scheduled':
        return '#3B82F6';
      case 'in_progress':
        return '#F59E0B';
      case 'completed':
        return '#8B5CF6';
      case 'cancelled':
        return '#EF4444';
      case 'no_show':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  const getServiceIcon = (service: string) => {
    const serviceType = service.toLowerCase();
    if (serviceType.includes('eyebrow')) return 'eye-outline';
    if (serviceType.includes('lip')) return 'happy-outline';
    if (serviceType.includes('eyeliner')) return 'remove-outline';
    if (serviceType.includes('consultation')) return 'chatbubble-outline';
    return 'brush-outline';
  };

  const formatServiceName = (service: string) => {
    return service.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleAddAppointment = () => {
    router.push('/appointments/add');
  };

  const handleAppointmentPress = (appointment: AppointmentWithClient) => {
    router.push(`/appointments/${appointment.id}`);
  };

  const renderTodayAppointments = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayAppointments = appointments.filter(apt => 
      format(new Date(apt.appointment_date), 'yyyy-MM-dd') === today
    );

    if (todayAppointments.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={48} color="#374151" />
          <Text style={styles.emptyTitle}>No appointments today</Text>
          <Text style={styles.emptyDescription}>Your schedule is clear for today</Text>
        </View>
      );
    }

    return (
      <View style={styles.appointmentsList}>
        {todayAppointments.map((appointment) => (
          <TouchableOpacity
            key={appointment.id}
            style={styles.appointmentCard}
            onPress={() => handleAppointmentPress(appointment)}
          >
            <View style={styles.appointmentHeader}>
              <View style={styles.serviceInfo}>
                <Ionicons 
                  name={getServiceIcon(appointment.service_type)} 
                  size={20} 
                  color="#8B5CF6" 
                />
                <Text style={styles.serviceName}>
                  {formatServiceName(appointment.service_type)}
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(appointment.status) }]}>
                <Text style={styles.statusText}>{appointment.status}</Text>
              </View>
            </View>
            
            <Text style={styles.clientName}>{appointment.client_name}</Text>
            
            <View style={styles.appointmentDetails}>
              <View style={styles.detailRow}>
                <Ionicons name="time-outline" size={16} color="#9CA3AF" />
                <Text style={styles.detailText}>
                  {format(new Date(appointment.appointment_date), 'HH:mm')}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="hourglass-outline" size={16} color="#9CA3AF" />
                <Text style={styles.detailText}>{appointment.duration_minutes} min</Text>
              </View>
              {appointment.price && (
                <View style={styles.detailRow}>
                  <Ionicons name="card-outline" size={16} color="#9CA3AF" />
                  <Text style={styles.detailText}>${appointment.price}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderCalendarView = () => {
    const markedDates = Object.keys(calendarData).reduce((acc, date) => {
      const dayAppointments = calendarData[date];
      acc[date] = {
        marked: true,
        dotColor: '#8B5CF6',
        selectedColor: '#8B5CF6',
        selected: date === selectedDate,
        customStyles: {
          container: {
            backgroundColor: date === selectedDate ? '#8B5CF6' : 'transparent',
            borderRadius: 16,
          },
          text: {
            color: date === selectedDate ? '#FFFFFF' : '#D1D5DB',
            fontWeight: dayAppointments.length > 0 ? 'bold' : 'normal',
          },
        },
      };
      return acc;
    }, {} as any);

    const selectedDayAppointments = calendarData[selectedDate] || [];

    return (
      <View style={styles.calendarContainer}>
        <Calendar
          current={selectedDate}
          onDayPress={(day) => setSelectedDate(day.dateString)}
          markedDates={markedDates}
          markingType="custom"
          theme={{
            backgroundColor: '#0F0F0F',
            calendarBackground: '#1F1F1F',
            textSectionTitleColor: '#9CA3AF',
            selectedDayBackgroundColor: '#8B5CF6',
            selectedDayTextColor: '#FFFFFF',
            todayTextColor: '#8B5CF6',
            dayTextColor: '#D1D5DB',
            textDisabledColor: '#6B7280',
            dotColor: '#8B5CF6',
            selectedDotColor: '#FFFFFF',
            arrowColor: '#8B5CF6',
            disabledArrowColor: '#6B7280',
            monthTextColor: '#FFFFFF',
            indicatorColor: '#8B5CF6',
            textDayFontWeight: '500',
            textMonthFontWeight: '600',
            textDayHeaderFontWeight: '600',
            textDayFontSize: 16,
            textMonthFontSize: 18,
            textDayHeaderFontSize: 13,
          }}
          style={styles.calendar}
        />

        {/* Selected Day Appointments */}
        <View style={styles.selectedDayContainer}>
          <Text style={styles.selectedDayTitle}>
            {format(new Date(selectedDate), 'EEEE, MMMM d, yyyy')}
          </Text>
          
          {selectedDayAppointments.length === 0 ? (
            <View style={styles.emptyDayContainer}>
              <Text style={styles.emptyDayText}>No appointments scheduled</Text>
            </View>
          ) : (
            <ScrollView style={styles.dayAppointmentsList} showsVerticalScrollIndicator={false}>
              {selectedDayAppointments.map((appointment) => (
                <View key={appointment.id} style={styles.dayAppointmentCard}>
                  <View style={styles.dayAppointmentTime}>
                    <Text style={styles.timeText}>{appointment.time}</Text>
                    <Text style={styles.durationText}>{appointment.duration}min</Text>
                  </View>
                  <View style={styles.dayAppointmentInfo}>
                    <Text style={styles.dayClientName}>{appointment.client_name}</Text>
                    <Text style={styles.dayServiceName}>
                      {formatServiceName(appointment.service_type)}
                    </Text>
                  </View>
                  <View style={[styles.dayStatusDot, { backgroundColor: getStatusColor(appointment.status) }]} />
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    );
  };

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
        <Text style={styles.headerTitle}>Appointments</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddAppointment}>
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* View Mode Toggle */}
      <View style={styles.viewToggle}>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'calendar' && styles.toggleButtonActive]}
          onPress={() => setViewMode('calendar')}
        >
          <Ionicons 
            name="calendar-outline" 
            size={16} 
            color={viewMode === 'calendar' ? '#FFFFFF' : '#9CA3AF'} 
          />
          <Text style={[styles.toggleText, viewMode === 'calendar' && styles.toggleTextActive]}>
            Calendar
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'list' && styles.toggleButtonActive]}
          onPress={() => setViewMode('list')}
        >
          <Ionicons 
            name="list-outline" 
            size={16} 
            color={viewMode === 'list' ? '#FFFFFF' : '#9CA3AF'} 
          />
          <Text style={[styles.toggleText, viewMode === 'list' && styles.toggleTextActive]}>
            Today
          </Text>
        </TouchableOpacity>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.today}</Text>
          <Text style={styles.statLabel}>Today</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.week}</Text>
          <Text style={styles.statLabel}>This Week</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.month}</Text>
          <Text style={styles.statLabel}>This Month</Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {viewMode === 'calendar' ? renderCalendarView() : renderTodayAppointments()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
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
    backgroundColor: '#8B5CF6',
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#1F1F1F',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  toggleButtonActive: {
    backgroundColor: '#8B5CF6',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
    marginLeft: 6,
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  calendarContainer: {
    flex: 1,
  },
  calendar: {
    marginHorizontal: 20,
    borderRadius: 16,
    backgroundColor: '#1F1F1F',
  },
  selectedDayContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
    flex: 1,
  },
  selectedDayTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  emptyDayContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyDayText: {
    fontSize: 14,
    color: '#6B7280',
  },
  dayAppointmentsList: {
    flex: 1,
  },
  dayAppointmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  dayAppointmentTime: {
    alignItems: 'center',
    marginRight: 16,
    minWidth: 60,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  durationText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  dayAppointmentInfo: {
    flex: 1,
  },
  dayClientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  dayServiceName: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  dayStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 12,
  },
  appointmentsList: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  appointmentCard: {
    backgroundColor: '#1F1F1F',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  clientName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  appointmentDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginLeft: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
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
  },
});