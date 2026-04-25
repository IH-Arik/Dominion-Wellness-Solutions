import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Search, ChevronDown, ChevronUp, UserCircle } from 'lucide-react-native';
import { FontFamily, FontSize } from '../src/constants/typography';
import Colors from '../src/constants/colors';
import { useGetHelpCenterQuery } from '../src/redux/rtk/authApi';

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}

const FAQItem = ({ question, answer, isOpen, onToggle }: FAQItemProps) => (
  <View style={[styles.faqCard, isOpen && styles.faqCardOpen]}>
    <TouchableOpacity style={styles.faqHeader} onPress={onToggle}>
      <Text style={[styles.faqQuestion, isOpen && styles.faqQuestionOpen]}>{question}</Text>
      {isOpen ? (
        <ChevronUp size={20} color="#1CC8B0" />
      ) : (
        <ChevronDown size={20} color="#1CC8B0" />
      )}
    </TouchableOpacity>
    {isOpen && (
      <View style={styles.faqBody}>
        <Text style={styles.faqAnswer}>{answer}</Text>
      </View>
    )}
  </View>
);

const HelpCenterScreen = () => {
  const router = useRouter();
  const [openIndex, setOpenIndex] = useState(0);
  const { data, isLoading } = useGetHelpCenterQuery();

  const helpData = data?.data;
  const faqs = helpData?.faqs || [];

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#0D2B6E" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help Center</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{helpData?.title || 'How can we help?'}</Text>
        <Text style={styles.description}>
          {helpData?.subtitle || 'Search our knowledge base or browse FAQs below'}
        </Text>

        <View style={styles.searchContainer}>
          <Search size={20} color="#94A3B8" style={styles.searchIcon} />
          <TextInput 
            style={styles.searchInput} 
            placeholder="Search for help topics..." 
            placeholderTextColor="#94A3B8"
          />
        </View>

        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        
        {faqs.map((faq, index) => (
          <FAQItem 
            key={index}
            question={faq.question}
            answer={faq.answer}
            isOpen={openIndex === index}
            onToggle={() => setOpenIndex(openIndex === index ? -1 : index)}
          />
        ))}

        <View style={styles.contactCard}>
          <View style={styles.contactContent}>
            <Text style={styles.contactTitle}>{helpData?.support_cta_title || 'Still need help?'}</Text>
            <Text style={styles.contactText}>
              {helpData?.support_cta_description || 'Our support team is available 24/7 to assist you with any questions.'}
            </Text>
            <TouchableOpacity 
              style={styles.contactButton}
              onPress={() => router.push('/contact-support')}
            >
              <Text style={styles.contactButtonText}>Contact Us</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.contactIconBg}>
            <UserCircle size={48} color="rgba(255, 255, 255, 0.2)" />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F6FCFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.lg,
    color: '#1E293B',
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 28,
    color: '#0D2B6E',
    textAlign: 'center',
    marginTop: 8,
  },
  description: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  searchContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: '#1E293B',
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    color: '#0D2B6E',
    marginBottom: 16,
  },
  faqCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  faqCardOpen: {
    borderColor: '#E6F9F6',
    backgroundColor: '#FBFEFE',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    minHeight: 64,
  },
  faqQuestion: {
    flex: 1,
    fontFamily: FontFamily.bold,
    fontSize: 15,
    color: '#0D2B6E',
    paddingRight: 16,
  },
  faqQuestionOpen: {
    color: '#0D2B6E',
  },
  faqBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  faqAnswer: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: '#64748B',
    lineHeight: 20,
  },
  contactCard: {
    backgroundColor: '#0D2B6E',
    borderRadius: 16,
    marginTop: 20,
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  contactContent: {
    flex: 1,
    zIndex: 1,
  },
  contactTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 20,
    color: Colors.white,
    marginBottom: 8,
    textAlign: 'center',
  },
  contactText: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 18,
  },
  contactButton: {
    backgroundColor: '#1CC8B0',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignSelf: 'center',
  },
  contactButtonText: {
    fontFamily: FontFamily.bold,
    fontSize: 15,
    color: Colors.white,
  },
  contactIconBg: {
    position: 'absolute',
    right: -10,
    top: -10,
    opacity: 0.5,
  },
});

export default HelpCenterScreen;
