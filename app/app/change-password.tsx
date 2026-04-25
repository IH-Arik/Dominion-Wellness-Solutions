import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Lock } from 'lucide-react-native';
import { FontFamily, FontSize } from '../src/constants/typography';
import Colors from '../src/constants/colors';
import { useChangePasswordMutation } from '../src/redux/rtk/authApi';
import Toast from 'react-native-toast-message';

interface PasswordFieldProps {
  label: string;
  placeholder: string;
}

const PasswordField = ({ label, placeholder, value, onChangeText }: PasswordFieldProps & { value: string; onChangeText: (text: string) => void }) => (
  <View style={styles.fieldContainer}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <View style={styles.inputContainer}>
      <Lock size={20} color="#94A3B8" style={styles.inputIcon} />
      <TextInput 
        style={styles.textInput} 
        placeholder={placeholder} 
        placeholderTextColor="#94A3B8"
        secureTextEntry
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  </View>
);

const ChangePasswordScreen = () => {
  const router = useRouter();
  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Required Fields',
        text2: 'Please fill in all password fields.',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Password Mismatch',
        text2: 'New password and confirm password do not match.',
      });
      return;
    }

    if (newPassword.length < 8) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Password',
        text2: 'New password must be at least 8 characters long.',
      });
      return;
    }

    try {
      await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      }).unwrap();

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Password updated successfully.',
      });
      router.back();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.data?.message || 'Failed to update password.',
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
        <Text style={styles.headerTitle}>Change Password</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          <Text style={styles.description}>
            Enter your current password and your new password to update your account security.
          </Text>

          <PasswordField 
            label="CURRENT PASSWORD" 
            placeholder="••••••••" 
            value={currentPassword}
            onChangeText={setCurrentPassword}
          />
          <PasswordField 
            label="NEW PASSWORD" 
            placeholder="••••••••" 
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <PasswordField 
            label="CONFIRM NEW PASSWORD" 
            placeholder="••••••••" 
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => router.back()}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.saveButton, isLoading && { opacity: 0.7 }]} 
              onPress={handleUpdatePassword}
              disabled={isLoading}
            >
              <Text style={styles.saveButtonText}>
                {isLoading ? 'Updating...' : 'Update Password'}
              </Text>
            </TouchableOpacity>
          </View>
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
    paddingTop: 16,
  },
  description: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 32,
  },
  fieldContainer: {
    marginBottom: 24,
  },
  fieldLabel: {
    fontFamily: FontFamily.bold,
    fontSize: 10,
    color: '#64748B',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  inputContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: '#1E293B',
    height: '100%',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#94A3B8',
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.white,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#0D2B6E',
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.white,
  },
});

export default ChangePasswordScreen;
