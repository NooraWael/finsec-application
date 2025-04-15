import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Users } from 'lucide-react-native';

export default function SendScreen() {
  const contacts = [
    { id: 1, name: 'Sarah Johnson', account: '**** 1234' },
    { id: 2, name: 'Michael Brown', account: '**** 5678' },
    { id: 3, name: 'Emma Davis', account: '**** 9012' },
    { id: 4, name: 'James Wilson', account: '**** 3456' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Send Money</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#8E8E93" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search contacts or enter account number"
            placeholderTextColor="#8E8E93"
          />
        </View>
      </View>

      {/* Quick Send Section */}
      <View style={styles.quickSendSection}>
        <Text style={styles.sectionTitle}>Quick Send</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.contactsScroll}>
          <TouchableOpacity style={styles.addContactButton}>
            <View style={styles.addIconContainer}>
              <Users size={24} color="#007AFF" />
            </View>
            <Text style={styles.addContactText}>New</Text>
          </TouchableOpacity>
          {contacts.map((contact) => (
            <TouchableOpacity key={contact.id} style={styles.contactButton}>
              <View style={styles.contactAvatar}>
                <Text style={styles.avatarText}>{contact.name[0]}</Text>
              </View>
              <Text style={styles.contactName}>{contact.name.split(' ')[0]}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Recent Recipients */}
      <View style={styles.recentSection}>
        <Text style={styles.sectionTitle}>Recent Recipients</Text>
        <View style={styles.recipientsList}>
          {contacts.map((contact) => (
            <TouchableOpacity key={contact.id} style={styles.recipientItem}>
              <View style={styles.recipientAvatar}>
                <Text style={styles.avatarText}>{contact.name[0]}</Text>
              </View>
              <View style={styles.recipientInfo}>
                <Text style={styles.recipientName}>{contact.name}</Text>
                <Text style={styles.accountNumber}>{contact.account}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
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
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#1A1A1A',
  },
  quickSendSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  contactsScroll: {
    flexDirection: 'row',
  },
  addContactButton: {
    alignItems: 'center',
    marginRight: 16,
  },
  addIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E5F1FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  addContactText: {
    fontSize: 12,
    color: '#007AFF',
    fontFamily: 'Inter_500Medium',
  },
  contactButton: {
    alignItems: 'center',
    marginRight: 16,
  },
  contactAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontFamily: 'Inter_600SemiBold',
  },
  contactName: {
    fontSize: 12,
    color: '#1A1A1A',
    fontFamily: 'Inter_500Medium',
  },
  recentSection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  recipientsList: {
    gap: 12,
  },
  recipientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
  },
  recipientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recipientInfo: {
    flex: 1,
  },
  recipientName: {
    fontSize: 16,
    color: '#1A1A1A',
    fontFamily: 'Inter_500Medium',
    marginBottom: 4,
  },
  accountNumber: {
    fontSize: 14,
    color: '#8E8E93',
    fontFamily: 'Inter_400Regular',
  },
});