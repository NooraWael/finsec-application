import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  Dimensions,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ChevronLeft, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  ChevronRight,
  Shield,
  Flag,
  Eye
} from 'lucide-react-native';
import { router } from 'expo-router';
import Animated, { 
  FadeIn,
  FadeInDown,
  FadeOut,
  SlideInRight,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSequence
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface PhishingEmail {
  id: number;
  subject: string;
  sender: string;
  content: string;
  image: string;
  isPhishing: boolean;
  clues: {
    description: string;
    location: string;
  }[];
}

export default function PhishingEmailTest() {
  const [currentEmailIndex, setCurrentEmailIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [revealClues, setRevealClues] = useState(false);
  
  const scrollViewRef = useRef<ScrollView>(null);
  const buttonScale = useSharedValue(1);
  
  // Sample phishing emails for the test
  const phishingEmails: PhishingEmail[] = [
    {
      id: 1,
      subject: "URGENT: Your Account Has Been Compromised",
      sender: "securityteam@banknotice-alert.com",
      content: "Dear Valued Customer,\n\nWe have detected suspicious activity on your account. Your account may have been compromised. To protect your account, please verify your information immediately by clicking the link below:\n\nhttps://secure-banking-center.accountverify2024.com\n\nFailure to verify within 24 hours will result in your account being suspended.\n\nSincerely,\nBank Security Team",
      image: "/api/placeholder/800/300",
      isPhishing: true,
      clues: [
        {
          description: "The sender email is not from your bank's official domain",
          location: "Email address"
        },
        {
          description: "Creates urgency with threats of account suspension",
          location: "Message content"
        },
        {
          description: "Suspicious URL that doesn't match your bank's domain",
          location: "Link URL"
        },
        {
          description: "Generic greeting ('Valued Customer') rather than your name",
          location: "Greeting"
        }
      ]
    },
    {
      id: 2,
      subject: "Your Recent Transaction Receipt",
      sender: "receipts@mybank.com",
      content: "Hello Alex,\n\nThank you for your recent transaction. Your purchase of $24.99 at Coffee Shop on April 12, 2025 has been processed successfully.\n\nYou can view your full statement by logging in to your account at https://mybank.com/statements.\n\nIf you have any questions about this transaction, please contact our customer service at 1-800-555-0123.\n\nThank you for banking with us.\n\nMyBank Customer Service",
      image: "/api/placeholder/800/300",
      isPhishing: false,
      clues: [
        {
          description: "Official bank domain in email address",
          location: "Email address"
        },
        {
          description: "Personalized greeting with your name",
          location: "Greeting"
        },
        {
          description: "Specific transaction details that match your activities",
          location: "Transaction details"
        },
        {
          description: "Link to official website with correct domain",
          location: "URL"
        }
      ]
    },
    {
      id: 3,
      subject: "Payment Failed - Update Payment Information",
      sender: "payments@netflixaccounts.com",
      content: "Dear Customer,\n\nWe were unable to process your payment for your Netflix subscription. To avoid interruption of your service, please update your payment information immediately.\n\nClick here to update payment method: https://netflix-accounts-billing.com/payments\n\nYour subscription will be cancelled if payment information is not updated within 48 hours.\n\nNetflix Support Team",
      image: "/api/placeholder/800/300",
      isPhishing: true,
      clues: [
        {
          description: "Email is from 'netflixaccounts.com' not 'netflix.com'",
          location: "Email address"
        },
        {
          description: "Generic greeting instead of your account name",
          location: "Greeting"
        },
        {
          description: "Suspicious URL that doesn't match Netflix's domain",
          location: "Link URL"
        },
        {
          description: "Creates urgency and fear of service cancellation",
          location: "Message tone"
        }
      ]
    },
    {
      id: 4,
      subject: "Your Password Has Been Reset",
      sender: "no-reply@amazon.com",
      content: "Hello,\n\nWe're reaching out to confirm that your Amazon account password was recently reset. If you made this change, no further action is needed.\n\nIf you didn't request a password reset, please secure your account by visiting Amazon.com, clicking on 'Account & Lists', then 'Account', and finally 'Login & Security' to update your password.\n\nFor security, please do not reply to this email.\n\nThanks,\nAmazon Customer Service",
      image: "/api/placeholder/800/300",
      isPhishing: false,
      clues: [
        {
          description: "Official Amazon domain in email address",
          location: "Email address"
        },
        {
          description: "Doesn't ask you to click any links",
          location: "Content"
        },
        {
          description: "Directs you to log in through the official website yourself",
          location: "Instructions"
        },
        {
          description: "No urgent tone or threats",
          location: "Message tone"
        }
      ]
    },
    {
      id: 5,
      subject: "You've Received a Secure Document",
      sender: "docusign@notification.docusing.net",
      content: "You have a document waiting for review and signature.\n\nSender: HR Department\nSubject: Employment Contract Update\n\nCLICK HERE TO REVIEW DOCUMENT\n\nThis notification was sent to you by DocuSign on behalf of HR Department.\n\nIf you would rather not receive notifications, update your preferences.",
      image: "/api/placeholder/800/300",
      isPhishing: true,
      clues: [
        {
          description: "Misspelled domain ('docusing.net' instead of 'docusign.com')",
          location: "Email address"
        },
        {
          description: "Vague sender information without specific company name",
          location: "Sender details"
        },
        {
          description: "Generic 'CLICK HERE' instead of DocuSign's usual button format",
          location: "Call to action"
        },
        {
          description: "No authentication code typically included in real DocuSign emails",
          location: "Security features"
        }
      ]
    }
  ];
  
  const currentEmail = phishingEmails[currentEmailIndex];
  
  const handleAnswerSelection = (isPhishing: boolean) => {
    // Prevent multiple selections
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(isPhishing);
    setShowResult(true);
    
    // Update score if correct
    if (isPhishing === currentEmail.isPhishing) {
      setScore(score + 1);
      
      // Animate button on correct answer
      buttonScale.value = withSequence(
        withTiming(1.1, { duration: 200 }),
        withTiming(1, { duration: 200 })
      );
    }
  };
  
  const handleNext = () => {
    if (currentEmailIndex < phishingEmails.length - 1) {
      setCurrentEmailIndex(currentEmailIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setRevealClues(false);
      
      // Scroll to top
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    } else {
      setQuizCompleted(true);
    }
  };
  
  const handleRestart = () => {
    setCurrentEmailIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setQuizCompleted(false);
    setRevealClues(false);
  };
  
  const handleRevealClues = () => {
    setRevealClues(true);
  };
  
  // Animated styles
  const correctButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }],
    };
  });
  
  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBarBackground}>
        <View 
          style={[
            styles.progressBarFill, 
            { width: `${((currentEmailIndex + 1) / phishingEmails.length) * 100}%` }
          ]} 
        />
      </View>
      <Text style={styles.progressText}>
        Email {currentEmailIndex + 1} of {phishingEmails.length}
      </Text>
    </View>
  );
  
  const renderEmail = () => (
    <View style={styles.emailCard}>
      <View style={styles.emailHeader}>
        <Text style={styles.emailSubject}>{currentEmail.subject}</Text>
        <Text style={styles.emailSender}>From: {currentEmail.sender}</Text>
      </View>
      
      <Image 
        source={{ uri: currentEmail.image }} 
        style={styles.emailImage}
        resizeMode="cover"
      />
      
      <Text style={styles.emailContent}>{currentEmail.content}</Text>
    </View>
  );
  
  const renderAnswerButtons = () => (
    <View style={styles.answerButtonsContainer}>
      <Text style={styles.questionText}>Is this a phishing email?</Text>
      
      <View style={styles.buttonsRow}>
        <TouchableOpacity 
          style={[
            styles.answerButton, 
            styles.dangerButton,
            selectedAnswer === true && styles.selectedButton
          ]}
          onPress={() => handleAnswerSelection(true)}
          disabled={selectedAnswer !== null}
        >
          <AlertTriangle size={20} color="#FFFFFF" />
          <Text style={styles.answerButtonText}>Yes, it's phishing</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.answerButton, 
            styles.safeButton,
            selectedAnswer === false && styles.selectedButton
          ]}
          onPress={() => handleAnswerSelection(false)}
          disabled={selectedAnswer !== null}
        >
          <CheckCircle2 size={20} color="#FFFFFF" />
          <Text style={styles.answerButtonText}>No, it's legitimate</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  
  const renderResult = () => {
    if (!showResult) return null;
    
    const isCorrect = selectedAnswer === currentEmail.isPhishing;
    
    return (
      <Animated.View 
        entering={FadeInDown.duration(300)}
        style={[
          styles.resultContainer,
          isCorrect ? styles.correctResultContainer : styles.incorrectResultContainer
        ]}
      >
        <View style={styles.resultHeader}>
          {isCorrect ? (
            <>
              <CheckCircle2 size={24} color="#34C759" />
              <Text style={[styles.resultTitle, styles.correctText]}>Correct!</Text>
            </>
          ) : (
            <>
              <XCircle size={24} color="#FF3B30" />
              <Text style={[styles.resultTitle, styles.incorrectText]}>Incorrect</Text>
            </>
          )}
        </View>
        
        <Text style={styles.resultText}>
          This email is {currentEmail.isPhishing ? 'a phishing attempt' : 'legitimate'}.
        </Text>
        
        {!revealClues ? (
          <TouchableOpacity 
            style={styles.cluesButton}
            onPress={handleRevealClues}
          >
            <Eye size={16} color="#007AFF" />
            <Text style={styles.cluesButtonText}>
              {currentEmail.isPhishing ? 'Reveal Phishing Clues' : 'Why This Is Safe'}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.cluesContainer}>
            <Text style={styles.cluesTitle}>
              {currentEmail.isPhishing ? 'Phishing Indicators:' : 'Security Indicators:'}
            </Text>
            
            {currentEmail.clues.map((clue, index) => (
              <Animated.View 
                key={index}
                entering={SlideInRight.delay(index * 100).duration(300)}
                style={styles.clueItem}
              >
                <View style={[
                  styles.clueIndicator,
                  currentEmail.isPhishing ? styles.phishingIndicator : styles.safeIndicator 
                ]}>
                  {currentEmail.isPhishing ? (
                    <Flag size={14} color="#FFFFFF" />
                  ) : (
                    <CheckCircle2 size={14} color="#FFFFFF" />
                  )}
                </View>
                <View style={styles.clueTextContainer}>
                  <Text style={styles.clueDescription}>{clue.description}</Text>
                  <Text style={styles.clueLocation}>{clue.location}</Text>
                </View>
              </Animated.View>
            ))}
          </View>
        )}
        
        <Animated.View style={correctButtonStyle}>
          <TouchableOpacity 
            style={styles.nextButton}
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>
              {currentEmailIndex < phishingEmails.length - 1 ? 'Next Email' : 'See Results'}
            </Text>
            <ChevronRight size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    );
  };
  
  const renderResults = () => {
    const percentage = Math.round((score / phishingEmails.length) * 100);
    
    let resultText = '';
    let resultColor = '';
    
    if (percentage >= 80) {
      resultText = 'Excellent! You have a great eye for phishing attempts.';
      resultColor = '#34C759'; // green
    } else if (percentage >= 60) {
      resultText = 'Good job! You caught most of the phishing attempts.';
      resultColor = '#007AFF'; // blue
    } else {
      resultText = 'Keep practicing! Phishing can be tricky to spot.';
      resultColor = '#FF9500'; // orange
    }
    
    return (
      <Animated.View 
        entering={FadeIn.duration(400)}
        style={styles.finalResultsContainer}
      >
        <View style={styles.resultBadge}>
          <Shield size={48} color={resultColor} />
        </View>
        
        <Text style={styles.resultScoreTitle}>Your Phishing Detection Score</Text>
        
        <View style={styles.scoreDisplay}>
          <Text style={[styles.scoreValue, { color: resultColor }]}>{percentage}%</Text>
          <Text style={styles.scoreDetail}>
            You correctly identified {score} out of {phishingEmails.length} emails
          </Text>
        </View>
        
        <Text style={styles.resultFeedback}>{resultText}</Text>
        
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Remember these tips:</Text>
          <View style={styles.tipItem}>
            <AlertCircle size={16} color="#FF9500" />
            <Text style={styles.tipText}>Always check the sender's email address</Text>
          </View>
          <View style={styles.tipItem}>
            <AlertCircle size={16} color="#FF9500" />
            <Text style={styles.tipText}>Be wary of urgent requests or threats</Text>
          </View>
          <View style={styles.tipItem}>
            <AlertCircle size={16} color="#FF9500" />
            <Text style={styles.tipText}>Hover over links before clicking (or check destinations)</Text>
          </View>
          <View style={styles.tipItem}>
            <AlertCircle size={16} color="#FF9500" />
            <Text style={styles.tipText}>Look for personalization (or lack thereof)</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.restartButton}
          onPress={handleRestart}
        >
          <Text style={styles.restartButtonText}>Try Again</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.backToGuideButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backToGuideText}>Return to Security Guide</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Phishing Email Test</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {!quizCompleted ? (
          <>
            {renderProgressBar()}
            {renderEmail()}
            {!showResult && renderAnswerButtons()}
            {renderResult()}
          </>
        ) : (
          renderResults()
        )}
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
  progressContainer: {
    marginBottom: 16,
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
  emailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
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
  emailHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
    padding: 16,
  },
  emailSubject: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  emailSender: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#8E8E93',
  },
  emailImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#F2F2F7',
  },
  emailContent: {
    padding: 16,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: '#1A1A1A',
    lineHeight: 22,
  },
  answerButtonsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
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
  questionText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#1A1A1A',
    marginBottom: 16,
    textAlign: 'center',
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  answerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  dangerButton: {
    backgroundColor: '#FF3B30',
  },
  safeButton: {
    backgroundColor: '#34C759',
  },
  selectedButton: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  answerButtonText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  resultContainer: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
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
  correctResultContainer: {
    backgroundColor: '#F0FFF4',
    borderWidth: 1,
    borderColor: '#34C759',
  },
  incorrectResultContainer: {
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    marginLeft: 8,
  },
  correctText: {
    color: '#34C759',
  },
  incorrectText: {
    color: '#FF3B30',
  },
  resultText: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  cluesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#E5F1FF',
    borderRadius: 12,
    marginBottom: 16,
  },
  cluesButtonText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#007AFF',
    marginLeft: 8,
  },
  cluesContainer: {
    marginBottom: 16,
  },
  cluesTitle: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  clueItem: {
    flexDirection: 'row',
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
  },
  clueIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  phishingIndicator: {
    backgroundColor: '#FF3B30',
  },
  safeIndicator: {
    backgroundColor: '#34C759',
  },
  clueTextContainer: {
    flex: 1,
  },
  clueDescription: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  clueLocation: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#8E8E93',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 12,
  },
  nextButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
    marginRight: 8,
  },
  finalResultsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
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
  resultBadge: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  resultScoreTitle: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    color: '#1A1A1A',
    marginBottom: 16,
    textAlign: 'center',
  },
  scoreDisplay: {
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#F8F8F8',
    width: '100%',
    padding: 20,
    borderRadius: 12,
  },
  scoreValue: {
    fontSize: 36,
    fontFamily: 'Inter_700Bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  scoreDetail: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#8E8E93',
    textAlign: 'center',
  },
  resultFeedback: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 24,
  },
  tipsContainer: {
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    width: '100%',
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
  },
  tipsTitle: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#1A1A1A',
    marginLeft: 8,
    flex: 1,
  },
  restartButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  restartButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
  },
  backToGuideButton: {
    backgroundColor: '#F2F2F7',
    padding: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  backToGuideText: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#8E8E93',
  },
});