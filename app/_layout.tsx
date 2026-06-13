import { Stack, router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ShareIntentProvider, useShareIntentContext } from 'expo-share-intent';
import { AppProvider } from '../store/AppContext';
import { LanguageProvider, useLanguage } from '../store/LanguageContext';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../constants/colors';
import WelcomeScreen from '../components/WelcomeScreen';

function RootContent() {
  const { isFirstLaunch, langLoaded } = useLanguage();
  const { isReady: shareIntentReady, hasShareIntent, shareIntent } = useShareIntentContext();
  const navigatedForIntentRef = useRef(false);

  // When an image share intent arrives after the navigation stack is ready,
  // navigate directly to the submit screen. The enviar screen handles loading.
  useEffect(() => {
    if (!shareIntentReady || !hasShareIntent) {
      navigatedForIntentRef.current = false;
      return;
    }
    if (isFirstLaunch || !langLoaded) return;
    if (navigatedForIntentRef.current) return;

    const file = shareIntent.files?.[0];
    if (!file || !file.mimeType.startsWith('image/')) return;

    navigatedForIntentRef.current = true;
    router.push('/(tabs)/enviar');
  }, [shareIntentReady, hasShareIntent, shareIntent, isFirstLaunch, langLoaded]);

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
          options={{ headerShown: false }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ShareIntentProvider>
      <SafeAreaProvider>
        <LanguageProvider>
          <AppProvider>
            <RootContent />
          </AppProvider>
        </LanguageProvider>
      </SafeAreaProvider>
    </ShareIntentProvider>
  );
}
