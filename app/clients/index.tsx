import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import axios from 'axios';
import { FlashList } from '@shopify/flash-list';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

interface Client {
  id: string;
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
  photos: any[];
  created_at: string;
  updated_at: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = clients.filter(client =>
        `${client.first_name} ${client.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.phone.includes(searchQuery)
      );
      setFilteredClients(filtered);
    } else {
      setFilteredClients(clients);
    }
  }, [searchQuery, clients]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      console.log('Fetching clients from:', `${BACKEND_URL}/api/clients`);
      const response = await axios.get(`${BACKEND_URL}/api/clients`);
      setClients(response.data);
    } catch (error) {
      console.error('Error fetching clients:', error);
      Alert.alert('Error', 'Failed to fetch clients. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClient = () => {
    router.push('/clients/add');
  };

  const handleClientPress = (client: Client) => {
    router.push(`/clients/${client.id}`);
  };

  const renderClientCard = ({ item: client }: { item: Client }) => (
    <TouchableOpacity
      style={styles.clientCard}
      onPress={() => handleClientPress(client)}
    >
      <View style={styles.clientHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {client.first_name[0]}{client.last_name[0]}
          </Text>
        </View>
        <View style={styles.clientInfo}>
          <Text style={styles.clientName}>
            {client.first_name} {client.last_name}
          </Text>
          <Text style={styles.clientEmail}>{client.email}</Text>
          <Text style={styles.clientPhone}>{client.phone}</Text>
        </View>
        <View style={styles.clientMeta}>
          <View style={styles.photosBadge}>
            <Ionicons name="camera" size={12} color="#8B5CF6" />
            <Text style={styles.photosCount}>{client.photos.length}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#6B7280" />
        </View>
      </View>
      
      {client.allergies && (
        <View style={styles.warningContainer}>
          <Ionicons name="warning" size={14} color="#F59E0B" />
          <Text style={styles.warningText}>Has allergies</Text>
        </View>
      )}
      
      {client.notes && (
        <Text style={styles.clientNotes} numberOfLines={2}>
          {client.notes}
        </Text>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading clients...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Clients</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddClient}>
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#6B7280" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search clients..."
          placeholderTextColor="#6B7280"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          {filteredClients.length} of {clients.length} clients
        </Text>
      </View>

      {/* Clients List */}
      {filteredClients.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={64} color="#374151" />
          <Text style={styles.emptyTitle}>
            {clients.length === 0 ? 'No clients yet' : 'No clients found'}
          </Text>
          <Text style={styles.emptyDescription}>
            {clients.length === 0 
              ? 'Add your first client to get started'
              : 'Try adjusting your search query'
            }
          </Text>
          {clients.length === 0 && (
            <TouchableOpacity style={styles.emptyButton} onPress={handleAddClient}>
              <Text style={styles.emptyButtonText}>Add First Client</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlashList
          data={filteredClients}
          renderItem={renderClientCard}
          keyExtractor={(item) => item.id}
          estimatedItemSize={120}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  addButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    color: '#FFFFFF',
    fontSize: 16,
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  statsText: {
    color: '#6B7280',
    fontSize: 14,
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  clientCard: {
    backgroundColor: '#1F1F1F',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  clientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  clientInfo: {
    flex: 1,
    marginLeft: 12,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  clientEmail: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  clientPhone: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  clientMeta: {
    alignItems: 'center',
  },
  photosBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 8,
  },
  photosCount: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  warningText: {
    color: '#F59E0B',
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  clientNotes: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#374151',
    color: '#9CA3AF',
    fontSize: 13,
    lineHeight: 18,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
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
  emptyButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 24,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});