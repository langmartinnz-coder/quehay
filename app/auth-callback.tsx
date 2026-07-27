import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '../lib/supabase';
import { Colors } from '../constants/colors';

// NOTE: maybeCompleteAuthSession must NOT be called at module level.
// expo-router eagerly imports registered Stack screens on startup, so a
// module-level call runs before any OAuth session begins and corrupts the
// Chrome Custom Tabs activity manager state, preventing the browser from
// opening. It is called inside useEffect so it only runs when this screen
// actually mounts (i.e. after the quehay://auth-callback deep link arrives).

export default function AuthCallbackScreen() {
  const { code } = useLocalSearchParams<{ code?: string }>();

  useEffect(() => {
    // Signal to any in-flight openAuthSessionAsync that the redirect arrived.
    WebBrowser.maybeCompleteAuthSession();

    if (!code) {
      console.warn('[auth-callback] No code param in URL — redirecting to perfil');
      router.replace('/(tabs)/perfil');
      return;
    }

    console.log('[auth-callback] Exchanging PKCE code for session...');
    // Reconstruct the full callback URL that Supabase's PKCE exchange needs.
    const callbackUrl = `quehay://auth-callback?code=${code}`;
    supabase.auth.exchangeCodeForSession(callbackUrl)
      .then(({ error }) => {
        if (error) {
          console.warn('[auth-callback] exchangeCodeForSession error (may be duplicate):', error.message);
        } else {
          console.log('[auth-callback] Session exchanged successfully');
        }
      })
      .finally(() => {
        router.replace('/(tabs)/perfil');
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color={Colors.primary} size="large" />
    </View>
  );
}
