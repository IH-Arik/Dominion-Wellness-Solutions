import React from "react";
import { Tabs } from "expo-router";
import { View, Text, StyleSheet, Platform } from "react-native";
import { Home, Lightbulb, MessageCircle, BarChart2, User } from "lucide-react-native";
import { FontFamily } from "../../src/constants/typography";
import Colors from "../../src/constants/colors";

const TAB_ICONS: Record<string, React.FC<any>> = {
  index: Home,
  programs: Lightbulb,
  community: MessageCircle,
  report: BarChart2,
  profile: User,
};

const TAB_LABELS: Record<string, string> = {
  index: "Home",
  programs: "Insight",
  community: "Chat",
  report: "Report",
  profile: "Account",
};

interface TabIconProps {
  name: string;
  focused: boolean;
}

function TabIcon({ name, focused }: TabIconProps) {
  const Icon = TAB_ICONS[name] || Home;
  const color = focused ? "#0D2B6E" : "#94A3B8";

  return (
    <View style={styles.iconWrap}>
      <View style={styles.iconContent}>
        <Icon size={24} color={color} strokeWidth={focused ? 2.3 : 2} />
        <Text
          adjustsFontSizeToFit={true}
          style={[
            styles.label,
            {
              color,
              fontFamily: focused ? FontFamily.bold : FontFamily.medium,
            },
          ]}
        >
          {TAB_LABELS[name]}
        </Text>
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
        tabBarIcon: ({ focused }) => (
          <TabIcon name={route.name} focused={focused} />
        ),
      })}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="programs" options={{ title: "Insight" }} />
      <Tabs.Screen name="community" options={{ title: "Chat" }} />
      <Tabs.Screen name="report" options={{ title: "Report" }} />
      <Tabs.Screen name="profile" options={{ title: "Account" }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    height: Platform.OS === "ios" ? 88 : 74,
    paddingTop: 8,
    elevation: 0,
    shadowOpacity: 0,
  },
  iconWrap: {
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    width: "100%",
    position: "relative",
  },
  iconContent: {
    alignItems: "center",
    justifyContent: "center",
    width: 72,
    marginTop: Platform.OS === "ios" ? -15 : 0, 
  },
  label: {
    fontSize: 10,
    marginTop: 4,
    textAlign: "center",
  },
});
