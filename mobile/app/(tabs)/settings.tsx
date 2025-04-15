import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ChevronRight, 
  User, 
  Bell, 
  Shield, 
  CreditCard, 
  CircleHelp as HelpCircle, 
  LogOut,
  Lock,
  Key,
  AlertTriangle
} from 'lucide-react-native';
import { useUser } from '@/contexts/UserContext';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

export default function SettingsScreen() {
  const { user, signOut } = useUser();
  const [securityLevel, setSecurityLevel] = useState('Level 1');

  // Load security level from AsyncStorage when component mounts
  useEffect(() => {
    const loadSecurityLevel = async () => {
      try {
        const savedLevel = await AsyncStorage.getItem('securityLevel');
        if (savedLevel) {
          setSecurityLevel(savedLevel);
        }
      } catch (error) {
        console.error('Error loading security level:', error);
      }
    };
    
    loadSecurityLevel();
  }, []);

  const handleSignOut = () => {
    if (Platform.OS === 'web') {
      // On web, sign out immediately without confirmation
      signOut();
    } else {
      Alert.alert(
        'Sign Out',
        'Are you sure you want to sign out?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Sign Out',
            style: 'destructive',
            onPress: signOut,
          },
        ],
        { cancelable: true }
      );
    }
  };

  const navigateToPersonalInfo = () => {
    router.push('/personal-information');
  };

  const navigateToNotifications = () => {
    router.push('/notifications');
  };

  const navigateToSecurity = () => {
    router.push('/security');
  };

  const navigateToPaymentMethods = () => {
    router.push('/payment-methods');
  };

  const navigateToHelpCenter = () => {
    router.push('/help-center');
  };

  const navigateToSecurityCenter = () => {
    router.push('/info');
  };
  
  const getSecurityLevelColor = () => {
    switch (securityLevel) {
      case 'Level 1':
        return '#FF3B30'; // Red - Novice
      case 'Level 2':
        return '#FF9500'; // Orange - Apprentice
      case 'Level 3':
        return '#34C759'; // Green - Protector
      case 'Master':
        return '#007AFF'; // Blue - Master
      default:
        return '#8E8E93'; // Gray - Default
    }
  };
  
  const getSecurityLevelTitle = () => {
    switch (securityLevel) {
      case 'Level 1':
        return 'Security Novice';
      case 'Level 2':
        return 'Security Apprentice';
      case 'Level 3':
        return 'Security Protector';
      case 'Master':
        return 'Data Protector Master';
      default:
        return 'Security Novice';
    }
  };

  const settingsSections = [
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Personal Information', onPress: navigateToPersonalInfo },
        { icon: Bell, label: 'Notifications', onPress: navigateToNotifications },
        { icon: Shield, label: 'Security', onPress: navigateToSecurity },
        { icon: CreditCard, label: 'Payment Methods', onPress: navigateToPaymentMethods },
        // Removed the regular security education item, as we're replacing it with a more prominent feature
      ]
    },
    {
      title: 'Support',
      items: [
        { icon: HelpCircle, label: 'Help Center', onPress: navigateToHelpCenter },
        { 
          icon: LogOut, 
          label: 'Sign Out', 
          danger: true,
          onPress: handleSignOut 
        }
      ]
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      {/* Profile Section */}
      <TouchableOpacity 
        style={styles.profileSection}
        onPress={navigateToPersonalInfo}
      >
        <View style={styles.profileAvatar}>
          <Text style={styles.avatarText}>
            {user.firstName[0]}{user.lastName[0]}
          </Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{user.firstName} {user.lastName}</Text>
          <Text style={styles.profileEmail}>{user.email}</Text>
        </View>
        <ChevronRight size={20} color="#8E8E93" />
      </TouchableOpacity>
      
      {/* Enhanced Security Education Section */}
      <TouchableOpacity
        style={styles.securityEducationContainer}
        onPress={navigateToSecurityCenter}
      >
        <View style={styles.securityEducationHeader}>
          <View style={[styles.securityIconContainer, { backgroundColor: `${getSecurityLevelColor()}15` }]}>
            <Shield size={24} color={getSecurityLevelColor()} />
          </View>
          <View style={styles.securityEducationTitleContainer}>
            <Text style={styles.securityEducationTitle}>Security Center</Text>
            <View style={[styles.securityLevelBadge, { backgroundColor: getSecurityLevelColor() }]}>
              <Text style={styles.securityLevelText}>{getSecurityLevelTitle()}</Text>
            </View>
          </View>
          <ChevronRight size={20} color="#8E8E93" />
        </View>
        
        <View style={styles.securityFeatures}>
          <View style={styles.securityFeatureItem}>
            <View style={[styles.miniIconContainer, { backgroundColor: '#007AFF15' }]}>
              <Lock size={16} color="#007AFF" />
            </View>
            <Text style={styles.securityFeatureText}>Password Security</Text>
          </View>
          
          <View style={styles.securityFeatureItem}>
            <View style={[styles.miniIconContainer, { backgroundColor: '#FF950015' }]}>
              <AlertTriangle size={16} color="#FF9500" />
            </View>
            <Text style={styles.securityFeatureText}>Phishing Protection</Text>
          </View>
          
          <View style={styles.securityFeatureItem}>
            <View style={[styles.miniIconContainer, { backgroundColor: '#34C75915' }]}>
              <Key size={16} color="#34C759" />
            </View>
            <Text style={styles.securityFeatureText}>Account Safety</Text>
          </View>
        </View>
        
        <View style={styles.securityEducationFooter}>
          <Text style={styles.securityEducationDescription}>
            Learn how to protect your account and improve your security level
          </Text>
        </View>
      </TouchableOpacity>

      {/* Settings List */}
      <ScrollView style={styles.settingsList}>
        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.settingsSection}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionItems}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={styles.settingsItem}
                  onPress={item.onPress}
                >
                  <View style={styles.settingsItemLeft}>
                    <item.icon
                      size={20}
                      color={item.danger ? '#FF3B30' : '#1A1A1A'}
                    />
                    <Text
                      style={[
                        styles.settingsItemLabel,
                        item.danger && styles.dangerText
                      ]}
                    >
                      {item.label}
                    </Text>
                  </View>
                  <ChevronRight
                    size={20}
                    color={item.danger ? '#FF3B30' : '#8E8E93'}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* App Version */}
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter_600SemiBold',
    color: '#1A1A1A',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontFamily: 'Inter_600SemiBold',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 18,
    color: '#1A1A1A',
    fontFamily: 'Inter_600SemiBold',
  },
  profileEmail: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
    fontFamily: 'Inter_400Regular',
  },
  // Enhanced Security Education styles
  securityEducationContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  securityEducationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  securityIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5F1FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  securityEducationTitleContainer: {
    flex: 1,
    marginLeft: 16,
  },
  securityEducationTitle: {
    fontSize: 18,
    color: '#1A1A1A',
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 4,
  },
  securityLevelBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: '#007AFF',
  },
  securityLevelText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: 'Inter_500Medium',
  },
  securityFeatures: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  securityFeatureItem: {
    alignItems: 'center',
    width: '30%',
  },
  miniIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  securityFeatureText: {
    fontSize: 11,
    color: '#1A1A1A',
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
  },
  securityEducationFooter: {
    backgroundColor: '#F8F8F8',
    padding: 12,
  },
  securityEducationDescription: {
    fontSize: 13,
    color: '#666666',
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
  // Original settings styles
  settingsList: {
    flex: 1,
  },
  settingsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginLeft: 20,
    marginBottom: 8,
    fontFamily: 'Inter_600SemiBold',
  },
  sectionItems: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 12,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsItemLabel: {
    fontSize: 16,
    color: '#1A1A1A',
    fontFamily: 'Inter_500Medium',
  },
  dangerText: {
    color: '#FF3B30',
  },
  versionContainer: {
    padding: 20,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 14,
    color: '#8E8E93',
    fontFamily: 'Inter_400Regular',
  },
});