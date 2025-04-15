import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MessageCircle, Phone, Mail, Globe, FileText, CircleHelp as HelpCircle, ArrowUpRight } from 'lucide-react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface SupportOption {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  action: () => void;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export default function HelpCenterScreen() {
  const supportOptions: SupportOption[] = [
    {
      id: 'chat',
      title: 'Live Chat',
      description: 'Chat with our support team',
      icon: MessageCircle,
      color: '#007AFF',
      action: () => Linking.openURL('https://support.finsec.com/chat'),
    },
    {
      id: 'call',
      title: 'Call Us',
      description: 'Available 24/7',
      icon: Phone,
      color: '#34C759',
      action: () => Linking.openURL('tel:+18005551234'),
    },
    {
      id: 'email',
      title: 'Email Support',
      description: 'Response within 24 hours',
      icon: Mail,
      color: '#FF9500',
      action: () => Linking.openURL('mailto:support@finsec.com'),
    },
    {
      id: 'website',
      title: 'Support Center',
      description: 'Browse help articles',
      icon: Globe,
      color: '#5856D6',
      action: () => Linking.openURL('https://support.finsec.com'),
    },
  ];

  const faqItems: FAQItem[] = [
    {
      id: '1',
      question: 'How do I reset my password?',
      answer: 'To reset your password, go to the login screen and tap "Forgot Password". Follow the instructions sent to your email.',
    },
    {
      id: '2',
      question: 'How do I report unauthorized transactions?',
      answer: 'If you notice any unauthorized transactions, immediately contact our 24/7 support line or freeze your card through the app.',
    },
    {
      id: '3',
      question: 'What are the daily transaction limits?',
      answer: 'Daily limits vary by account type. Check your account settings or contact support for your specific limits.',
    },
    {
      id: '4',
      question: 'How do I update my contact information?',
      answer: 'You can update your contact information in the Personal Information section under Settings.',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.title}>Help Center</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        <Animated.View 
          entering={FadeInDown.duration(400).springify()}
          style={styles.supportCard}
        >
          <HelpCircle size={32} color="#007AFF" />
          <Text style={styles.supportTitle}>How can we help you?</Text>
          <Text style={styles.supportDescription}>
            Choose from the options below to get the support you need
          </Text>
        </Animated.View>

        <View style={styles.supportOptionsSection}>
          <Text style={styles.sectionTitle}>Contact Support</Text>
          {supportOptions.map((option, index) => (
            <Animated.View
              key={option.id}
              entering={FadeInDown.delay(index * 100).duration(400).springify()}
            >
              <TouchableOpacity 
                style={styles.supportOption}
                onPress={option.action}
              >
                <View style={[styles.iconContainer, { backgroundColor: `${option.color}15` }]}>
                  <option.icon size={24} color={option.color} />
                </View>
                <View style={styles.optionInfo}>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionDescription}>{option.description}</Text>
                </View>
                <ArrowUpRight size={20} color="#8E8E93" />
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        <View style={styles.faqSection}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          {faqItems.map((item, index) => (
            <Animated.View
              key={item.id}
              entering={FadeInDown.delay((index + supportOptions.length) * 100).duration(400).springify()}
              style={styles.faqItem}
            >
              <View style={styles.faqHeader}>
                <FileText size={20} color="#007AFF" />
                <Text style={styles.faqQuestion}>{item.question}</Text>
              </View>
              <Text style={styles.faqAnswer}>{item.answer}</Text>
            </Animated.View>
          ))}
        </View>

        <TouchableOpacity 
          style={styles.documentationButton}
          onPress={() => Linking.openURL('https://docs.finsec.com')}
        >
          <Text style={styles.documentationButtonText}>View Full Documentation</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>
          Our support team is available 24/7 to assist you with any questions or concerns you may have.
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
  supportCard: {
    margin: 20,
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    alignItems: 'center',
  },
  supportTitle: {
    fontSize: 24,
    fontFamily: 'Inter_600SemiBold',
    color: '#1A1A1A',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  supportDescription: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#8E8E93',
    textAlign: 'center',
  },
  supportOptionsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#8E8E93',
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 8,
    marginHorizontal: 20,
  },
  supportOption: {
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
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#8E8E93',
  },
  faqSection: {
    marginBottom: 24,
  },
  faqItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 1,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#1A1A1A',
  },
  faqAnswer: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#8E8E93',
    marginLeft: 32,
  },
  documentationButton: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  documentationButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#007AFF',
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