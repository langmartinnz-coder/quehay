import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { useLanguage } from '../../store/LanguageContext';

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={styles.tabItem}>
      <Text style={[styles.tabEmoji, focused && styles.tabEmojiFocused]}>{emoji}</Text>
      <Text
        numberOfLines={1}
        style={[styles.tabLabel, { color: focused ? Colors.tab.active : Colors.tab.inactive }]}
      >
        {label}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          ...styles.tabBar,
          height: 70 + insets.bottom,
          paddingBottom: insets.bottom + 8,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t.tabHome,
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🏠" label={t.tabHome} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="mapa"
        options={{
          title: t.tabMap,
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🗺️" label={t.tabMap} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="enviar"
        options={{
          title: t.tabSubmit,
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="➕" label={t.tabSubmit} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: t.tabProfile,
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="👤" label={t.tabProfile} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.tab.background,
    borderTopColor: Colors.tab.border,
    borderTopWidth: 1,
    height: 70,
    paddingBottom: 8,
    paddingTop: 6,
  },
  tabItem: {
    alignItems: 'center',
    gap: 2,
  },
  tabEmoji: {
    fontSize: 22,
    opacity: 0.6,
  },
  tabEmojiFocused: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
});
