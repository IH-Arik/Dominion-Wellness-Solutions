import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { FontFamily, FontSize } from '../constants/typography';
import Colors from '../constants/colors';

interface FilterSelectorProps {
  selectedWeek: string;
  selectedMonth: string;
  selectedYear: number;
  onFilterChange: (type: "week" | "month" | "year", value: string | number) => void;
}

const FilterSelector = ({ 
  selectedWeek, 
  selectedMonth, 
  selectedYear,
  onFilterChange 
}: FilterSelectorProps) => {
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const periodLabel = `${monthNames[Number(selectedMonth) - 1]} ${selectedYear}`;
  const weekLabel = selectedWeek === "all" ? "All Weeks" : `Week ${selectedWeek}`;

  const toggleWeek = () => {
    const next = selectedWeek === "all" ? "1" : (Number(selectedWeek) < 4 ? (Number(selectedWeek) + 1).toString() : "all");
    onFilterChange("week", next);
  };

  const toggleMonth = () => {
    const next = Number(selectedMonth) < 12 ? (Number(selectedMonth) + 1).toString() : "1";
    onFilterChange("month", next);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.darkButton} onPress={toggleMonth}>
        <Text style={styles.darkButtonText}>{periodLabel}</Text>
        <ChevronDown size={16} color={Colors.white} />
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.lightButton} onPress={toggleWeek}>
        <Text style={styles.lightButtonText}>{weekLabel}</Text>
        <ChevronDown size={16} color={Colors.gray} />
      </TouchableOpacity>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  darkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D2B6E',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  darkButtonText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.white,
  },
  lightButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  lightButtonText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: '#64748B',
  },
});

export default FilterSelector;
