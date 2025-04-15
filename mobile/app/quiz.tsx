import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, StatusBar, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Shield, ChevronLeft, Check, X, ArrowRight } from 'lucide-react-native';
import { router } from 'expo-router';
import Animated, { FadeIn, FadeInRight, FadeOut } from 'react-native-reanimated';
import { LucideIcon } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface QuizQuestion {
  id: number;
  question: string;
  image?: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface QuizResult {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  level: string;
}

export default function QuizScreen() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);
  
  const quizQuestions: QuizQuestion[] = [
    {
      id: 1,
      question: "Which of the following is the strongest password?",
      image: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=400&h=300&auto=format&fit=crop", // Password visualization image
      options: [
        "password123",
        "Birthday1990!",
        "Tr$5Kl9*pQ2@zX",
        "myname2024"
      ],
      correctAnswer: 2,
      explanation: "Strong passwords use a mix of uppercase and lowercase letters, numbers, and special characters in a random arrangement. They should be at least 12 characters long and not contain easily guessable information."
    },
    {
      id: 2,
      question: "What makes two-factor authentication more secure?",
      image: "https://images.unsplash.com/photo-1669023414162-5bb06bbff0ec?q=80&w=3132&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // 2FA visualization
      options: [
        "It uses longer passwords",
        "It requires something you know and something you have",
        "It only works on WiFi connections",
        "It changes your password automatically"
      ],
      correctAnswer: 1,
      explanation: "Two-factor authentication adds an extra layer of security by requiring both something you know (like a password) and something you have (like your phone for a verification code), making it much harder for attackers to gain access."
    },
    {
      id: 3,
      question: "Which is a sign of a phishing attempt?",
      image: "https://images.unsplash.com/photo-1628763228722-b11a9c545ed7?q=80&w=2607&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Phishing example image
      options: [
        "Email from your bank's official domain",
        "Personalized content referencing your recent transactions",
        "Urgent message about account suspension requiring immediate action",
        "A message asking you to update your app"
      ],
      correctAnswer: 2,
      explanation: "Phishing attempts often create a false sense of urgency to panic you into taking action without thinking. They pressure you to click links or provide sensitive information immediately to 'avoid consequences.'"
    },
    {
      id: 4,
      question: "When using public WiFi, what is the safest approach for banking?",
      image: "https://images.unsplash.com/photo-1645725677294-ed0843b97d5c?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Public WiFi image
      options: [
        "Use incognito mode in your browser",
        "Use a VPN service",
        "Change your password frequently",
        "Only connect to networks with passwords"
      ],
      correctAnswer: 1,
      explanation: "A VPN (Virtual Private Network) encrypts your internet connection, protecting your data even on unsecured public WiFi. This prevents others from intercepting your sensitive information, like banking credentials."
    },
    {
      id: 5,
      question: "Why should you regularly review app permissions?",
      image: "https://images.unsplash.com/photo-1624969862644-791f3dc98927?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // App permissions visualization
      options: [
        "To improve app performance",
        "To limit unnecessary access to personal data",
        "To save battery life",
        "Apps rarely change their permissions"
      ],
      correctAnswer: 1,
      explanation: "Apps often request more permissions than they need. Regularly reviewing and limiting these permissions helps protect your personal data from being accessed unnecessarily, reducing privacy risks."
    },
    {
      id: 6,
      question: "How often should you review your banking transactions?",
      image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Account monitoring image
      options: [
        "Only when notified of suspicious activity",
        "Once a year during tax time",
        "Regularly, at least once a week",
        "Only when you notice money missing"
      ],
      correctAnswer: 2,
      explanation: "Regular monitoring helps you spot unauthorized transactions quickly. The sooner you identify fraud, the easier it is to resolve. Most banks have time limits for reporting fraudulent activity."
    },
  ];

  const quizResults: QuizResult[] = [
    {
      title: "Security Novice",
      description: "You're just starting your security journey. Review the security topics again and implement the tips to better protect your financial information.",
      icon: Shield,
      color: "#FF3B30",
      level: "Level 1"
    },
    {
      title: "Security Apprentice",
      description: "You have a good foundation in security basics. Keep learning and implementing more advanced security practices to level up your protection.",
      icon: Shield,
      color: "#FF9500",
      level: "Level 2"
    },
    {
      title: "Security Protector",
      description: "Great job! You have a solid understanding of digital security. You're well on your way to becoming a Data Protector Master.",
      icon: Shield,
      color: "#34C759",
      level: "Level 3"
    },
    {
      title: "Data Protector Master",
      description: "Impressive! You have mastered the essentials of digital banking security. Keep applying these practices to stay safe in your digital financial life.",
      icon: Shield,
      color: "#007AFF",
      level: "Master"
    }
  ];

  const handleBack = () => {
    if (quizCompleted) {
      // If quiz is completed, go back to results
      setQuizCompleted(false);
    } else if (isAnswered) {
      // If current question is answered but not submitted, reset selection
      setSelectedOption(null);
      setIsAnswered(false);
    } else if (currentQuestionIndex > 0) {
      // Go to previous question
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      // At first question, go back to info screen
      router.back();
    }
  };

  const handleOptionPress = (index: number) => {
    if (isAnswered) return;
    
    setSelectedOption(index);
    setIsAnswered(true);
    
    if (index === quizQuestions[currentQuestionIndex].correctAnswer) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setQuizCompleted(true);
      saveQuizResult();
    }
  };

  const saveQuizResult = async () => {
    try {
      const result = getResult();
      await AsyncStorage.setItem('securityLevel', result.level);
      console.log('Security level saved:', result.level);
    } catch (error) {
      console.error('Error saving security level:', error);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setQuizCompleted(false);
  };

  const getResult = (): QuizResult => {
    const percentage = (score / quizQuestions.length) * 100;
    
    if (percentage >= 90) return quizResults[3];
    if (percentage >= 70) return quizResults[2];
    if (percentage >= 40) return quizResults[1];
    return quizResults[0];
  };

  const renderQuestion = () => {
    const question = quizQuestions[currentQuestionIndex];
    
    return (
      <Animated.View 
        entering={FadeInRight.duration(300)}
        exiting={FadeOut.duration(200)}
        style={styles.questionContainer}
      >
        <View style={styles.progressContainer}>
          <View style={styles.progressBarBackground}>
            <View 
              style={[
                styles.progressBarFill, 
                { width: `${((currentQuestionIndex + 1) / quizQuestions.length) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            Question {currentQuestionIndex + 1}/{quizQuestions.length}
          </Text>
        </View>
        
        <Text style={styles.questionText}>{question.question}</Text>
        
        {question.image && (
          <Image 
            source={{ uri: question.image }} 
            style={styles.questionImage}
            resizeMode="cover"
          />
        )}
        
        <View style={styles.optionsContainer}>
          {question.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                selectedOption === index && (
                  index === question.correctAnswer
                    ? styles.correctOptionButton
                    : styles.incorrectOptionButton
                ),
                isAnswered && index === question.correctAnswer && styles.correctOptionButton
              ]}
              onPress={() => handleOptionPress(index)}
              disabled={isAnswered}
            >
              <Text style={[
                styles.optionText,
                selectedOption === index && (
                  index === question.correctAnswer
                    ? styles.correctOptionText
                    : styles.incorrectOptionText
                ),
                isAnswered && index === question.correctAnswer && styles.correctOptionText
              ]}>
                {option}
              </Text>
              
              {isAnswered && index === selectedOption && (
                index === question.correctAnswer ? (
                  <Check size={20} color="#FFFFFF" />
                ) : (
                  <X size={20} color="#FFFFFF" />
                )
              )}
              
              {isAnswered && index !== selectedOption && index === question.correctAnswer && (
                <Check size={20} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          ))}
        </View>
        
        {isAnswered && (
          <Animated.View 
            entering={FadeIn.duration(300)}
            style={styles.explanationContainer}
          >
            <Text style={styles.explanationTitle}>
              {selectedOption === question.correctAnswer ? "Correct! 🎉" : "Not quite right"}
            </Text>
            <Text style={styles.explanationText}>{question.explanation}</Text>
          </Animated.View>
        )}
        
        {isAnswered && (
          <TouchableOpacity 
            style={styles.nextButton}
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>
              {currentQuestionIndex < quizQuestions.length - 1 ? "Next Question" : "See Results"}
            </Text>
            <ArrowRight size={20} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </Animated.View>
    );
  };

  const renderResults = () => {
    const result = getResult();
    const percentage = Math.round((score / quizQuestions.length) * 100);
    
    return (
      <Animated.View 
        entering={FadeIn.duration(400)}
        style={styles.resultsContainer}
      >
        <View style={[styles.resultBadge, { backgroundColor: `${result.color}15` }]}>
          <result.icon size={48} color={result.color} />
        </View>
        
        <Text style={styles.resultTitle}>{result.title}</Text>
        
        <View style={styles.scoreContainer}>
          <Text style={[styles.scoreText, { color: result.color }]}>{percentage}%</Text>
          <Text style={styles.scoreLabel}>Correct Answers</Text>
          <Text style={styles.scoreDetail}>
            You got {score} out of {quizQuestions.length} questions right
          </Text>
        </View>
        
        <Text style={styles.resultDescription}>{result.description}</Text>
        
        <View style={styles.levelContainer}>
          <Text style={styles.levelLabel}>You've reached</Text>
          <View style={[styles.levelBadge, { backgroundColor: result.color }]}>
            <Text style={styles.levelText}>{result.level}</Text>
          </View>
        </View>
        
        <View style={styles.resultButtonsContainer}>
          <TouchableOpacity 
            style={styles.restartButton}
            onPress={handleRestart}
          >
            <Text style={styles.restartButtonText}>Try Again</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.finishButton, { backgroundColor: result.color }]}
            onPress={() => router.back()}
          >
            <Text style={styles.finishButtonText}>Return to Guide</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBack}
        >
          <ChevronLeft size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Security Quiz</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {quizCompleted ? renderResults() : renderQuestion()}
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
    padding: 20,
    paddingBottom: 40,
  },
  questionContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#F2F2F7',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#8E8E93',
  },
  questionText: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    color: '#1A1A1A',
    marginBottom: 16,
    lineHeight: 28,
  },
  questionImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 20,
  },
  optionsContainer: {
    marginTop: 8,
  },
  optionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#F2F2F7',
  },
  correctOptionButton: {
    backgroundColor: '#34C759',
    borderColor: '#34C759',
  },
  incorrectOptionButton: {
    backgroundColor: '#FF3B30',
    borderColor: '#FF3B30',
  },
  optionText: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#1A1A1A',
    flex: 1,
  },
  correctOptionText: {
    color: '#FFFFFF',
  },
  incorrectOptionText: {
    color: '#FFFFFF',
  },
  explanationContainer: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  explanationTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: '#666666',
    lineHeight: 22,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
  },
  nextButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
    marginRight: 8,
  },
  resultsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  resultBadge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E5F1FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  resultTitle: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    color: '#1A1A1A',
    marginBottom: 24,
    textAlign: 'center',
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
    padding: 20,
  },
  scoreText: {
    fontSize: 36,
    fontFamily: 'Inter_700Bold',
    color: '#007AFF',
  },
  scoreLabel: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#666666',
    marginTop: 8,
  },
  scoreDetail: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#8E8E93',
    marginTop: 8,
  },
  resultDescription: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  levelContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  levelLabel: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#8E8E93',
    marginBottom: 12,
  },
  levelBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#007AFF',
    borderRadius: 20,
  },
  levelText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
  },
  resultButtonsContainer: {
    flexDirection: 'row',
    width: '100%',
  },
  restartButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    marginRight: 8,
  },
  restartButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#666666',
  },
  finishButton: {
    flex: 2,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  finishButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
  },
});