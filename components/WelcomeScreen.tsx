import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';
import { useLanguage } from '../store/LanguageContext';

export default function WelcomeScreen() {
  const { setLanguage, markLanguageChosen } = useLanguage();

  async function choose(lang: 'en' | 'es' | 'ca') {
    await setLanguage(lang);
    markLanguageChosen();
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoWrap}>
          <Text style={styles.logo}>
            <Text style={styles.logoPunct}>¿</Text>QuéHay<Text style={styles.logoPunct}>?</Text>
          </Text>
        </View>

        <Text style={styles.subtitle}>
          {'¿En qué idioma quieres la app?\nWhat language do you want?\nEn quin idioma vols l\'app?'}
        </Text>

        <View style={styles.buttons}>
          <TouchableOpacity style={styles.btn} onPress={() => choose('es')}>
            <Text style={styles.btnFlag}>🇪🇸</Text>
            <Text style={styles.btnText}>Español</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btn} onPress={() => choose('en')}>
            <Text style={styles.btnFlag}>🇬🇧</Text>
            <Text style={styles.btnText}>English</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btn} onPress={() => choose('ca')}>
            <Text style={styles.btnFlag}>🏴󠁥󠁳󠁣󠁴󠁿</Text>
            <Text style={styles.btnText}>Català</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 32,
  },
  logoWrap: {
    alignItems: 'center',
  },
  logo: {
    fontSize: 48,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -1,
  },
  logoPunct: {
    color: Colors.primary,
  },
  subtitle: {
    fontSize: 18,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
  },
  buttons: {
    width: '100%',
    gap: 14,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingVertical: 20,
    gap: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    shadowColor: '#2C1810',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  btnFlag: {
    fontSize: 28,
  },
  btnText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
});
