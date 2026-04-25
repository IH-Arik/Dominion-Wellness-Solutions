import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, ChevronRight } from 'lucide-react-native';
import { FontFamily, FontSize } from '../src/constants/typography';
import Colors from '../src/constants/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDeleteAccountMutation, useGetAccountSummaryQuery } from '../src/redux/rtk/authApi';
import { useDispatch } from 'react-redux';
import { logout } from '../src/redux/slices/authSlice';
import { Alert } from 'react-native';
import Toast from 'react-native-toast-message';

const SettingsScreen = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { data: summaryData } = useGetAccountSummaryQuery();
  const [deleteAccount, { isLoading: isDeleting }] = useDeleteAccountMutation();

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          style: "destructive",
          onPress: () => {
            dispatch(logout());
            router.replace('/(auth)/login');
          }
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAccount().unwrap();
              Toast.show({
                type: 'success',
                text1: 'Account Deleted',
                text2: 'Your account has been successfully deleted.',
              });
              dispatch(logout());
              router.replace('/(auth)/login');
            } catch (error: any) {
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error?.data?.message || 'Failed to delete account.',
              });
            }
          }
        }
      ]
    );
  };

  const settingsItems = [
    { label: 'Change Password', onPress: () => router.push('/change-password') },
    { label: 'Terms of condition', onPress: () => router.push('/terms') },
    { label: 'Privacy Policy', onPress: () => router.push('/privacy') },
    { label: 'About Us', onPress: () => router.push('/about') },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account Settings</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.card}>
          {settingsItems.map((item, index) => (
            <React.Fragment key={index}>
              <TouchableOpacity style={styles.item} onPress={item.onPress}>
                <Text style={[styles.itemLabel, item.color ? { color: item.color } : {}]}>
                  {item.label}
                </Text>
                <ChevronRight size={20} color="#CBD5E1" />
              </TouchableOpacity>
              {index < settingsItems.length - 1 && <View style={styles.separator} />}
            </React.Fragment>
          ))}
        </View>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Version {summaryData?.data?.app_version || '1.0.0'}</Text>
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
    paddingTop: 16,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  itemLabel: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: '#1E293B',
  },
  separator: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 16,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 40,
  },
  versionText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: '#94A3B8',
  },
});

export default SettingsScreen;
