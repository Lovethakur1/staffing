import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const BACKGROUND_LOCATION_TASK = 'BACKGROUND_LOCATION_TASK';

// Store shift info for the background task to use
let activeShiftId: string | null = null;
let activeApiBaseUrl: string | null = null;

/**
 * Define the background task at module level (required by expo-task-manager).
 * This runs even when the app is in the background / killed.
 * Wrapped in try/catch to prevent crashes if native modules aren't ready yet.
 */
try {
  TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
  if (error) {
    console.warn('[BG Location] Task error:', error.message);
    return;
  }

  const { locations } = data as { locations: Location.LocationObject[] };
  if (!locations || locations.length === 0) return;

  const latest = locations[locations.length - 1];
  const lat = latest.coords.latitude;
  const lng = latest.coords.longitude;

  // Read shift ID and API URL from SecureStore (persists across app restarts)
  const shiftId = await SecureStore.getItemAsync('bgLocationShiftId');
  const apiBase = await SecureStore.getItemAsync('bgLocationApiUrl');
  const token = await SecureStore.getItemAsync('authToken');

  if (!shiftId || !apiBase || !token) {
    return;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(`${apiBase}/shifts/${shiftId}/update-location`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ lat, lng }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    console.log(`[BG Location] Sent lat:${lat.toFixed(5)}, lng:${lng.toFixed(5)} → ${response.status}`);
  } catch (_) {
    // Network errors are expected when server is unreachable — silently ignore
  }
});
} catch (e) {
  console.warn('[BG Location] Failed to define background task:', e);
}

/**
 * Start background location tracking for a shift.
 * Call this when staff starts travel.
 */
export async function startBackgroundLocationTracking(
  shiftId: string,
  apiBaseUrl: string,
): Promise<boolean> {
  try {
    // Request foreground permission first
    const { status: fgStatus } = await Location.requestForegroundPermissionsAsync();
    if (fgStatus !== 'granted') {
      console.warn('[BG Location] Foreground permission denied');
      return false;
    }

    // Request background permission
    const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
    if (bgStatus !== 'granted') {
      console.warn('[BG Location] Background permission denied');
      return false;
    }

    // Store shift info so the background task can read it
    activeShiftId = shiftId;
    activeApiBaseUrl = apiBaseUrl;
    await SecureStore.setItemAsync('bgLocationShiftId', shiftId);
    await SecureStore.setItemAsync('bgLocationApiUrl', apiBaseUrl);

    // Check if already running
    const isRunning = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK).catch(() => false);
    if (isRunning) {
      console.log('[BG Location] Already running, updating stored shiftId');
      return true;
    }

    await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
      accuracy: Location.Accuracy.High,
      distanceInterval: 20,        // Update every 20 meters
      timeInterval: 10000,         // Or every 10 seconds
      deferredUpdatesInterval: 10000,
      showsBackgroundLocationIndicator: true, // iOS blue bar
      foregroundService: {
        notificationTitle: 'Extreme Staffing',
        notificationBody: 'Tracking your location for shift travel',
        notificationColor: '#1E3A5F',
      },
    });

    console.log('[BG Location] Started background tracking for shift:', shiftId);
    return true;
  } catch (err) {
    console.error('[BG Location] Failed to start:', err);
    return false;
  }
}

/**
 * Stop background location tracking.
 * Call this when staff arrives or ends travel.
 */
export async function stopBackgroundLocationTracking(): Promise<void> {
  try {
    const isRunning = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK).catch(() => false);
    if (isRunning) {
      await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
      console.log('[BG Location] Stopped background tracking');
    }

    activeShiftId = null;
    activeApiBaseUrl = null;
    await SecureStore.deleteItemAsync('bgLocationShiftId');
    await SecureStore.deleteItemAsync('bgLocationApiUrl');
  } catch (err) {
    console.error('[BG Location] Failed to stop:', err);
  }
}

/**
 * Check if background location is currently running.
 */
export async function isBackgroundLocationRunning(): Promise<boolean> {
  try {
    return await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
  } catch {
    return false;
  }
}
