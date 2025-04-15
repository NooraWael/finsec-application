import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Shield, ArrowRight, AlertCircle } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { authApi } from '@/services/api';
import { useUser } from '@/contexts/UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Constants for rate limiting
const MAX_ATTEMPTS = 2;
const COOLDOWN_TIME = 60; // seconds

export default function MFAScreen() {
  const params = useLocalSearchParams<{
    userId: string;
    email: string;
    password: string;
  }>();
  
  const { updateUser, setAccessToken } = useUser();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [attempts, setAttempts] = useState(0);
  const [cooldownTimer, setCooldownTimer] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  // Check for existing attempt data when component mounts
  useEffect(() => {
    const checkAttemptStatus = async () => {
      try {
        if (!params.userId) return;
        
        const attemptData = await AsyncStorage.getItem(`mfa_attempts_${params.userId}`);
        if (attemptData) {
          const { count, timestamp } = JSON.parse(attemptData);
          const now = Date.now();
          const elapsedSeconds = Math.floor((now - timestamp) / 1000);
          
          // If we're within the cooldown period
          if (count >= MAX_ATTEMPTS && elapsedSeconds < COOLDOWN_TIME) {
            const remainingTime = COOLDOWN_TIME - elapsedSeconds;
            setAttempts(count);
            setIsLocked(true);
            setCooldownTimer(remainingTime);
          } else if (elapsedSeconds >= COOLDOWN_TIME) {
            // Reset if cooldown period has passed
            await AsyncStorage.removeItem(`mfa_attempts_${params.userId}`);
            setAttempts(0);
            setIsLocked(false);
          } else {
            // Set the current attempt count if within attempt limit
            setAttempts(count);
          }
        }
      } catch (err) {
        console.error('Error checking attempt status:', err);
      }
    };
    
    checkAttemptStatus();
  }, [params.userId]);

  // Timer for resend code functionality
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Timer for cooldown period
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (cooldownTimer > 0 && isLocked) {
      interval = setInterval(() => {
        setCooldownTimer((prev) => {
          const newValue = prev - 1;
          if (newValue <= 0) {
            setIsLocked(false);
            AsyncStorage.removeItem(`mfa_attempts_${params.userId}`);
            setAttempts(0);
          }
          return newValue;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [cooldownTimer, isLocked, params.userId]);

  const handleOtpChange = (text: string, index: number) => {
    if (text.length > 1) {
      text = text[0];
    }

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const recordFailedAttempt = async () => {
    try {
      if (!params.userId) return;
      
      const newAttemptCount = attempts + 1;
      setAttempts(newAttemptCount);
      
      if (newAttemptCount >= MAX_ATTEMPTS) {
        setIsLocked(true);
        setCooldownTimer(COOLDOWN_TIME);
      }
      
      // Store the attempt data
      await AsyncStorage.setItem(
        `mfa_attempts_${params.userId}`,
        JSON.stringify({
          count: newAttemptCount,
          timestamp: Date.now()
        })
      );
    } catch (err) {
      console.error('Error recording attempt:', err);
    }
  };

  const handleVerify = async () => {
    // If the account is locked, prevent verification
    if (isLocked) {
      return;
    }
    
    setError(null);
    setIsLoading(true);

    const otpCode = otp.join('');
    
    if (!params.userId || !params.email || !params.password) {
      setError('Missing required information');
      setIsLoading(false);
      return;
    }

    try {
      const response = await authApi.verifyMfa({
        userId: params.userId,
        otpCode,
        email: params.email,
        password: params.password
      });

      // Store the access token
      setAccessToken(response.access_token);

      // Update user context with the response
      updateUser({
        id: response.user.id.toString(),
        firstName: response.user.first_name,
        lastName: response.user.last_name,
        email: response.user.email,
      });

      // Fetch cards using the access token
      const cardsResponse = await authApi.getCards(response.access_token);
      console.log('Cards fetched:', cardsResponse);

      // Reset the attempts on successful verification
      if (params.userId) {
        await AsyncStorage.removeItem(`mfa_attempts_${params.userId}`);
      }

      router.replace('/(tabs)');
    } catch (error) {
      // Record the failed attempt
      await recordFailedAttempt();

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Invalid verification code');
      }
      setIsLoading(false);
    }
  };

  const handleResend = () => {
    if (timer === 0 && !isLocked) {
      setTimer(30);
      // You could implement resend OTP logic here
      setError(null);
    }
  };

  const isOtpComplete = otp.every(digit => digit !== '');
  
  const formatTimeDisplay = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=800&auto=format&fit=crop&q=60' }}
        style={StyleSheet.absoluteFillObject}
        blurRadius={20}
      />
      <View style={styles.overlay} />

      <View style={styles.content}>
        <Animated.View 
          entering={FadeInDown.duration(1000).springify()}
          style={styles.header}
        >
          <Shield size={48} color="#FFFFFF" />
          <Text style={styles.title}>Two-Factor Authentication</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code sent to your email
          </Text>
        </Animated.View>

        <Animated.View 
          entering={FadeInUp.duration(1000).springify()}
          style={styles.form}
        >
          {isLocked ? (
            <View style={styles.lockedContainer}>
              <AlertCircle size={48} color="#FF3B30" />
              <Text style={styles.lockedTitle}>Too many attempts</Text>
              <Text style={styles.lockedText}>
                You've made too many incorrect attempts. Please try again in {formatTimeDisplay(cooldownTimer)}.
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.otpContainer}>
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={ref => inputRefs.current[index] = ref}
                    style={styles.otpInput}
                    value={digit}
                    onChangeText={(text) => handleOtpChange(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    editable={!isLoading && !isLocked}
                  />
                ))}
              </View>

              <TouchableOpacity 
                style={[
                  styles.button,
                  (!isOtpComplete || isLoading || isLocked) && styles.buttonDisabled
                ]}
                onPress={handleVerify}
                disabled={!isOtpComplete || isLoading || isLocked}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={styles.buttonText}>Verify</Text>
                    <ArrowRight size={20} color="#FFFFFF" />
                  </>
                )}
              </TouchableOpacity>

              {error && (
                <Animated.Text 
                  entering={FadeInUp.duration(500)}
                  style={styles.errorText}
                >
                  {error}
                </Animated.Text>
              )}

              {attempts > 0 && attempts < MAX_ATTEMPTS && (
                <Text style={styles.attemptsText}>
                  {MAX_ATTEMPTS - attempts} attempt{MAX_ATTEMPTS - attempts !== 1 ? 's' : ''} remaining
                </Text>
              )}

              <TouchableOpacity 
                style={[styles.resendButton, (timer > 0 || isLocked) && styles.resendButtonDisabled]}
                onPress={handleResend}
                disabled={timer > 0 || isLocked}
              >
                <Text style={[styles.resendText, (timer > 0 || isLocked) && styles.resendTextDisabled]}>
                  {timer > 0 ? `Resend code in ${timer}s` : 'Resend code'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.8,
  },
  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  otpInput: {
    width: 45,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
    fontSize: 24,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
    color: '#1A1A1A',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonDisabled: {
    backgroundColor: '#007AFF80',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    marginTop: 16,
  },
  attemptsText: {
    color: '#FF9500',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    marginTop: 16,
  },
  resendButton: {
    alignItems: 'center',
    marginTop: 24,
    padding: 12,
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendText: {
    color: '#007AFF',
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
  resendTextDisabled: {
    color: '#8E8E93',
  },
  lockedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  lockedTitle: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    color: '#1A1A1A',
    marginTop: 16,
    marginBottom: 8,
  },
  lockedText: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#636366',
    textAlign: 'center',
    lineHeight: 22,
  },
});