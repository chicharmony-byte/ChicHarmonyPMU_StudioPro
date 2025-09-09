import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

export default function AIDesignPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const handleImagePicker = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant photo library permissions.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].base64!);
        setAnalysisResult(null);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image.');
    }
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera permissions.');
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
        setSelectedImage(result.assets[0].base64!);
        setAnalysisResult(null);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo.');
    }
  };

  const handleAnalysis = async (type: 'symmetry' | 'color' | 'complete') => {
    if (!selectedImage) {
      Alert.alert('No Image', 'Please select an image first.');
      return;
    }

    setAnalyzing(true);
    try {
      // Use new AI endpoints directly
      const endpoint = type === 'complete' 
        ? '/api/ai-design/complete-analysis'
        : '/api/ai-design/analyze-photo';
      
      const requestData = type === 'complete'
        ? {
            photo_base64: selectedImage,
            client_info: {
              age: "25-35",
              skin_type: "normal",
              previous_treatments: "ninguno",
              preferences: "natural"
            }
          }
        : {
            photo_base64: selectedImage,
            analysis_type: type
          };

      const response = await axios.post(`${BACKEND_URL}${endpoint}`, requestData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      setAnalysisResult(response.data);
    } catch (error: any) {
      console.error('AI Analysis Error:', error);
      Alert.alert(
        'Analysis Error',
        error.response?.data?.detail || 'Failed to analyze image. Please try again.'
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const renderAnalysisResult = () => {
    if (!analysisResult) return null;

    // Handle complete analysis results
    if (analysisResult.success && analysisResult.analysis) {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Analysis Results</Text>
          
          {/* Analysis Summary */}
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              <Text style={styles.resultTitle}>Complete Analysis</Text>
            </View>

            {/* Facial Analysis */}
            {analysisResult.analysis.facial_analysis && (
              <View style={styles.resultSection}>
                <Text style={styles.resultSectionTitle}>📏 Facial Analysis</Text>
                <Text style={styles.resultText}>
                  • Face Shape: {analysisResult.analysis.facial_analysis.face_shape || 'N/A'}
                </Text>
                <Text style={styles.resultText}>
                  • Symmetry Score: {analysisResult.analysis.facial_analysis.symmetry_score || 'N/A'}%
                </Text>
              </View>
            )}

            {/* Recommendations */}
            {analysisResult.recommendations && (
              <View style={styles.resultSection}>
                <Text style={styles.resultSectionTitle}>💡 Recommendations</Text>
                {analysisResult.recommendations.pigment_colors && (
                  <Text style={styles.resultText}>
                    • Primary Color: {analysisResult.recommendations.pigment_colors.primary}
                  </Text>
                )}
                {analysisResult.recommendations.technique && (
                  <Text style={styles.resultText}>
                    • Technique: {analysisResult.recommendations.technique.primary_technique}
                  </Text>
                )}
              </View>
            )}

            {/* Treatment Plan */}
            {analysisResult.treatment_plan && (
              <View style={styles.resultSection}>
                <Text style={styles.resultSectionTitle}>📋 Treatment Plan</Text>
                <Text style={styles.resultText}>
                  • Sessions: {analysisResult.treatment_plan.during_treatment?.estimated_time || 'N/A'}
                </Text>
                <Text style={styles.resultText}>
                  • Follow-up: {analysisResult.treatment_plan.follow_up?.touch_up_date || 'N/A'}
                </Text>
              </View>
            )}
          </View>
        </View>
      );
    }

    // Handle legacy analysis results
    if (analysisResult.ai_response || analysisResult.analysis_type) {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Analysis Result</Text>
          
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              <Text style={styles.resultTitle}>
                {analysisResult.analysis_type || 'Analysis'} Complete
              </Text>
            </View>
            
            <ScrollView style={styles.resultContent}>
              <Text style={styles.resultText}>
                {analysisResult.ai_response || JSON.stringify(analysisResult, null, 2)}
              </Text>
            </ScrollView>
          </View>
        </View>
      );
    }

    return null;
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
        <Text style={styles.headerTitle}>AI Design Tools</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Image Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Image for Analysis</Text>
          
          {selectedImage ? (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: `data:image/jpeg;base64,${selectedImage}` }}
                style={styles.selectedImage}
              />
              <TouchableOpacity
                style={styles.changeImageButton}
                onPress={() => setSelectedImage(null)}
              >
                <Ionicons name="close-circle" size={24} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="camera-outline" size={48} color="#6B7280" />
              <Text style={styles.placeholderText}>No image selected</Text>
            </View>
          )}

          <View style={styles.imageActions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleTakePhoto}>
              <Ionicons name="camera" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleImagePicker}>
              <Ionicons name="images" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>From Gallery</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Analysis Tools */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Analysis Tools</Text>
          
          {/* Complete Analysis - NEW */}
          <TouchableOpacity
            style={[styles.analysisCard, styles.completeCard]}
            onPress={() => handleAnalysis('complete')}
            disabled={!selectedImage || analyzing}
          >
            <View style={styles.analysisHeader}>
              <Ionicons name="sparkles-outline" size={28} color="#E879F9" />
              <View style={styles.analysisInfo}>
                <Text style={styles.analysisTitle}>Complete Analysis</Text>
                <Text style={styles.analysisDescription}>
                  Comprehensive facial analysis + personalized recommendations
                </Text>
              </View>
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumText}>PRO</Text>
              </View>
            </View>
            {analyzing && (
              <Text style={styles.analyzingText}>Analyzing...</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.analysisCard, styles.symmetryCard]}
            onPress={() => handleAnalysis('symmetry')}
            disabled={!selectedImage || analyzing}
          >
            <View style={styles.analysisHeader}>
              <Ionicons name="analytics-outline" size={28} color="#8B5CF6" />
              <View style={styles.analysisInfo}>
                <Text style={styles.analysisTitle}>Facial Symmetry</Text>
                <Text style={styles.analysisDescription}>
                  Analyze facial symmetry for eyebrow design
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#8B5CF6" />
            </View>
            {analyzing && (
              <Text style={styles.analyzingText}>Analyzing...</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.analysisCard, styles.colorCard]}
            onPress={() => handleAnalysis('color')}
            disabled={!selectedImage || analyzing}
          >
            <View style={styles.analysisHeader}>
              <Ionicons name="color-palette-outline" size={28} color="#06B6D4" />
              <View style={styles.analysisInfo}>
                <Text style={styles.analysisTitle}>Color Analysis</Text>
                <Text style={styles.analysisDescription}>
                  Skin tone analysis & pigment recommendations
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#06B6D4" />
            </View>
            {analyzing && (
              <Text style={styles.analyzingText}>Analyzing...</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Analysis Results */}
        {renderAnalysisResult()}

        {/* Coming Soon Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Coming Soon</Text>
          
          <View style={[styles.analysisCard, styles.disabledCard]}>
            <View style={styles.analysisHeader}>
              <Ionicons name="brush-outline" size={28} color="#6B7280" />
              <View style={styles.analysisInfo}>
                <Text style={[styles.analysisTitle, styles.disabledText]}>
                  Design Simulator
                </Text>
                <Text style={[styles.analysisDescription, styles.disabledText]}>
                  Virtual eyebrow & lip design preview
                </Text>
              </View>
            </View>
          </View>

          <View style={[styles.analysisCard, styles.disabledCard]}>
            <View style={styles.analysisHeader}>
              <Ionicons name="color-filter-outline" size={28} color="#6B7280" />
              <View style={styles.analysisInfo}>
                <Text style={[styles.analysisTitle, styles.disabledText]}>
                  Pigment Mixer
                </Text>
                <Text style={[styles.analysisDescription, styles.disabledText]}>
                  Custom pigment mixing calculator
                </Text>
              </View>
            </View>
          </View>
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
  content: {
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
  imageContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 16,
  },
  selectedImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    backgroundColor: '#1F1F1F',
  },
  changeImageButton: {
    position: 'absolute',
    top: -8,
    right: '35%',
    backgroundColor: '#0F0F0F',
    borderRadius: 12,
    padding: 4,
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#374151',
    borderStyle: 'dashed',
    marginBottom: 16,
  },
  placeholderText: {
    color: '#6B7280',
    fontSize: 16,
    marginTop: 12,
  },
  imageActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    flex: 0.48,
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  analysisCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
  },
  symmetryCard: {
    backgroundColor: '#1F1F1F',
    borderColor: '#8B5CF6',
  },
  colorCard: {
    backgroundColor: '#1F1F1F',
    borderColor: '#06B6D4',
  },
  disabledCard: {
    backgroundColor: '#111111',
    borderColor: '#374151',
  },
  analysisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  analysisInfo: {
    flex: 1,
    marginLeft: 16,
  },
  analysisTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  analysisDescription: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  disabledText: {
    color: '#6B7280',
  },
  analyzingText: {
    fontSize: 14,
    color: '#8B5CF6',
    marginTop: 12,
    fontStyle: 'italic',
  },
  resultContainer: {
    backgroundColor: '#1F1F1F',
    borderRadius: 16,
    padding: 20,
    margin: 20,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
    marginBottom: 12,
  },
  resultContent: {
    backgroundColor: '#0F0F0F',
    borderRadius: 8,
    padding: 12,
  },
  resultText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  resultDetails: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'monospace',
  },
  resultCard: {
    backgroundColor: '#1F1F1F',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultSection: {
    marginBottom: 16,
  },
  resultSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  completeCard: {
    backgroundColor: '#1F1F1F',
    borderColor: '#E879F9',
  },
  premiumBadge: {
    backgroundColor: '#E879F9',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  premiumText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});