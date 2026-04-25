import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Building2 } from "lucide-react-native";
import { FontFamily, FontSize } from "../constants/typography";
import Colors from "../constants/colors";

interface OrganizationCardProps {
  organization: {
    organization_name: string | null;
    organization_code: string | null;
    subtitle: string | null;
  };
}

const OrganizationCard = ({ organization }: OrganizationCardProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionLabel}>ORGANIZATION</Text>
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <Building2 size={24} color="#1CC8B0" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{organization.organization_name || 'Not Assigned'}</Text>
          <Text style={styles.subtitle}>
            {organization.subtitle || 'No Details Provided'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionLabel: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: "#94A3B8",
    marginBottom: 12,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#E0F2F1",
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    gap: 2,
    flex: 1,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: "#1E293B",
  },
  subtitle: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: "#94A3B8",
  },
});

export default OrganizationCard;
