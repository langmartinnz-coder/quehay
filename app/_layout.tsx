import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from '../store/AppContext';
import { StatusBar } from 'expo-status-bar';

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
              headerBackTitle: 'Volver',
              headerTitle: '',
              headerTransparent: true,
              headerTintColor: '#fff',
            }}
          />
          <Stack.Screen
            name="host/index"
            options={{
              headerShown: true,
              headerTitle: 'Panel Anfitrión',
              headerBackTitle: 'Volver',
              headerStyle: { backgroundColor: '#8E44AD' },
              headerTintColor: '#fff',
              headerTitleStyle: { fontWeight: '700' },
            }}
          />
          <Stack.Screen
            name="host/configurar"
            options={{
              headerShown: true,
              headerTitle: 'Configurar propiedad',
              headerBackTitle: 'Volver',
              headerStyle: { backgroundColor: '#8E44AD' },
              headerTintColor: '#fff',
              headerTitleStyle: { fontWeight: '700' },
            }}
          />
        </Stack>
      </AppProvider>
    </SafeAreaProvider>
  );
}
