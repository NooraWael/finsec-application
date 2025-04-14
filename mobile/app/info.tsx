import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ImageBackground, 
  Image, 
  Dimensions,
  Platform,
  Pressable
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Shield, 
  ChevronRight, 
  Lock, 
  Smartphone, 
  Key, 
  AlertTriangle, 
  Eye, 
  Wifi, 
  ChevronLeft,
  TrendingUp
} from 'lucide-react-native';
import { router } from 'expo-router';
import Animated, { 
  FadeInDown, 
  FadeIn, 
  SlideInRight, 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring, 
  withTiming, 
  Easing
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface SecurityLevel {
  level: string;
  title: string;
  color: string;
  description: string;
}

export default function InfoScreen() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [securityLevel, setSecurityLevel] = useState<SecurityLevel>({
    level: 'Level 1',
    title: 'Security Novice',
    color: '#FF3B30',
    description: 'Take the security quiz to level up and become a Data Protector Master!'
  });
  
  const buttonScale = useSharedValue(1);
  const headerOpacity = useSharedValue(0);
  
  // Security levels progression
  const securityLevels: Record<string, SecurityLevel> = {
    'Level 1': {
      level: 'Level 1',
      title: 'Security Novice',
      color: '#FF3B30',
      description: 'Take the security quiz to level up and become a Data Protector Master!'
    },
    'Level 2': {
      level: 'Level 2',
      title: 'Security Apprentice',
      color: '#FF9500',
      description: 'Good start! You have some security knowledge, but there\'s more to learn!'
    },
    'Level 3': {
      level: 'Level 3',
      title: 'Security Protector',
      color: '#34C759',
      description: 'Great progress! You\'re applying solid security practices to your banking.'
    },
    'Master': {
      level: 'Master',
      title: 'Data Protector Master',
      color: '#007AFF',
      description: 'Impressive! You\'ve mastered essential digital banking security practices.'
    }
  };
  
  // Security categories with visually appealing content for Gen Z
  const securityCategories = [
    { id: 'passwords', name: 'Passwords', icon: Lock, color: '#007AFF' },
    { id: '2fa', name: 'Two-Factor', icon: Key, color: '#34C759' },
    { id: 'phishing', name: 'Phishing', icon: AlertTriangle, color: '#FF9500' },
    { id: 'networks', name: 'Networks', icon: Wifi, color: '#5856D6' },
    { id: 'privacy', name: 'Privacy', icon: Smartphone, color: '#FF3B30' },
    { id: 'monitoring', name: 'Monitoring', icon: Eye, color: '#007AFF' },
  ];

  // Featured security tips
  const securityTips = [
    {
      id: 1,
      title: "Keep Your Banking App Updated",
      description: "Regular updates include critical security patches that protect you from newly discovered threats.",
      image: "/api/placeholder/800/500",
      category: "all",
      color: '#007AFF'
    },
    {
      id: 2,
      title: "Use Biometrics - They're Actually Secure!",
      description: "Your fingerprint or face scan is more secure than a simple password and way harder to hack.",
      image: "/api/placeholder/800/500",
      category: "passwords",
      color: '#007AFF'
    },
    {
      id: 3,
      title: "That Urgent Message? Probably Fake.",
      description: "Banks never ask for your full password or PIN via email, text, or phone calls.",
      image: "/api/placeholder/800/500",
      category: "phishing",
      color: '#FF9500'
    },
    {
      id: 4,
      title: "Public WiFi = Privacy Nightmare",
      description: "Never do banking on public WiFi unless you're using a trusted VPN.",
      image: "/api/placeholder/800/500",
      category: "networks",
      color: '#5856D6'
    },
    {
      id: 5,
      title: "2FA Makes Your Account Fort Knox",
      description: "Two-factor authentication makes your account 99% less likely to be hacked.",
      image: "/api/placeholder/800/500",
      category: "2fa",
      color: '#34C759'
    },
    {
      id: 6,
      title: "App Permissions - Less is More",
      description: "Banking apps don't need access to your contacts, photos, or location history.",
      image: "/api/placeholder/800/500",
      category: "privacy",
      color: '#FF3B30'
    },
    {
      id: 7,
      title: "Set Up Transaction Alerts",
      description: "Get notifications for every transaction to catch fraud immediately.",
      image: "/api/placeholder/800/500",
      category: "monitoring",
      color: '#007AFF'
    }
  ];

  // Interactive security tips
  const interactiveTips = [
    {
      id: 1,
      title: "Password Strength Challenge",
      description: "Try our interactive password strength meter to see how secure your passwords really are.",
      icon: Lock,
      color: '#007AFF',
      category: 'passwords',
      action: 'Try it',
      page: 'password-strength'
    },
    {
      id: 2,
      title: "Phishing Email Test",
      description: "Can you spot the signs of a phishing email? Test your skills with our interactive examples.",
      icon: AlertTriangle,
      color: '#FF9500',
      category: 'phishing',
      action: 'Take test'
    },
  ];

  // Load saved security level from AsyncStorage
  useEffect(() => {
    const loadSecurityLevel = async () => {
      try {
        const savedLevel = await AsyncStorage.getItem('securityLevel');
        if (savedLevel) {
          setSecurityLevel(securityLevels[savedLevel] || securityLevels['Level 1']);
        }
      } catch (error) {
        console.error('Error loading security level:', error);
      }
      
      // Start header animation
      headerOpacity.value = withTiming(1, {
        duration: 800,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
    };
    
    loadSecurityLevel();
  }, []);

  const handleQuizStart = () => {
    router.push('/quiz');
  };

  const handleCategoryPress = (category: string) => {
    setActiveCategory(category === activeCategory ? 'all' : category);
  };
  
  const handleBack = () => {
    router.back();
  };
  
  const handleInteractiveTipPress = (tipId: number) => {
   if (tipId === 1) {
        router.push('/password-strength');
   } else if (tipId === 2) {
    router.push('/phishing');
   }
  };

  const filteredTips = securityTips.filter(tip => 
    activeCategory === 'all' || tip.category === activeCategory || tip.category === 'all'
  );
  
  const filteredInteractiveTips = interactiveTips.filter(tip =>
    activeCategory === 'all' || tip.category === activeCategory
  );
  
  const animatedButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }]
    };
  });
  
  const animatedHeaderStyle = useAnimatedStyle(() => {
    return {
      opacity: headerOpacity.value
    };
  });

  const renderHeader = () => (
    <Animated.View style={[styles.headerContainer, animatedHeaderStyle]}>
      <ImageBackground 
        source={{ uri: "/api/placeholder/1000/500" }}
        style={styles.headerBg}
        imageStyle={{ borderRadius: 16, opacity: 0.85 }}
      >
        <View style={styles.headerOverlay}>
          <View style={styles.headerContent}>
            <Shield size={36} color="#FFFFFF" />
            <Text style={styles.headerTitle}>Banking Security Guide</Text>
            <Text style={styles.headerSubtitle}>
              Protect your money with these essential security tips
            </Text>
            <TouchableOpacity 
              style={styles.quizButton}
              onPress={handleQuizStart}
            >
              <Text style={styles.quizButtonText}>Test Your Knowledge</Text>
              <ChevronRight size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </Animated.View>
  );

  const renderCategories = () => (
    <View style={styles.categoriesContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesScroll}
      >
        <Animated.View entering={FadeIn.delay(200).duration(400)}>
          <TouchableOpacity
            style={[
              styles.categoryButton,
              activeCategory === 'all' && styles.categoryButtonActive
            ]}
            onPress={() => handleCategoryPress('all')}
          >
            <Text style={[
              styles.categoryButtonText,
              activeCategory === 'all' && styles.categoryButtonTextActive
            ]}>All</Text>
          </TouchableOpacity>
        </Animated.View>
        
        {securityCategories.map((category, index) => (
          <Animated.View 
            key={category.id}
            entering={FadeIn.delay(300 + index * 100).duration(400)}
          >
            <TouchableOpacity 
              style={[
                styles.categoryButton,
                activeCategory === category.id && styles.categoryButtonActive,
                { borderColor: category.color }
              ]}
              onPress={() => handleCategoryPress(category.id)}
            >
              <category.icon 
                size={16} 
                color={activeCategory === category.id ? '#FFFFFF' : category.color} 
                style={styles.categoryIcon} 
              />
              <Text style={[
                styles.categoryButtonText,
                activeCategory === category.id && styles.categoryButtonTextActive,
                { color: activeCategory === category.id ? '#FFFFFF' : category.color }
              ]}>{category.name}</Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );

  const renderInteractiveTips = () => (
    <View style={styles.interactiveTipsContainer}>
      <Text style={styles.sectionTitle}>Interactive Security Tools</Text>
      
      <View style={styles.interactiveGrid}>
        {filteredInteractiveTips.map((tip, index) => (
          <Animated.View
            key={tip.id}
            entering={SlideInRight.delay(index * 100).duration(400)}
            style={[styles.interactiveCard, { borderColor: tip.color }]}
          >
            <View style={[styles.interactiveIconContainer, { backgroundColor: `${tip.color}15` }]}>
              <tip.icon size={24} color={tip.color} />
            </View>
            <Text style={styles.interactiveTitle}>{tip.title}</Text>
            <Text style={styles.interactiveDescription} numberOfLines={2}>
              {tip.description}
            </Text>
            <Animated.View style={animatedButtonStyle}>
              <TouchableOpacity 
                style={[styles.interactiveButton, { backgroundColor: tip.color }]}
                onPress={() => handleInteractiveTipPress(tip.id)}
              >
                <Text style={styles.interactiveButtonText}>{tip.action}</Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        ))}
      </View>
      
      {filteredInteractiveTips.length === 0 && (
        <Text style={styles.noContentText}>
          No interactive tools available for this category. Try another!
        </Text>
      )}
    </View>
  );

  const renderFeaturedTips = () => (
    <View style={styles.tipsSectionContainer}>
      <Text style={styles.sectionTitle}>Security Essentials</Text>
      
      <View style={styles.tipsGrid}>
        {filteredTips.map((tip, index) => (
          <Animated.View
            key={tip.id}
            entering={FadeInDown.delay(index * 100).duration(400)}
            style={[styles.tipCard, { borderLeftColor: tip.color }]}
          >
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>{tip.title}</Text>
              <Text style={styles.tipDescription} numberOfLines={3}>{tip.description}</Text>
            </View>
          </Animated.View>
        ))}
      </View>

      {filteredTips.length === 0 && (
        <Text style={styles.noContentText}>
          No tips available for this category. Try another!
        </Text>
      )}
    </View>
  );

  const renderSecurityLevel = () => (
    <Animated.View 
      entering={FadeInDown.delay(600).duration(500)}
      style={styles.securityLevelContainer}
    >
      <Text style={styles.securityLevelTitle}>Your Security Level</Text>
      <View style={[styles.securityLevelCard, { borderColor: securityLevel.color }]}>
        <View style={styles.securityLevelHeader}>
          <View style={[styles.levelIconContainer, { backgroundColor: `${securityLevel.color}15` }]}>
            <Shield size={24} color={securityLevel.color} />
          </View>
          <View style={styles.levelTextContainer}>
            <Text style={styles.securityLevelText}>{securityLevel.title}</Text>
            <View style={[styles.levelBadge, { backgroundColor: securityLevel.color }]}>
              <Text style={styles.levelBadgeText}>{securityLevel.level}</Text>
            </View>
          </View>
          <TrendingUp size={20} color={securityLevel.color} />
        </View>
        <Text style={styles.securityLevelDescription}>
          {securityLevel.description}
        </Text>
        <TouchableOpacity 
          style={[styles.securityLevelButton, { backgroundColor: `${securityLevel.color}15` }]}
          onPress={handleQuizStart}
        >
          <Text style={[styles.securityLevelButtonText, { color: securityLevel.color }]}>
            Start Security Quiz
          </Text>
          <ChevronRight size={18} color={securityLevel.color} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.backButtonContainer}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBack}
        >
          <ChevronLeft size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Security Center</Text>
      </View>
      
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >
        {renderHeader()}
        {renderCategories()}
        {renderInteractiveTips()}
        {renderFeaturedTips()}
        {renderSecurityLevel()}
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Securing your financial future, one tip at a time.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  backButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    marginRight: 12,
  },
  screenTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#1A1A1A',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 40,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  headerBg: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
  },
  headerOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    height: '100%',
    justifyContent: 'center',
    padding: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
    marginTop: 12,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 8,
    textAlign: 'center',
    marginBottom: 16,
  },
  quizButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  quizButtonText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#FFFFFF',
    marginRight: 6,
  },
  categoriesContainer: {
    marginTop: 16,
  },
  categoriesScroll: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#007AFF',
    marginRight: 8,
    backgroundColor: 'transparent',
  },
  categoryButtonActive: {
    backgroundColor: '#007AFF',
  },
  categoryIcon: {
    marginRight: 6,
  },
  categoryButtonText: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: '#007AFF',
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
  },
  interactiveTipsContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  interactiveGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: -4,
  },
  interactiveCard: {
    width: (width - 40) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#007AFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  interactiveIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E5F1FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  interactiveTitle: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  interactiveDescription: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#666666',
    lineHeight: 16,
    marginBottom: 12,
  },
  interactiveButton: {
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center',
    backgroundColor: '#007AFF',
    alignSelf: 'flex-start',
  },
  interactiveButtonText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: '#FFFFFF',
  },
  tipsSectionContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  tipsGrid: {
    marginBottom: 8,
  },
  tipCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  tipContent: {
    padding: 12,
  },
  tipTitle: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  tipDescription: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: '#666666',
    lineHeight: 18,
  },
  securityLevelContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  securityLevelTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  securityLevelCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#007AFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  securityLevelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  levelIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  levelTextContainer: {
    flex: 1,
  },
  securityLevelText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  levelBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: '#007AFF',
  },
  levelBadgeText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: '#FFFFFF',
  },
  securityLevelDescription: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#666666',
    lineHeight: 20,
    marginBottom: 16,
  },
  securityLevelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E5F1FF',
    paddingVertical: 12,
    borderRadius: 12,
  },
  securityLevelButtonText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#007AFF',
    marginRight: 6,
  },
  footer: {
    alignItems: 'center',
    padding: 20,
    paddingTop: 32,
  },
  footerText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#8E8E93',
    textAlign: 'center',
  },
  noContentText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#8E8E93',
    textAlign: 'center',
    padding: 20,
  },
});