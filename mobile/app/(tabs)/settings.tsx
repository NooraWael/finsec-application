import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight, User, Bell, Shield, CreditCard, CircleHelp as HelpCircle, LogOut } from 'lucide-react-native';
import { useUser } from '@/contexts/UserContext';
import { router } from 'expo-router';

export default function SettingsScreen() {
  const { user, signOut } = useUser();

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

  const settingsSections = [
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Personal Information', onPress: navigateToPersonalInfo },
        { icon: Bell, label: 'Notifications', onPress: navigateToNotifications },
        { icon: Shield, label: 'Security', onPress: navigateToSecurity },
        { icon: CreditCard, label: 'Payment Methods', onPress: navigateToPaymentMethods },
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
    marginBottom: 24,
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