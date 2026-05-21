import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/colors';
import { AppMode } from '../types';
import { t } from '../i18n';

interface ModeSwitchProps {
  mode: AppMode;
  onChange: (mode: AppMode) => void;
}

export default function ModeSwitch({ mode, onChange }: ModeSwitchProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.tab, mode === 'viajero' && styles.tabActive]}
        onPress={() => onChange('viajero')}
      >
        <Text style={styles.emoji}>🧭</Text>
        <Text style={[styles.label, mode === 'viajero' && styles.labelActive]}>{t.modeTraveler}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, mode === 'anfitrion' && styles.tabActive]}
        onPress={() => onChange('anfitrion')}
      >
        <Text style={styles.emoji}>🏠</Text>
        <Text style={[styles.label, mode === 'anfitrion' && styles.labelActive]}>{t.modeHost}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceVariant,
    borderRadius: 12,
    padding: 3,
    gap: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    gap: 5,
  },
  tabActive: {
    backgroundColor: Colors.primary,
  },
  emoji: {
    fontSize: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  labelActive: {
    color: Colors.white,
  },
});
