import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

export interface UserLocation {
  latitude: number;
  longitude: number;
}

export interface UseUserLocationResult {
  location: UserLocation | null;
  permissionGranted: boolean;
  loading: boolean;
}

export function useUserLocation(): UseUserLocationResult {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        // Check existing permission — no dialog on this call
        const { status: existing } = await Location.getForegroundPermissionsAsync();

        let granted = existing === 'granted';

        if (existing === 'undetermined') {
          // First use: ask once
          const { status } = await Location.requestForegroundPermissionsAsync();
          granted = status === 'granted';
        }

        if (!granted || cancelled) {
          setPermissionGranted(false);
          return;
        }

        setPermissionGranted(true);
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (!cancelled) {
          setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        }
      } catch {
        // Location unavailable (simulator, airplane mode, etc.) — fall back gracefully
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, []);

  return { location, permissionGranted, loading };
}
