import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { authApi } from '@/services/api';
import { useUser } from '@/contexts/UserContext';
import { savePassword } from '@/utils/secure-storage'; 

export default function LoginScreen() {
  const { updateUser } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Rate limiter states
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [countdownTimer, setCountdownTimer] = useState<NodeJS.Timeout | null>(null);

  // Handle countdown timer
  useEffect(() => {
    if (isLocked && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
      
      setCountdownTimer(timer);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setIsLocked(false);
      setFailedAttempts(0);
      setCountdown(30);
      if (countdownTimer) clearTimeout(countdownTimer);
    }
  }, [isLocked, countdown]);

  const handleLogin = async () => {
    setError(null);
    
    // Check if login is locked
    if (isLocked) {
      setError(`Too many failed attempts. Please wait ${countdown} seconds.`);
      return;
    }
    
    setIsLoading(true);

    // Basic validation
    if (!email || !password) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    try {
      const response = await authApi.login({ email, password });
      
      // Reset failed attempts on successful login
      setFailedAttempts(0);
      
      // Check if MFA is required
      if ('requireMfa' in response && response.requireMfa) {
        // Store password in secure storage instead of passing as param
        await savePassword(password);
        
        // Navigate to MFA verification with only necessary params
        router.push({
          pathname: '/mfa',
          params: {
            userId: response.userId.toString(),
            email
          }
        });
        return;
      }

      // Check if MFA needs to be set up
      if ('user' in response && !response.user.mfa_enabled) {
        // Navigate to MFA setup
        updateUser({
          id: response.user.id,
          firstName: response.user.firstName,
          lastName: response.user.lastName,
          email: response.user.email,
        });
        router.push('/setup-mfa');
        return;
      }

      // If no MFA required, proceed with normal login
      updateUser({
        id: response.user.id,
        firstName: response.user.firstName,
        lastName: response.user.lastName,
        email: response.user.email,
      });

      router.replace('/(tabs)');
    } catch (error) {
      // Increment failed attempts
      const newFailedAttempts = failedAttempts + 1;
      setFailedAttempts(newFailedAttempts);
      
      // Lock login after 2 failed attempts
      if (newFailedAttempts >= 2) {
        setIsLocked(true);
        setError(`Too many failed attempts. Please wait ${countdown} seconds.`);
      } else {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('An unexpected error occurred');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1642427749670-f20e2e76ed8c?w=800&auto=format&fit=crop&q=60' }}
        style={StyleSheet.absoluteFillObject}
        blurRadius={20}
      />
      <View style={styles.overlay} />

      <View style={styles.content}>
        <Animated.View 
          entering={FadeInDown.duration(1000).springify()}
          style={styles.header}
        >
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to access your account</Text>
        </Animated.View>

        <Animated.View 
          entering={FadeInUp.duration(1000).springify()}
          style={styles.form}
        >
          <View style={styles.inputContainer}>
            <Mail size={20} color="#007AFF" />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#8E8E93"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!isLoading && !isLocked}
            />
          </View>

          <View style={styles.inputContainer}>
            <Lock size={20} color="#007AFF" />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#8E8E93"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!isLoading && !isLocked}
            />
          </View>

          {isLocked && (
            <Animated.View 
              entering={FadeInUp.duration(500)}
              style={styles.lockoutContainer}
            >
              <AlertCircle size={20} color="#FF3B30" />
              <Text style={styles.lockoutText}>
                Account temporarily locked. Wait {countdown}s to try again.
              </Text>
            </Animated.View>
          )}

          <TouchableOpacity 
            style={[
              styles.button, 
              (isLoading || isLocked) && styles.buttonDisabled
            ]}
            onPress={handleLogin}
            activeOpacity={0.8}
            disabled={isLoading || isLocked}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.buttonText}>Sign In</Text>
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
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
    textAlign: 'center',
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    height: 56,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
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
    marginTop: 24,
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
  lockoutContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFECE9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  lockoutText: {
    color: '#FF3B30',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    marginLeft: 8,
    flex: 1,
  },
});