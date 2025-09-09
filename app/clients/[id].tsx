import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';

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
  photos: Photo[];
  created_at: string;
  updated_at: string;
}

interface Photo {
  id: string;
  photo_base64: string;
  photo_type: string;
  uploaded_at: string;
}

export default function ClientDetailPage() {
  const { id } = useLocalSearchParams();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [analysisLoading, setAnalysisLoading] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchClient();
    }
  }, [id]);

  const fetchClient = async () => {
    try {
      setLoading(true);
      console.log('Fetching client:', `${BACKEND_URL}/api/clients/${id}`);
      const response = await axios.get(`${BACKEND_URL}/api/clients/${id}`);
      setClient(response.data);
    } catch (error) {
      console.error('Error fetching client:', error);
      Alert.alert('Error', 'Failed to fetch client details.');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleAddPhoto = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera roll permissions to upload photos.');
        return;
      }

      // Show action sheet
      Alert.alert(
        'Add Photo',
        'Choose an option',
        [
          { text: 'Camera', onPress: () => takePhoto() },
          { text: 'Photo Library', onPress: () => pickPhoto() },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    } catch (error) {
      console.error('Error requesting permissions:', error);
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera permissions to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadPhoto(result.assets[0].base64!, 'before');
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo.');
    }
  };

  const pickPhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadPhoto(result.assets[0].base64!, 'before');
      }
    } catch (error) {
      console.error('Error picking photo:', error);
      Alert.alert('Error', 'Failed to pick photo.');
    }
  };

  const uploadPhoto = async (base64: string, photoType: string = 'general') => {
    try {
      if (!client) return;

      console.log('Uploading photo for client:', client.id);
      
      const response = await axios.post(
        `${BACKEND_URL}/api/clients/${client.id}/photos`,
        null,
        {
          params: {
            photo_base64: base64,
            photo_type: photoType,
          },
        }
      );

      Alert.alert('Success', 'Photo uploaded successfully!');
      fetchClient(); // Refresh client data
    } catch (error) {
      console.error('Error uploading photo:', error);
      Alert.alert('Error', 'Failed to upload photo.');
    }
  };

  const analyzePhoto = async (photo: Photo, analysisType: 'symmetry' | 'color') => {
    try {
      if (!client) return;

      setAnalysisLoading(photo.id);
      
      console.log('Analyzing photo:', photo.id, 'Type:', analysisType);
      
      const response = await axios.post(
        `${BACKEND_URL}/api/clients/${client.id}/photos/${photo.id}/analyze`,
        null,
        {
          params: {
            analysis_type: analysisType,
          },
        }
      );

      Alert.alert(
        'AI Analysis Result',
        JSON.stringify(response.data, null, 2),
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('Error analyzing photo:', error);
      Alert.alert(
        'Analysis Error',
        error.response?.data?.detail || 'Failed to analyze photo.'
      );
    } finally {
      setAnalysisLoading(null);
    }
  };

  const renderInfoSection = (title: string, items: { label: string; value?: string }[]) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.infoContainer}>
        {items.map((item, index) => (
          item.value ? (
            <View key={index} style={styles.infoRow}>
              <Text style={styles.infoLabel}>{item.label}:</Text>
              <Text style={styles.infoValue}>{item.value}</Text>
            </View>
          ) : null
        ))}
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading client...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!client) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Client not found</Text>
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
        <Text style={styles.headerTitle}>
          {client.first_name} {client.last_name}
        </Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => router.push(`/clients/${client.id}/edit`)}
        >
          <Ionicons name="create-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Client Info */}
        {renderInfoSection('Contact Information', [
          { label: 'Email', value: client.email },
          { label: 'Phone', value: client.phone },
          { label: 'Date of Birth', value: client.date_of_birth },
        ])}

        {renderInfoSection('Physical Characteristics', [
          { label: 'Skin Tone', value: client.skin_tone },
          { label: 'Hair Color', value: client.hair_color },
          { label: 'Eye Color', value: client.eye_color },
        ])}

        {renderInfoSection('Medical Information', [
          { label: 'Allergies', value: client.allergies },
          { label: 'Medical Conditions', value: client.medical_conditions },
        ])}

        {client.notes && renderInfoSection('Notes', [
          { label: 'Additional Notes', value: client.notes },
        ])}

        {/* Photos Section */}
        <View style={styles.section}>
          <View style={styles.photosHeader}>
            <Text style={styles.sectionTitle}>Photos ({client.photos.length})</Text>
            <TouchableOpacity style={styles.addPhotoButton} onPress={handleAddPhoto}>
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.addPhotoText}>Add Photo</Text>
            </TouchableOpacity>
          </View>

          {client.photos.length === 0 ? (
            <View style={styles.emptyPhotos}>
              <Ionicons name="camera-outline" size={48} color="#374151" />
              <Text style={styles.emptyPhotosText}>No photos yet</Text>
              <Text style={styles.emptyPhotosSubtext}>Add photos to start AI analysis</Text>
            </View>
          ) : (
            <View style={styles.photosGrid}>
              {client.photos.map((photo) => (
                <View key={photo.id} style={styles.photoCard}>
                  <Image
                    source={{ uri: `data:image/jpeg;base64,${photo.photo_base64}` }}
                    style={styles.photoImage}
                  />
                  <View style={styles.photoInfo}>
                    <Text style={styles.photoType}>{photo.photo_type}</Text>
                    <Text style={styles.photoDate}>
                      {new Date(photo.uploaded_at).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.photoActions}>
                    <TouchableOpacity
                      style={styles.analyzeButton}
                      onPress={() => analyzePhoto(photo, 'symmetry')}
                      disabled={analysisLoading === photo.id}
                    >
                      <Ionicons name="analytics-outline" size={16} color="#8B5CF6" />
                      <Text style={styles.analyzeButtonText}>
                        {analysisLoading === photo.id ? 'Analyzing...' : 'Symmetry'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.analyzeButton}
                      onPress={() => analyzePhoto(photo, 'color')}
                      disabled={analysisLoading === photo.id}
                    >
                      <Ionicons name="color-palette-outline" size={16} color="#06B6D4" />
                      <Text style={styles.analyzeButtonText}>
                        {analysisLoading === photo.id ? 'Analyzing...' : 'Color'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
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
  infoContainer: {
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    width: 120,
  },
  infoValue: {
    fontSize: 14,
    color: '#FFFFFF',
    flex: 1,
  },
  photosHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addPhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  addPhotoText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  emptyPhotos: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
  },
  emptyPhotosText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 12,
  },
  emptyPhotosSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  photoCard: {
    width: '50%',
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  photoImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    backgroundColor: '#1F1F1F',
  },
  photoInfo: {
    marginTop: 8,
  },
  photoType: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  photoDate: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  photoActions: {
    flexDirection: 'row',
    marginTop: 8,
    justifyContent: 'space-between',
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F1F1F',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    flex: 0.48,
  },
  analyzeButtonText: {
    fontSize: 10,
    color: '#D1D5DB',
    marginLeft: 4,
  },
});