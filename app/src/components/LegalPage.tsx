import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { FontFamily, FontSize } from '../constants/typography';

import { ActivityIndicator } from 'react-native';
import { useGetPrivacyPolicyQuery, useGetTermsQuery, useGetAboutUsQuery } from '../redux/rtk/authApi';

interface LegalPageProps {
  title: string;
  type: 'privacy' | 'terms' | 'about';
}

const LegalPage = ({ title, type }: LegalPageProps) => {
  const router = useRouter();

  const privacyQuery = useGetPrivacyPolicyQuery(undefined, { skip: type !== 'privacy' });
  const termsQuery = useGetTermsQuery(undefined, { skip: type !== 'terms' });
  const aboutQuery = useGetAboutUsQuery(undefined, { skip: type !== 'about' });

  const currentQuery = type === 'privacy' ? privacyQuery : type === 'terms' ? termsQuery : aboutQuery;
  const { data, isLoading } = currentQuery;

  const points = data?.data?.items || [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={{ width: 40 }} />
      </View>

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#0D2B6E" />
        </View>
      ) : (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          {points.map((point, index) => (
            <View key={index} style={styles.pointRow}>
              <Text style={styles.pointNumber}>{index + 1}.</Text>
              <Text style={styles.pointText}>{point}</Text>
            </View>
          ))}
        </ScrollView>
      )}
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
  pointRow: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  pointNumber: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: '#334155',
    marginRight: 8,
    marginTop: 2,
  },
  pointText: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: '#334155',
    lineHeight: 20,
  },
});

export default LegalPage;
