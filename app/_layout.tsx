import { Stack } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from '../store/AppContext';
import { LanguageProvider, useLanguage } from '../store/LanguageContext';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../constants/colors';
import WelcomeScreen from '../components/WelcomeScreen';

function RootContent() {
  const { isFirstLaunch, langLoaded, t } = useLanguage();

  if (!langLoaded) {
    return <View style={{ flex: 1, backgroundColor: Colors.background }} />;
  }

  if (isFirstLaunch) {
    return <WelcomeScreen />;
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="evento/[id]"
          options={{
            headerShown: true,
            headerBackTitle: t.back,
            headerTitle: '',
            headerTransparent: true,
            headerTintColor: '#fff',
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <AppProvider>
          <RootContent />
        </AppProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
