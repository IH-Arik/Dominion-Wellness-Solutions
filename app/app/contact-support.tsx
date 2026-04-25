import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, UserCircle, Lock } from 'lucide-react-native';
import { FontFamily, FontSize } from '../src/constants/typography';
import Colors from '../src/constants/colors';
import { useSubmitSupportRequestMutation, useGetAccountSummaryQuery } from '../src/redux/rtk/authApi';
import Toast from 'react-native-toast-message';
import { ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ContactSupportScreen = () => {
  const router = useRouter();
  const { data: summaryData } = useGetAccountSummaryQuery();
  const [submitRequest, { isLoading }] = useSubmitSupportRequestMutation();
  const [issue, setIssue] = React.useState('');

  const handleSubmit = async () => {
    if (!issue.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Required',
        text2: 'Please describe your issue.',
      });
      return;
    }

    try {
      await submitRequest({ issue: issue.trim() }).unwrap();
      Alert.alert(
        "Request Submitted",
        "We have received your request and will get back to you soon.",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.data?.message || 'Failed to submit support request.',
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contact Support</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.iconContainer}>
            <UserCircle size={40} color="#1CC8B0" />
          </View>

          <Text style={styles.title}>How can we help?</Text>
          <Text style={styles.description}>
            Our performance team typically responds within 2 hours.
          </Text>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>DESCRIBE YOUR ISSUE</Text>
            <View style={styles.textareaContainer}>
              <TextInput 
                style={styles.textarea} 
                placeholder="Please tell us about the issue you are experiencing..." 
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                value={issue}
                onChangeText={setIssue}
              />
            </View>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>EMAIL</Text>
            <View style={styles.inputContainer}>
              <TextInput 
                style={styles.textInput} 
                value={summaryData?.data?.profile?.email || ''}
                editable={false}
              />
              <Lock size={18} color="#94A3B8" />
            </View>
            <Text style={styles.fieldInfo}>This is the email associated with your performance account.</Text>
          </View>

          <TouchableOpacity 
            style={[styles.submitButton, isLoading && { opacity: 0.7 }]} 
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <>
                <Text style={styles.submitButtonText}>Submit Request</Text>
                <ArrowLeft size={18} color={Colors.white} style={{ transform: [{ rotate: '180deg' }], marginLeft: 8 }} />
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#E6F9F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 24,
    color: '#0D2B6E',
    marginBottom: 8,
  },
  description: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: '#64748B',
    marginBottom: 32,
    lineHeight: 20,
  },
  fieldContainer: {
    marginBottom: 24,
  },
  fieldLabel: {
    fontFamily: FontFamily.bold,
    fontSize: 10,
    color: '#334155',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  textareaContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    minHeight: 140,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  textarea: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: '#1E293B',
    // height: '100%',
  },
  inputContainer: {
    backgroundColor: '#EDF2F7', // Slightly grey for disabled look
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
  },
  textInput: {
    flex: 1,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: '#64748B',
    height: '100%',
  },
  fieldInfo: {
    fontFamily: FontFamily.regular,
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 8,
  },
  submitButton: {
    backgroundColor: '#0D2B6E',
    height: 56,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.white,
  },
});

export default ContactSupportScreen;
