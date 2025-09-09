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
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import axios from 'axios';
import { format, addDays, addHours } from 'date-fns';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

interface NotificationTemplate {
  id: string;
  name: string;
  type: string;
  subject: string;
  message: string;
  trigger_hours_before: number;
  is_active: boolean;
  created_at: string;
}

interface NotificationLog {
  id: string;
  template_id: string;
  client_id: string;
  client_name: string;
  appointment_id: string;
  message: string;
  delivery_method: string;
  status: string;
  sent_at: string;
  scheduled_for: string;
}

interface NotificationStats {
  total_sent: number;
  pending_reminders: number;
  delivery_rate: number;
  recent_notifications: NotificationLog[];
}

export default function NotificationsPage() {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'templates' | 'history' | 'settings'>('templates');

  useEffect(() => {
    fetchNotificationData();
  }, []);

  const fetchNotificationData = async () => {
    try {
      setLoading(true);
      
      // For demo purposes, use mock data since backend endpoints would need email/SMS setup
      setTemplates(generateMockTemplates());
      setStats(generateMockStats());
    } catch (error) {
      console.error('Error fetching notification data:', error);
      setTemplates(generateMockTemplates());
      setStats(generateMockStats());
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotificationData();
    setRefreshing(false);
  };

  const generateMockTemplates = (): NotificationTemplate[] => [
    {
      id: '1',
      name: 'Appointment Reminder - 24 Hours',
      type: 'appointment_reminder',
      subject: 'Your PMU Appointment Tomorrow',
      message: 'Hi {client_name}! This is a reminder that you have a {service_type} appointment tomorrow at {appointment_time}. Please arrive 10 minutes early. If you need to reschedule, please call us at least 24 hours in advance.',
      trigger_hours_before: 24,
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Appointment Reminder - 2 Hours',
      type: 'appointment_reminder',
      subject: 'Your PMU Appointment Today',
      message: 'Hi {client_name}! Your {service_type} appointment is today at {appointment_time}. Please remember to follow the pre-care instructions we provided. See you soon!',
      trigger_hours_before: 2,
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: '3',
      name: 'Touch-up Reminder',
      type: 'touch_up_reminder',
      subject: 'Time for Your Touch-up Appointment',
      message: 'Hi {client_name}! It\'s been 6 weeks since your {service_type} appointment. Your touch-up session is important for optimal results. Please book your appointment at your earliest convenience.',
      trigger_hours_before: 0,
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: '4',
      name: 'Aftercare Instructions',
      type: 'post_treatment',
      subject: 'Important Aftercare Instructions',
      message: 'Thank you for choosing Chic Harmony PMU Studio! Please follow these aftercare instructions carefully for the best results. Keep the area dry for 24 hours, avoid touching, and apply the provided healing balm as directed.',
      trigger_hours_before: 0,
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: '5',
      name: 'Birthday Greeting',
      type: 'marketing',
      subject: 'Happy Birthday from Chic Harmony!',
      message: 'Happy Birthday {client_name}! 🎉 As a special birthday gift, enjoy 15% off your next PMU service with us. Valid for 30 days. Book now to treat yourself!',
      trigger_hours_before: 0,
      is_active: false,
      created_at: new Date().toISOString(),
    },
  ];

  const generateMockStats = (): NotificationStats => ({
    total_sent: 145,
    pending_reminders: 8,
    delivery_rate: 98.5,
    recent_notifications: [
      {
        id: '1',
        template_id: '1',
        client_id: 'c1',
        client_name: 'Maria Rodriguez',
        appointment_id: 'a1',
        message: 'Appointment reminder sent for tomorrow\'s microblading session',
        delivery_method: 'email',
        status: 'delivered',
        sent_at: new Date().toISOString(),
        scheduled_for: new Date().toISOString(),
      },
      {
        id: '2',
        template_id: '2',
        client_id: 'c2',
        client_name: 'Sarah Johnson',
        appointment_id: 'a2',
        message: 'Final reminder sent for today\'s lip blush appointment',
        delivery_method: 'sms',
        status: 'delivered',
        sent_at: addHours(new Date(), -2).toISOString(),
        scheduled_for: addHours(new Date(), -2).toISOString(),
      },
    ],
  });

  const handleTemplateToggle = async (templateId: string, isActive: boolean) => {
    try {
      // Update template status
      setTemplates(prev => 
        prev.map(template => 
          template.id === templateId 
            ? { ...template, is_active: isActive }
            : template
        )
      );
      
      Alert.alert(
        'Success',
        `Template ${isActive ? 'activated' : 'deactivated'} successfully`
      );
    } catch (error) {
      console.error('Error updating template:', error);
      Alert.alert('Error', 'Failed to update template status');
    }
  };

  const renderStatsCards = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statsRow}>
        <View style={[styles.statCard, styles.totalCard]}>
          <Ionicons name="mail" size={24} color="#2DD4BF" />
          <Text style={styles.statNumber}>{stats?.total_sent || 0}</Text>
          <Text style={styles.statLabel}>Total Sent</Text>
        </View>
        
        <View style={[styles.statCard, styles.pendingCard]}>
          <Ionicons name="time" size={24} color="#F59E0B" />
          <Text style={styles.statNumber}>{stats?.pending_reminders || 0}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
      </View>
      
      <View style={[styles.statCard, styles.deliveryCard]}>
        <View style={styles.deliveryContent}>
          <Ionicons name="checkmark-circle" size={28} color="#10B981" />
          <View style={styles.deliveryInfo}>
            <Text style={styles.deliveryRate}>{stats?.delivery_rate || 0}%</Text>
            <Text style={styles.deliveryLabel}>Delivery Rate</Text>
          </View>
          <View style={styles.deliveryIndicator}>
            <View style={[styles.deliveryBar, { width: `${stats?.delivery_rate || 0}%` }]} />
          </View>
        </View>
      </View>
    </View>
  );

  const renderTemplatesTab = () => (
    <View style={styles.templatesContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Notification Templates</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/notifications/add-template')}
        >
          <Ionicons name="add" size={16} color="#E879F9" />
          <Text style={styles.addButtonText}>Add Template</Text>
        </TouchableOpacity>
      </View>
      
      {templates.map((template) => (
        <View key={template.id} style={styles.templateCard}>
          <View style={styles.templateHeader}>
            <View style={styles.templateInfo}>
              <Text style={styles.templateName}>{template.name}</Text>
              <Text style={styles.templateType}>{template.type.replace('_', ' ')}</Text>
            </View>
            <Switch
              value={template.is_active}
              onValueChange={(value) => handleTemplateToggle(template.id, value)}
              trackColor={{ false: '#374151', true: '#E879F9' }}
              thumbColor={template.is_active ? '#FFFFFF' : '#9CA3AF'}
            />
          </View>
          
          <View style={styles.templateDetails}>
            <Text style={styles.templateSubject}>{template.subject}</Text>
            <Text style={styles.templateMessage} numberOfLines={2}>
              {template.message}
            </Text>
            
            {template.trigger_hours_before > 0 && (
              <View style={styles.triggerInfo}>
                <Ionicons name="time-outline" size={14} color="#2DD4BF" />
                <Text style={styles.triggerText}>
                  Sends {template.trigger_hours_before} hours before appointment
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.templateActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push(`/notifications/edit-template/${template.id}`)}
            >
              <Ionicons name="create-outline" size={16} color="#A855F7" />
              <Text style={styles.actionButtonText}>Edit</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => {
                Alert.alert(
                  'Test Template',
                  'Send a test notification using this template?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Send Test', onPress: () => {
                      Alert.alert('Success', 'Test notification sent!');
                    }}
                  ]
                );
              }}
            >
              <Ionicons name="paper-plane-outline" size={16} color="#2DD4BF" />
              <Text style={styles.actionButtonText}>Test</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );

  const renderHistoryTab = () => (
    <View style={styles.historyContainer}>
      <Text style={styles.sectionTitle}>Recent Notifications</Text>
      
      {stats?.recent_notifications && stats.recent_notifications.length > 0 ? (
        stats.recent_notifications.map((notification) => (
          <View key={notification.id} style={styles.notificationCard}>
            <View style={styles.notificationHeader}>
              <View style={[
                styles.statusIndicator,
                { backgroundColor: notification.status === 'delivered' ? '#10B981' : '#F59E0B' }
              ]}>
                <Ionicons 
                  name={notification.status === 'delivered' ? 'checkmark' : 'time'} 
                  size={12} 
                  color="#FFFFFF" 
                />
              </View>
              <View style={styles.notificationInfo}>
                <Text style={styles.notificationClient}>{notification.client_name}</Text>
                <Text style={styles.notificationTime}>
                  {format(new Date(notification.sent_at), 'MMM d, yyyy h:mm a')}
                </Text>
              </View>
              <Text style={styles.deliveryMethod}>{notification.delivery_method}</Text>
            </View>
            
            <Text style={styles.notificationMessage} numberOfLines={2}>
              {notification.message}
            </Text>
          </View>
        ))
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="mail-outline" size={64} color="#374151" />
          <Text style={styles.emptyTitle}>No notifications yet</Text>
          <Text style={styles.emptyDescription}>
            Notifications will appear here once you start sending them
          </Text>
        </View>
      )}
    </View>
  );

  const renderSettingsTab = () => (
    <View style={styles.settingsContainer}>
      <Text style={styles.sectionTitle}>Notification Settings</Text>
      
      <View style={styles.settingSection}>
        <Text style={styles.settingGroupTitle}>Delivery Methods</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="mail" size={20} color="#2DD4BF" />
            <Text style={styles.settingName}>Email Notifications</Text>
          </View>
          <Switch
            value={true}
            trackColor={{ false: '#374151', true: '#2DD4BF' }}
            thumbColor="#FFFFFF"
          />
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="chatbubble" size={20} color="#A855F7" />
            <Text style={styles.settingName}>SMS Notifications</Text>
          </View>
          <Switch
            value={false}
            trackColor={{ false: '#374151', true: '#A855F7' }}
            thumbColor="#9CA3AF"
          />
        </View>
      </View>
      
      <View style={styles.settingSection}>
        <Text style={styles.settingGroupTitle}>Business Information</Text>
        
        <TouchableOpacity style={styles.settingButton}>
          <Ionicons name="business" size={20} color="#E879F9" />
          <Text style={styles.settingButtonText}>Studio Information</Text>
          <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingButton}>
          <Ionicons name="create" size={20} color="#E879F9" />
          <Text style={styles.settingButtonText}>Email Signature</Text>
          <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingButton}>
          <Ionicons name="time" size={20} color="#E879F9" />
          <Text style={styles.settingButtonText}>Reminder Timing</Text>
          <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.comingSoonSection}>
        <View style={styles.comingSoonCard}>
          <Ionicons name="construct" size={48} color="#A855F7" />
          <Text style={styles.comingSoonTitle}>Advanced Features Coming Soon</Text>
          <Text style={styles.comingSoonDescription}>
            Email/SMS integration, automated workflows, and advanced scheduling features will be available in future updates.
          </Text>
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Ionicons name="mail" size={16} color="#2DD4BF" />
              <Text style={styles.featureText}>Email Integration (SendGrid, Mailgun)</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="chatbubble" size={16} color="#A855F7" />
              <Text style={styles.featureText}>SMS Integration (Twilio)</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="sync" size={16} color="#10B981" />
              <Text style={styles.featureText}>Automated Workflows</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="analytics" size={16} color="#F59E0B" />
              <Text style={styles.featureText}>Delivery Analytics</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading notifications...</Text>
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
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'templates' && styles.activeTab]}
          onPress={() => setSelectedTab('templates')}
        >
          <Ionicons 
            name="document-text" 
            size={16} 
            color={selectedTab === 'templates' ? '#FFFFFF' : '#9CA3AF'} 
          />
          <Text style={[styles.tabText, selectedTab === 'templates' && styles.activeTabText]}>
            Templates
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'history' && styles.activeTab]}
          onPress={() => setSelectedTab('history')}
        >
          <Ionicons 
            name="time" 
            size={16} 
            color={selectedTab === 'history' ? '#FFFFFF' : '#9CA3AF'} 
          />
          <Text style={[styles.tabText, selectedTab === 'history' && styles.activeTabText]}>
            History
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'settings' && styles.activeTab]}
          onPress={() => setSelectedTab('settings')}
        >
          <Ionicons 
            name="settings" 
            size={16} 
            color={selectedTab === 'settings' ? '#FFFFFF' : '#9CA3AF'} 
          />
          <Text style={[styles.tabText, selectedTab === 'settings' && styles.activeTabText]}>
            Settings
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderStatsCards()}
        
        {selectedTab === 'templates' && renderTemplatesTab()}
        {selectedTab === 'history' && renderHistoryTab()}
        {selectedTab === 'settings' && renderSettingsTab()}
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
  headerSpacer: {
    width: 32,
  },
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: '#1F1F1F',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#E879F9',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
    marginLeft: 6,
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: '#1F1F1F',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#374151',
  },
  totalCard: {
    flex: 0.48,
    alignItems: 'center',
  },
  pendingCard: {
    flex: 0.48,
    alignItems: 'center',
  },
  deliveryCard: {
    marginBottom: 16,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  deliveryContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryInfo: {
    flex: 1,
    marginLeft: 16,
  },
  deliveryRate: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10B981',
  },
  deliveryLabel: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  deliveryIndicator: {
    width: 60,
    height: 6,
    backgroundColor: '#374151',
    borderRadius: 3,
    overflow: 'hidden',
  },
  deliveryBar: {
    height: '100%',
    backgroundColor: '#10B981',
  },
  templatesContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F1F1F',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E879F9',
  },
  addButtonText: {
    fontSize: 14,
    color: '#E879F9',
    marginLeft: 4,
  },
  templateCard: {
    backgroundColor: '#1F1F1F',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  templateType: {
    fontSize: 12,
    color: '#2DD4BF',
    textTransform: 'capitalize',
  },
  templateDetails: {
    marginBottom: 12,
  },
  templateSubject: {
    fontSize: 14,
    fontWeight: '500',
    color: '#D1D5DB',
    marginBottom: 4,
  },
  templateMessage: {
    fontSize: 13,
    color: '#9CA3AF',
    lineHeight: 18,
    marginBottom: 8,
  },
  triggerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  triggerText: {
    fontSize: 12,
    color: '#2DD4BF',
    marginLeft: 4,
  },
  templateActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111111',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  actionButtonText: {
    fontSize: 12,
    color: '#D1D5DB',
    marginLeft: 4,
  },
  historyContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  notificationCard: {
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationInfo: {
    flex: 1,
  },
  notificationClient: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  notificationTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  deliveryMethod: {
    fontSize: 12,
    color: '#2DD4BF',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  notificationMessage: {
    fontSize: 13,
    color: '#D1D5DB',
    lineHeight: 18,
  },
  settingsContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  settingSection: {
    marginBottom: 32,
  },
  settingGroupTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingName: {
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 12,
  },
  settingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  settingButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    flex: 1,
    marginLeft: 12,
  },
  comingSoonSection: {
    marginTop: 32,
    paddingBottom: 32,
  },
  comingSoonCard: {
    backgroundColor: '#1F1F1F',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#A855F7',
  },
  comingSoonTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  comingSoonDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  featuresList: {
    alignSelf: 'stretch',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#D1D5DB',
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
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