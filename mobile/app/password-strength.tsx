import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Shield, Lock, Check, AlertTriangle, Info } from 'lucide-react-native';
import { router } from 'expo-router';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSequence, 
  withDelay, 
  Easing,
  FadeIn,
  FadeInDown
} from 'react-native-reanimated';

interface PasswordCriteria {
  id: string;
  description: string;
  validator: (password: string) => boolean;
  weight: number;
}

export default function PasswordStrengthChallenge() {
  const [password, setPassword] = useState('');
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);
  
  const progressWidth = useSharedValue(0);
  const shakingValue = useSharedValue(0);
  const scaleValue = useSharedValue(1);
  
  // Password evaluation criteria
  const passwordCriteria: PasswordCriteria[] = [
    {
      id: 'length',
      description: 'At least 12 characters long',
      validator: (pwd) => pwd.length >= 12,
      weight: 15
    },
    {
      id: 'uppercase',
      description: 'Contains uppercase letters (A-Z)',
      validator: (pwd) => /[A-Z]/.test(pwd),
      weight: 15
    },
    {
      id: 'lowercase',
      description: 'Contains lowercase letters (a-z)',
      validator: (pwd) => /[a-z]/.test(pwd),
      weight: 15
    },
    {
      id: 'numbers',
      description: 'Contains numbers (0-9)',
      validator: (pwd) => /[0-9]/.test(pwd),
      weight: 15
    },
    {
      id: 'special',
      description: 'Contains special characters (!@#$%^&*)',
      validator: (pwd) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pwd),
      weight: 20
    },
    {
      id: 'noSequential',
      description: 'No sequential patterns (123, abc)',
      validator: (pwd) => !/(123|234|345|456|567|678|789|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(pwd),
      weight: 10
    },
    {
      id: 'noCommon',
      description: 'Not a common password (password, qwerty)',
      validator: (pwd) => {
        const commonPwds = ['password', 'qwerty', '123456', 'admin', 'welcome', 'letmein', 'monkey', 'abc123', 'football', 'iloveyou'];
        return !commonPwds.includes(pwd.toLowerCase());
      },
      weight: 10
    }
  ];
  
  // Evaluate password strength when it changes
  useEffect(() => {
    if (password) {
      evaluatePassword();
    } else {
      setScore(0);
      progressWidth.value = withTiming(0, { duration: 300 });
      setShowScore(false);
    }
  }, [password]);
  
  // Evaluate password against criteria
  const evaluatePassword = () => {
    let newScore = 0;
    
    passwordCriteria.forEach(criterion => {
      if (criterion.validator(password)) {
        newScore += criterion.weight;
      }
    });
    
    // Set score and animate progress bar
    setScore(newScore);
    progressWidth.value = withTiming(newScore / 100, { 
      duration: 500,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1)
    });
    
    // Determine feedback based on score
    if (newScore < 30) {
      setFeedback('Weak - Your password is too simple.');
    } else if (newScore < 60) {
      setFeedback('Fair - Your password could be stronger.');
    } else if (newScore < 80) {
      setFeedback('Good - Your password meets basic security standards.');
    } else {
      setFeedback('Strong - Your password is well-protected!');
    }
    
    setShowScore(true);
  };
  
  // Get progress bar color based on score
  const getProgressColor = () => {
    if (score < 30) return '#FF3B30';
    if (score < 60) return '#FF9500';
    if (score < 80) return '#34C759';
    return '#007AFF';
  };
  
  // Check the password
  const handleCheckPassword = () => {
    if (score >= 80) {
      // Strong password celebration
      scaleValue.value = withSequence(
        withTiming(1.1, { duration: 200 }),
        withTiming(1, { duration: 200 })
      );
      setShowCelebration(true);
      
      // Reset celebration after delay
      setTimeout(() => {
        setShowCelebration(false);
      }, 3000);
    } else {
      // Shake animation for weak password
      shakingValue.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
    }
  };
  
  // Check if a criterion is met
  const isCriterionMet = (criterion: PasswordCriteria) => {
    return criterion.validator(password);
  };
  
  // Animated styles
  const progressBarStyle = useAnimatedStyle(() => {
    return {
      width: `${progressWidth.value * 100}%`,
      backgroundColor: getProgressColor()
    };
  });
  
  const passwordInputStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: shakingValue.value }],
    };
  });
  
  const checkButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleValue.value }],
    };
  });
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Password Strength Check</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          entering={FadeIn.duration(400)}
          style={styles.introCard}
        >
          <View style={styles.introIconContainer}>
            <Lock size={32} color="#007AFF" />
          </View>
          <Text style={styles.introTitle}>Create a Strong Password</Text>
          <Text style={styles.introText}>
            Strong passwords are your first line of defense against hackers. Enter a password below to 
            check its strength. Try to achieve a score of 80 or higher.
          </Text>
        </Animated.View>
        
        <Animated.View 
          entering={FadeInDown.delay(200).duration(400)}
          style={styles.passwordContainer}
        >
          <Text style={styles.inputLabel}>Enter a password to test:</Text>
          <Animated.View style={[passwordInputStyle]}>
            <TextInput
              style={styles.passwordInput}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="Try a password..."
              placeholderTextColor="#8E8E93"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </Animated.View>
          
          {showScore && (
            <View style={styles.scoreContainer}>
              <View style={styles.progressBarBackground}>
                <Animated.View style={[styles.progressBar, progressBarStyle]} />
              </View>
              <View style={styles.scoreTextContainer}>
                <Text style={[
                  styles.scoreText,
                  { color: getProgressColor() }
                ]}>
                  {score}/100
                </Text>
                <Text style={styles.feedbackText}>{feedback}</Text>
              </View>
            </View>
          )}
          
          <Animated.View style={checkButtonStyle}>
            <TouchableOpacity 
              style={styles.checkButton}
              onPress={handleCheckPassword}
            >
              <Text style={styles.checkButtonText}>Check Password</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
        
        <Animated.View 
          entering={FadeInDown.delay(400).duration(400)}
          style={styles.criteriaContainer}
        >
          <Text style={styles.criteriaTitle}>Password Requirements:</Text>
          
          {passwordCriteria.map((criterion, index) => (
            <Animated.View 
              key={criterion.id}
              entering={FadeInDown.delay(500 + index * 100).duration(300)}
              style={styles.criterionItem}
            >
              <View style={[
                styles.criterionIcon,
                password && isCriterionMet(criterion) ? styles.criterionMet : styles.criterionNotMet
              ]}>
                {password && isCriterionMet(criterion) ? (
                  <Check size={16} color="#FFFFFF" />
                ) : (
                  <Info size={16} color="#FFFFFF" />
                )}
              </View>
              <Text style={styles.criterionText}>{criterion.description}</Text>
            </Animated.View>
          ))}
        </Animated.View>
        
        {showCelebration && (
          <Animated.View 
            entering={FadeIn.duration(300)}
            style={styles.celebrationContainer}
          >
            <View style={styles.celebrationIcon}>
              <Shield size={40} color="#34C759" />
            </View>
            <Text style={styles.celebrationTitle}>Great Password!</Text>
            <Text style={styles.celebrationText}>
              This password meets high security standards and would be difficult to crack.
              Remember to use unique passwords for each of your accounts.
            </Text>
          </Animated.View>
        )}
        
        <Animated.View 
          entering={FadeInDown.delay(800).duration(400)}
          style={styles.tipsCard}
        >
          <View style={styles.tipsHeader}>
            <AlertTriangle size={20} color="#FF9500" />
            <Text style={styles.tipsTitle}>Pro Tips</Text>
          </View>
          <Text style={styles.tipsText}>
            • Consider using a password manager to generate and store strong passwords{'\n'}
            • Never reuse passwords across different sites{'\n'}
            • Change critical passwords regularly{'\n'}
            • Use passphrases - long, memorable phrases with modifications
          </Text>
        </Animated.View>
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
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#1A1A1A',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  introCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  introIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E5F1FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  introTitle: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  introText: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: '#666666',
    lineHeight: 22,
  },
  passwordContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  passwordInput: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  scoreContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#F2F2F7',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  scoreTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scoreText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#007AFF',
  },
  feedbackText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#8E8E93',
  },
  checkButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  checkButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
  },
  criteriaContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  criteriaTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  criterionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  criterionIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  criterionMet: {
    backgroundColor: '#34C759',
  },
  criterionNotMet: {
    backgroundColor: '#8E8E93',
  },
  criterionText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#1A1A1A',
  },
  celebrationContainer: {
    backgroundColor: '#F0FFF4',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#34C759',
  },
  celebrationIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#D1F7C4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  celebrationTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  celebrationText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
  },
  tipsCard: {
    backgroundColor: '#FFF9E6',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#1A1A1A',
    marginLeft: 8,
  },
  tipsText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#666666',
    lineHeight: 22,
  },
});