import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useURL } from 'expo-linking';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '../lib/supabase';
import { Colors } from '../constants/colors';

// Signals to openAuthSessionAsync (if still waiting) that the redirect has
// arrived, so it can resolve and close the Custom Tab on Android.
WebBrowser.maybeCompleteAuthSession();

export default function AuthCallbackScreen() {
  const url = useURL();

  useEffect(() => {
    if (!url) return;
    // Exchange the PKCE authorization code for a session.
    // If AppContext.signInWithOAuthProvider already did this via the
    // WebBrowser return value, Supabase treats the duplicate call as a
    // no-op; onAuthStateChange will have already fired.
    supabase.auth.exchangeCodeForSession(url).finally(() => {
      router.replace('/(tabs)/perfil');
    });
  }, [url]);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color={Colors.primary} size="large" />
    </View>
  );
}
