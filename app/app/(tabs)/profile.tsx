import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert, ActivityIndicator, RefreshControl
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDeleteAccountMutation, useGetAccountSummaryQuery } from '../../src/redux/rtk/authApi';
import { useAppDispatch } from '../../src/redux/reduxHooks';
import { logout } from '../../src/redux/slices/authSlice';
import Colors from '../../src/constants/colors';
import { FontFamily, FontSize } from '../../src/constants/typography';
import Spacing from '../../src/constants/spacing';

import AccountHeader from '../../src/components/AccountHeader';
import ProfileInfoCard from '../../src/components/ProfileInfoCard';
import OrganizationCard from '../../src/components/OrganizationCard';
import PerformanceProfileCard from '../../src/components/PerformanceProfileCard';
import SettingsSupportList from '../../src/components/SettingsSupportList';
import ConfirmationModal from '../../src/components/ConfirmationModal';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isLogoutVisible, setIsLogoutVisible] = useState(false);
  const [isDeleteVisible, setIsDeleteVisible] = useState(false);

  const { data: summaryData, isLoading, isError, refetch } = useGetAccountSummaryQuery();
  const [deleteAccount, { isLoading: isDeleting }] = useDeleteAccountMutation();

  const handleLogout = () => {
    setIsLogoutVisible(false);
    dispatch(logout());
    router.replace('/(auth)/login');
  };

  const handleDeleteAccount = async () => {
    setIsDeleteVisible(false);
    try {
      const result = await deleteAccount().unwrap();
      if (result.success) {
        Alert.alert("Success", result.message);
        dispatch(logout());
        router.replace('/(auth)/login');
      }
    } catch (err: any) {
      Alert.alert(
        "Error", 
        err.data?.message || "Failed to delete account. Please try again."
      );
    }
  };

  if (isLoading && !summaryData) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading Profile...</Text>
      </SafeAreaView>
    );
  }

  const { profile, organization, performance_profile } = summaryData?.data || {
    profile: { name: '', email: '', age: null, profile_image: null },
    organization: { organization_name: null, organization_code: null, subtitle: null },
    performance_profile: { current_ops_score: 0, strongest_driver: null, focus_driver: null }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} color={Colors.primary} />
        }
      >
        <AccountHeader />
        <ProfileInfoCard profile={profile} />
        <OrganizationCard organization={organization} />
        <PerformanceProfileCard performance_profile={performance_profile} />
        <SettingsSupportList />
        
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={() => setIsLogoutVisible(true)}
          >
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => setIsDeleteVisible(true)}
          >
            <Text style={styles.deleteButtonText}>Delete Account</Text>
          </TouchableOpacity>
          
          <Text style={styles.versionText}>DWS Performance v2.4.1</Text>
        </View>
 
        <ConfirmationModal 
          visible={isLogoutVisible}
          title="Do you want to Log out?"
          onConfirm={handleLogout}
          onCancel={() => setIsLogoutVisible(false)}
        />

        <ConfirmationModal 
          visible={isDeleteVisible}
          title="Confirm deleting your account?"
          onConfirm={handleDeleteAccount}
          onCancel={() => setIsDeleteVisible(false)}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F6FCFB",
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#F6FCFB",
  },
  loadingText: {
    marginTop: 12,
    fontFamily: FontFamily.medium,
    color: '#64748B',
  },
  footer: {
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 20,
    marginTop: 8,
  },
  logoutButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#0D2B6E20',
    backgroundColor: '#F1F5F950',
    alignItems: 'center',
  },
  logoutButtonText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: '#0D2B6E',
  },
  deleteButton: {
    paddingVertical: 8,
  },
  deleteButtonText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: '#EF4444',
  },
  versionText: {
    fontFamily: FontFamily.medium,
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 10,
  },
});
