import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '../lib/supabase';
import { Colors } from '../constants/colors';

// NOTE: maybeCompleteAuthSession must NOT be called at module level.
// expo-router eagerly imports registered Stack screens on startup, so a
// module-level call runs before any OAuth session begins and corrupts the
// Chrome Custom Tabs activity manager state on Android.

export default function AuthCallbackScreen() {
  const { code } = useLocalSearchParams<{ code?: string }>();

  useEffect(() => {
    // Signal to any in-flight openAuthSessionAsync that the redirect arrived.
    WebBrowser.maybeCompleteAuthSession();

    console.log('[auth-callback] Screen mounted. code param:', code ? `${code.slice(0, 8)}...` : 'MISSING');

    let settled = false;
    function navigateToPerfil() {
      if (settled) return;
      settled = true;
      console.log('[auth-callback] Navigating to perfil');
      router.replace('/(tabs)/perfil');
    }

    // Wait for the SIGNED_IN event regardless of which code-exchange path wins
    // (AppContext via openAuthSessionAsync or this screen via deep link).
    // onAuthStateChange emits INITIAL_SESSION immediately if a session already
    // exists — so if AppContext already completed the exchange before this
    // screen mounted, we navigate right away without a duplicate exchange.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[auth-callback] onAuthStateChange event:', event, '| session:', session ? session.user.email : 'null');
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session) {
        subscription.unsubscribe();
        clearTimeout(timeout);
        navigateToPerfil();
      }
    });

    // Also attempt the PKCE exchange from this screen's side.
    // If AppContext already consumed the code, Supabase returns an error —
    // that is fine; the onAuthStateChange above will fire anyway.
    if (code) {
      const callbackUrl = `quehay://auth-callback?code=${encodeURIComponent(code)}`;
      console.log('[auth-callback] Attempting exchangeCodeForSession...');
      supabase.auth.exchangeCodeForSession(callbackUrl)
        .then(({ data, error }) => {
          if (error) {
            console.warn('[auth-callback] exchangeCodeForSession error:', error.message,
              '(OK if AppContext already exchanged the code)');
          } else {
            console.log('[auth-callback] exchangeCodeForSession success:', data.session?.user.email);
          }
        });
    } else {
      console.warn('[auth-callback] No code param — relying on AppContext exchange or existing session');
    }

    // Safety timeout: if SIGNED_IN never fires within 6 s (e.g. exchange failed
    // on both paths), redirect anyway so the user isn't stuck on a spinner.
    const timeout = setTimeout(() => {
      console.warn('[auth-callback] Timeout waiting for SIGNED_IN — navigating to perfil without session');
      subscription.unsubscribe();
      navigateToPerfil();
    }, 6000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color={Colors.primary} size="large" />
    </View>
  );
}
