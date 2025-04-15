import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Bell, BellRing, BellOff, Smartphone, Mail, DollarSign, Shield, Gift } from 'lucide-react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  icon: React.ComponentType<any>;
  color: string;
}

export default function NotificationsScreen() {
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: 'push',
      title: 'Push Notifications',
      description: 'Receive notifications on your device',
      enabled: true,
      icon: Smartphone,
      color: '#007AFF',
    },
    {
      id: 'email',
      title: 'Email Notifications',
      description: 'Receive updates via email',
      enabled: true,
      icon: Mail,
      color: '#32C759',
    },
    {
      id: 'transactions',
      title: 'Transaction Alerts',
      description: 'Get notified about account activity',
      enabled: true,
      icon: DollarSign,
      color: '#FF9500',
    },
    {
      id: 'security',
      title: 'Security Alerts',
      description: 'Important security notifications',
      enabled: true,
      icon: Shield,
      color: '#FF3B30',
    },
    {
      id: 'promotions',
      title: 'Promotions & Offers',
      description: 'Special deals and promotional offers',
      enabled: false,
      icon: Gift,
      color: '#AF52DE',
    },
  ]);

  const [masterSwitch, setMasterSwitch] = useState(true);

  const toggleSetting = (id: string) => {
    setSettings(current =>
      current.map(setting =>
        setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
      )
    );
  };

  const toggleAllSettings = (value: boolean) => {
    setMasterSwitch(value);
    setSettings(current =>
      current.map(setting => ({ ...setting, enabled: value }))
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
        <Text style={styles.title}>Notifications</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        <Animated.View 
          entering={FadeInDown.duration(400).springify()}
          style={styles.masterSwitchSection}
        >
          <View style={styles.masterSwitchContent}>
            {masterSwitch ? (
              <BellRing size={32} color="#007AFF" />
            ) : (
              <BellOff size={32} color="#8E8E93" />
            )}
            <View style={styles.masterSwitchText}>
              <Text style={styles.masterSwitchTitle}>
                {masterSwitch ? 'Notifications Enabled' : 'Notifications Disabled'}
              </Text>
              <Text style={styles.masterSwitchDescription}>
                {masterSwitch 
                  ? 'You will receive important updates' 
                  : 'You won\'t receive any notifications'}
              </Text>
            </View>
            <Switch
              value={masterSwitch}
              onValueChange={toggleAllSettings}
              trackColor={{ false: '#D1D1D6', true: '#007AFF' }}
              thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : masterSwitch ? '#FFFFFF' : '#F4F4F5'}
            />
          </View>
        </Animated.View>

        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Notification Preferences</Text>
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
                value={masterSwitch && setting.enabled}
                onValueChange={() => toggleSetting(setting.id)}
                disabled={!masterSwitch}
                trackColor={{ false: '#D1D1D6', true: '#007AFF' }}
                thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : setting.enabled ? '#FFFFFF' : '#F4F4F5'}
              />
            </Animated.View>
          ))}
        </View>

        <Text style={styles.footer}>
          You can manage your notification preferences at any time. Some notifications cannot be disabled as they contain important account information.
        </Text>
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
  masterSwitchSection: {
    margin: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
  },
  masterSwitchContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  masterSwitchText: {
    flex: 1,
  },
  masterSwitchTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  masterSwitchDescription: {
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
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#8E8E93',
  },
  footer: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#8E8E93',
    textAlign: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
  },
});