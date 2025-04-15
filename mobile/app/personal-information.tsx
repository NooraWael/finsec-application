import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Camera, Check } from 'lucide-react-native';
import { router } from 'expo-router';
import { useUser } from '@/contexts/UserContext';
import { authApi } from '@/services/api';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function PersonalInformationScreen() {
  const { user, accessToken, updateUser, refreshProfile } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    preferredName: '',
    email: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    fetchProfile();
  }, [accessToken]);

  const fetchProfile = async () => {
    if (!accessToken) {
      setError('Authentication required');
      setIsLoading(false);
      return;
    }

    try {
      const profile = await authApi.getProfile(accessToken);
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        preferredName: profile.preferredName || '',
        email: profile.email || '',
        phone: profile.phone || '',
        address: profile.address || '',
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!accessToken) return;

    try {
      setIsSaving(true);
      setError(null);

      // Update profile
      await authApi.updateProfile(accessToken, formData);
      
      // Refresh profile data
      await refreshProfile();
      
      // Fetch latest profile data
      await fetchProfile();
      
      setIsEditing(false);
      
      // Show success message
      setError('Profile updated successfully');
      setTimeout(() => setError(null), 3000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = () => {
    if (!formData.firstName || !formData.lastName) return '??';
    return `${formData.firstName[0]}${formData.lastName[0]}`;
  };

  const renderField = (label: string, value: string, key: keyof typeof formData) => (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {isEditing ? (
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={(text) => setFormData(prev => ({ ...prev, [key]: text }))}
          placeholder={`Enter ${label.toLowerCase()}`}
          placeholderTextColor="#8E8E93"
        />
      ) : (
        <Text style={styles.fieldValue}>{value || 'Not provided'}</Text>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.title}>Personal Information</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.title}>Personal Information</Text>
        <TouchableOpacity 
          onPress={() => isEditing ? handleSave() : setIsEditing(true)}
          style={styles.editButton}
          disabled={isSaving}
        >
          {isEditing ? (
            isSaving ? (
              <ActivityIndicator size="small" color="#007AFF" />
            ) : (
              <Check size={24} color="#007AFF" />
            )
          ) : (
            <Text style={styles.editButtonText}>Edit</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {error && (
          <View style={[
            styles.errorBanner,
            { backgroundColor: error === 'Profile updated successfully' ? '#34C75915' : '#FF3B3015' }
          ]}>
            <Text style={[
              styles.errorText,
              { color: error === 'Profile updated successfully' ? '#34C759' : '#FF3B30' }
            ]}>
              {error}
            </Text>
          </View>
        )}

        <Animated.View 
          entering={FadeInDown.duration(400).springify()}
          style={styles.profileSection}
        >
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials()}</Text>
            </View>
            {isEditing && (
              <TouchableOpacity style={styles.cameraButton}>
                <Camera size={20} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          {renderField('First Name', formData.firstName, 'firstName')}
          {renderField('Last Name', formData.lastName, 'lastName')}
          {renderField('Preferred Name', formData.preferredName, 'preferredName')}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          {renderField('Email', formData.email, 'email')}
          {renderField('Phone', formData.phone, 'phone')}
          {renderField('Address', formData.address, 'address')}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Member Since</Text>
            <Text style={styles.fieldValue}>{user.memberSince || 'Not available'}</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Account Status</Text>
            <View style={[
              styles.statusBadge,
              { backgroundColor: user.status === 'active' ? '#34C75915' : '#FF3B3015' }
            ]}>
              <Text style={[
                styles.statusText,
                { color: user.status === 'active' ? '#34C759' : '#FF3B30' }
              ]}>
                {user.status || 'Unknown'}
              </Text>
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
    backgroundColor: '#F2F2F7',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#1A1A1A',
  },
  editButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  content: {
    flex: 1,
  },
  errorBanner: {
    padding: 16,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
  },
  profileSection: {
    alignItems: 'center',
    padding: 20,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 36,
    color: '#FFFFFF',
    fontFamily: 'Inter_600SemiBold',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#8E8E93',
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  field: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  fieldLabel: {
    fontSize: 14,
    color: '#8E8E93',
    fontFamily: 'Inter_500Medium',
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 16,
    color: '#1A1A1A',
    fontFamily: 'Inter_400Regular',
  },
  input: {
    fontSize: 16,
    color: '#1A1A1A',
    fontFamily: 'Inter_400Regular',
    padding: Platform.OS === 'ios' ? 0 : 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#8E8E93',
    fontFamily: 'Inter_500Medium',
  },
});