import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { supabase } from '../lib/supabase';
import { Colors } from '../constants/colors';

// NOTE: maybeCompleteAuthSession must NOT be called at module level.
// expo-router eagerly imports registered Stack screens on startup, so a
// module-level call runs before any OAuth session begins and corrupts the
// Chrome Custom Tabs activity manager state on Android.

export default function AuthCallbackScreen() {
  const url = Linking.useURL();

  useEffect(() => {
    // Signal to any in-flight openAuthSessionAsync that the redirect arrived.
    WebBrowser.maybeCompleteAuthSession();

    console.log('[auth-callback] Screen mounted. url:', url ?? 'null');

    let settled = false;
    function navigateToPerfil() {
      if (settled) return;
      settled = true;
      console.log('[auth-callback] Navigating to perfil');
      router.replace('/(tabs)/perfil');
    }

    // Wait for SIGNED_IN / INITIAL_SESSION regardless of which path sets the session
    // (AppContext via openAuthSessionAsync or this screen via deep link).
    // INITIAL_SESSION fires immediately if session already exists — handles the race
    // where AppContext completes setSession before this screen mounts.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[auth-callback] onAuthStateChange event:', event, '| session:', session ? session.user.email : 'null');
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session) {
        subscription.unsubscribe();
        clearTimeout(timeout);
        navigateToPerfil();
      }
    });

    // Implicit flow: tokens are in the URL hash fragment.
    // useURL() returns the full deep-link URL including the # portion.
    if (url) {
      const hash = url.split('#')[1] ?? '';
      const params = new URLSearchParams(hash);
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      const hashError = params.get('error_description') ?? params.get('error');

      if (hashError) {
        console.error('[auth-callback] OAuth error in hash:', hashError);
      } else if (accessToken && refreshToken) {
        console.log('[auth-callback] Tokens found in hash — calling setSession...');
        supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
          .then(({ error }) => {
            if (error) {
              console.error('[auth-callback] setSession error:', error.message);
            } else {
              console.log('[auth-callback] setSession success — waiting for onAuthStateChange');
            }
          });
      } else {
        console.warn('[auth-callback] URL present but no tokens in hash — relying on AppContext setSession or existing session');
      }
    } else {
      console.warn('[auth-callback] No URL yet — relying on AppContext setSession or existing session');
    }

    // Safety timeout: if SIGNED_IN never fires within 6 s, redirect anyway.
    const timeout = setTimeout(() => {
      console.warn('[auth-callback] Timeout waiting for SIGNED_IN — navigating to perfil without session');
      subscription.unsubscribe();
      navigateToPerfil();
    }, 6000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  // Re-run when url becomes available (useURL() may return null on first render).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color={Colors.primary} size="large" />
    </View>
  );
}
