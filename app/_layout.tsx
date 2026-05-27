import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from '../store/AppContext';
import { StatusBar } from 'expo-status-bar';
import { t } from '../i18n';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProvider>
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
      </AppProvider>
    </SafeAreaProvider>
  );
}
