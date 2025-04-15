import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Shield, Smartphone, Eye, TriangleAlert as AlertTriangle } from 'lucide-react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface SecuritySetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  icon: React.ComponentType<any>;
  color: string;
}

export default function SecurityScreen() {
  const [settings, setSettings] = useState<SecuritySetting[]>([
    {
      id: 'mask',
      title: 'Hide Balance',
      description: 'Mask account balance by default',
      enabled: true,
      icon: Eye,
      color: '#FF3B30',
    },
    {
      id: 'devices',
      title: 'Trust Device',
      description: 'Remember this device for future logins',
      enabled: true,
      icon: Smartphone,
      color: '#5856D6',
    },
  ]);

  const [recentActivity] = useState([
    {
      id: 1,
      device: 'iPhone 15 Pro',
      location: 'New York, USA',
      date: 'Today, 2:30 PM',
      status: 'success',
    },
    {
      id: 2,
      device: 'MacBook Pro',
      location: 'New York, USA',
      date: 'Today, 10:15 AM',
      status: 'success',
    },
    {
      id: 3,
      device: 'Unknown Device',
      location: 'London, UK',
      date: 'Yesterday, 8:45 PM',
      status: 'blocked',
    },
  ]);

  const toggleSetting = (id: string) => {
    setSettings(current =>
      current.map(setting =>
        setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
      )
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.title}>Security</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        <Animated.View 
          entering={FadeInDown.duration(400).springify()}
          style={styles.securityScore}
        >
          <View style={styles.scoreContent}>
            <Shield size={32} color="#32C759" />
            <View style={styles.scoreText}>
              <Text style={styles.scoreTitle}>Security Score: Excellent</Text>
              <Text style={styles.scoreDescription}>
                Your account is well-protected with multiple security features enabled
              </Text>
            </View>
          </View>
        </Animated.View>

        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Security Settings</Text>
          {settings.map((setting, index) => (
            <Animated.View
              key={setting.id}
              entering={FadeInDown.delay(index * 100).duration(400).springify()}
              style={styles.settingItem}
            >
              <View style={[styles.iconContainer, { backgroundColor: `${setting.color}15` }]}>
                <setting.icon size={24} color={setting.color} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>{setting.title}</Text>
                <Text style={styles.settingDescription}>{setting.description}</Text>
              </View>
              <Switch
                value={setting.enabled}
                onValueChange={() => toggleSetting(setting.id)}
                trackColor={{ false: '#D1D1D6', true: '#007AFF' }}
                thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : setting.enabled ? '#FFFFFF' : '#F4F4F5'}
              />
            </Animated.View>
          ))}
        </View>

        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {recentActivity.map((activity, index) => (
            <Animated.View
              key={activity.id}
              entering={FadeInDown.delay((index + settings.length) * 100).duration(400).springify()}
              style={styles.activityItem}
            >
              <View style={[
                styles.activityStatus,
                { backgroundColor: activity.status === 'success' ? '#34C75915' : '#FF3B3015' }
              ]}>
                {activity.status === 'success' ? (
                  <Smartphone size={24} color="#34C759" />
                ) : (
                  <AlertTriangle size={24} color="#FF3B30" />
                )}
              </View>
              <View style={styles.activityInfo}>
                <Text style={styles.activityDevice}>{activity.device}</Text>
                <Text style={styles.activityMeta}>
                  {activity.location} • {activity.date}
                </Text>
              </View>
              <Text style={[
                styles.activityStatusText,
                { color: activity.status === 'success' ? '#34C759' : '#FF3B30' }
              ]}>
                {activity.status === 'success' ? 'Success' : 'Blocked'}
              </Text>
            </Animated.View>
          ))}
        </View>

        <TouchableOpacity style={styles.passwordButton}>
          <Text style={styles.passwordButtonText}>Change Password</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
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
  content: {
    flex: 1,
  },
  securityScore: {
    margin: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
  },
  scoreContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  scoreText: {
    flex: 1,
  },
  scoreTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  scoreDescription: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#8E8E93',
  },
  settingsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#8E8E93',
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 8,
    marginHorizontal: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#1A1A1A',
  },
  settingDescription: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#8E8E93',
    marginTop: 4,
  },
  activitySection: {
    marginBottom: 20,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 1,
  },
  activityStatus: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  activityInfo: {
    flex: 1,
  },
  activityDevice: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  activityMeta: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#8E8E93',
  },
  activityStatusText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
  passwordButton: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  passwordButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#007AFF',
  },
});