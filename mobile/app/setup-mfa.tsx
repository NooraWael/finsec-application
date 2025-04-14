import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, QrCode, Shield, Copy, CircleCheck as CheckCircle2 } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { API_CONFIG } from '@/config/api';
import { useUser } from '@/contexts/UserContext';

interface MfaSetupResponse {
  message: string;
  mfa_secret: string;
  totp_uri: string;
}

export default function SetupMFAScreen() {
  const { user, signOut } = useUser();
  const params = useLocalSearchParams<{
    userId: string;
  }>();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mfaData, setMfaData] = useState<MfaSetupResponse | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    generateMfaSecret();
  }, []);

  const generateMfaSecret = async () => {
    setIsLoading(true);
    setError(null);

    const userId = params.userId || user.id;

    if (!userId) {
      setError('User ID not found');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GENERATE_MFA}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: userId.toString() }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate MFA secret');
      }

      const data = await response.json();
      setMfaData(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to generate MFA secret');
    } finally {
      setIsLoading(false);
    }
  };

  const getQRCodeUrl = (totpUri: string) => {
    const baseUrl = 'https://api.qrserver.com/v1/create-qr-code/';
    const params = new URLSearchParams({
      size: '200x200',
      data: totpUri,
    });
    return `${baseUrl}?${params.toString()}`;
  };

  const copySecretToClipboard = () => {
    if (mfaData?.mfa_secret && Platform.OS === 'web') {
      navigator.clipboard.writeText(mfaData.mfa_secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleProceed = async () => {
    // Sign out the user and redirect to login
    await signOut();
    router.replace('/login');
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Generating MFA Secret...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={generateMfaSecret}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
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
        <Text style={styles.title}>Setup 2FA</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.contentContainer}>
          <Animated.View 
            entering={FadeInDown.duration(400).springify()}
            style={styles.card}
          >
            <Shield size={48} color="#007AFF" />
            <Text style={styles.cardTitle}>
              Two-Factor Authentication
            </Text>
            <Text style={styles.cardDescription}>
              Scan the QR code below with your authenticator app to enable two-factor authentication.
            </Text>
          </Animated.View>

          {mfaData && (
            <Animated.View 
              entering={FadeInDown.delay(200).duration(400).springify()}
              style={styles.qrContainer}
            >
              <View style={styles.qrHeader}>
                <QrCode size={24} color="#1A1A1A" />
                <Text style={styles.qrTitle}>Scan QR Code</Text>
              </View>
              
              <View style={styles.qrWrapper}>
                <Image
                  source={{ uri: getQRCodeUrl(mfaData.totp_uri) }}
                  style={styles.qrCode}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.secretContainer}>
                <Text style={styles.secretLabel}>Manual Entry Code:</Text>
                <View style={styles.secretRow}>
                  <Text style={styles.secretText} numberOfLines={1} ellipsizeMode="middle">
                    {mfaData.mfa_secret}
                  </Text>
                  {Platform.OS === 'web' && (
                    <TouchableOpacity 
                      style={styles.copyButton}
                      onPress={copySecretToClipboard}
                    >
                      {copied ? (
                        <CheckCircle2 size={20} color="#34C759" />
                      ) : (
                        <Copy size={20} color="#007AFF" />
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </Animated.View>
          )}

          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>Setup Instructions:</Text>
            <View style={styles.instructionsList}>
              <Text style={styles.instruction}>1. Install an authenticator app (Google Authenticator, Authy, etc.)</Text>
              <Text style={styles.instruction}>2. Scan the QR code or enter the secret manually</Text>
              <Text style={styles.instruction}>3. Enter the 6-digit code from your authenticator app to verify</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.proceedButton}
          onPress={handleProceed}
        >
          <Text style={styles.proceedButtonText}>Continue</Text>
        </TouchableOpacity>
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
  contentContainer: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#1A1A1A',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 24,
    fontFamily: 'Inter_600SemiBold',
    color: '#1A1A1A',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 24,
  },
  qrContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  qrHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  qrTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#1A1A1A',
  },
  qrWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F2F2F7',
  },
  qrCode: {
    width: 200,
    height: 200,
    backgroundColor: '#FFFFFF',
  },
  secretContainer: {
    backgroundColor: '#F2F2F7',
    padding: 16,
    borderRadius: 12,
  },
  secretLabel: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#8E8E93',
    marginBottom: 8,
  },
  secretRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  secretText: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#1A1A1A',
    flex: 1,
  },
  copyButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  instructionsContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
  },
  instructionsTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  instructionsList: {
    gap: 12,
  },
  instruction: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#1A1A1A',
    lineHeight: 24,
  },
  footer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  proceedButton: {
    backgroundColor: '#007AFF',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  proceedButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
  },
});